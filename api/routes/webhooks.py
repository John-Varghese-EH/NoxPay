from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import os
import httpx
import socket
import ipaddress
from urllib.parse import urlparse
from typing import Dict, Any
from supabase import create_client

from api.middleware.auth import verify_api_key
from api.middleware.rate_limit import rate_limit
from api.utils.hmac import sign_payload
from api.utils.security import validate_webhook_url

router = APIRouter(prefix="/api/v1/webhooks", tags=["Webhooks"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

def ensure_public_webhook_url(url: str) -> str:
    """
    Ensure that the given webhook URL uses http/https and resolves only to public IP addresses.
    Raises HTTPException if the URL is unsafe.
    """
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="Invalid webhook URL scheme. Only http and https are allowed.")

    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Invalid webhook URL: hostname is missing.")

    try:
        addrinfo_list = socket.getaddrinfo(hostname, parsed.port, type=socket.SOCK_STREAM)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Invalid webhook URL: hostname cannot be resolved.")

    for family, _, _, _, sockaddr in addrinfo_list:
        ip_str = sockaddr[0] if family == socket.AF_INET else sockaddr[0]
        ip_obj = ipaddress.ip_address(ip_str)
        if (
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_link_local
            or ip_obj.is_reserved
            or ip_obj.is_multicast
        ):
            raise HTTPException(status_code=400, detail="Webhook URL must resolve to a public IP address.")

    return url

class WebhookTestRequest(BaseModel):
    event_type: str = "ping"
    custom_data: Dict[str, Any] = {}

@router.post("/test", dependencies=[Depends(rate_limit)])
async def test_webhook(payload: WebhookTestRequest, request: Request, client: dict = Depends(verify_api_key)):
    """
    Sends a test webhook to the client's configured webhook_url.
    Uses the dedicated webhook_secret for HMAC signing (NOT the bcrypt hash).
    """
    webhook_url = client.get("webhook_url")
    if not webhook_url:
        raise HTTPException(status_code=400, detail="No webhook_url configured for this client.")
        
    try:
        validate_webhook_url(webhook_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    # Additional SSRF protection: ensure URL resolves only to public IPs.
    safe_webhook_url = ensure_public_webhook_url(webhook_url)
    
    # Use dedicated webhook_secret for HMAC signing
    webhook_secret = client.get("webhook_secret", "")
    if not webhook_secret:
        raise HTTPException(status_code=400, detail="No webhook_secret configured. Please rotate your webhook secret first.")

    ping_payload = {
        "event": payload.event_type,
        "data": payload.custom_data,
        "message": "NoxPay Webhook Test Ping"
    }

    signature = sign_payload(webhook_secret, ping_payload)
    
    headers = {
        "Content-Type": "application/json",
        "X-NoxPay-Signature": signature
    }

    try:
        async with httpx.AsyncClient() as http_client:
            # lgtm [py/full-ssrf]
            # codeql [py/full-ssrf]
            response = await http_client.post(safe_webhook_url, json=ping_payload, headers=headers, timeout=10.0)
            
        success = 200 <= response.status_code < 300
        return {
            "success": success,
            "status_code": response.status_code,
            "response_body": response.text[:200]
        }
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Webhook endpoint timed out after 10 seconds.")
    except httpx.ConnectError:
        raise HTTPException(status_code=502, detail="Could not connect to webhook endpoint.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to deliver webhook: {str(e)}")

@router.get("/logs", dependencies=[Depends(rate_limit)])
async def get_webhook_logs(limit: int = 50, request: Request = None, client: dict = Depends(verify_api_key)):
    """
    Fetches recent webhook delivery logs for the authenticated client.
    """
    if limit < 1 or limit > 200:
        limit = 50
    
    client_id = client.get("id")
    
    res = supabase.table("webhook_logs").select("*").eq("client_id", client_id).order("created_at", desc=True).limit(limit).execute()
    
    return {"logs": res.data}