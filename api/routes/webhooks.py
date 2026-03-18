from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
import os
import httpx
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
            response = await http_client.post(webhook_url, json=ping_payload, headers=headers, timeout=10.0)
            
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
