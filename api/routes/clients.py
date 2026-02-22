import re
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, field_validator
import uuid
import os
import secrets
from supabase import create_client

from api.utils.security import hash_secret

router = APIRouter(prefix="/api/v1/clients", tags=["Client Management"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

MASTER_API_KEY = os.getenv("MASTER_API_KEY")

def verify_master_key(x_master_key: str = Header(...)):
    """
    Middleware for internal dashboard -> API communication.
    Only the master backend should be able to register new clients or rotate secrets.
    """
    if not MASTER_API_KEY:
        raise HTTPException(status_code=500, detail="Server misconfiguration: MASTER_API_KEY is not set.")
    if x_master_key != MASTER_API_KEY:
        raise HTTPException(status_code=403, detail="Invalid Master API Key")

class RegisterClientRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3 or len(v) > 100:
            raise ValueError("Merchant name must be between 3 and 100 characters")
        if not re.match(r"^[a-zA-Z0-9\s\-_.]+$", v):
            raise ValueError("Merchant name contains invalid characters")
        return v

class RotateSecretRequest(BaseModel):
    client_id: str

@router.post("/")
async def register_client(req: RegisterClientRequest, _ = Depends(verify_master_key)):
    """
    Registers a new client/merchant. Called by the Dashboard backend.
    Returns the auto-generated Client ID, the raw API secret (shown once),
    and the raw webhook secret (shown once).
    """
    client_uuid = str(uuid.uuid4())
    raw_secret = f"sk_live_{secrets.token_urlsafe(32)}"
    raw_webhook_secret = f"whsec_{secrets.token_urlsafe(32)}"
    
    hashed_secret = hash_secret(raw_secret)
    
    data = {
        "name": req.name,
        "client_id": client_uuid,
        "secret_hash": hashed_secret,
        "webhook_secret": raw_webhook_secret,
    }
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    res = supabase.table("clients").insert(data).execute()
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to register client")
        
    return {
        "message": "Client registered successfully. Store both secrets safely — they will not be shown again.",
        "id": res.data[0]["id"],
        "client_id": client_uuid,
        "raw_secret": raw_secret,
        "webhook_secret": raw_webhook_secret,
    }

@router.post("/rotate-secret")
async def rotate_secret(req: RotateSecretRequest, _ = Depends(verify_master_key)):
    """
    Rotates the API secret for a given client_id. Invalidates the old secret immediately.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    raw_secret = f"sk_live_{secrets.token_urlsafe(32)}"
    hashed_secret = hash_secret(raw_secret)
    
    res = supabase.table("clients").update({"secret_hash": hashed_secret}).eq("client_id", req.client_id).execute()
    
    if not res.data:
         raise HTTPException(status_code=404, detail="Client ID not found")
         
    # Log the action
    audit_data = {
        "actor": "admin/dashboard",
        "action": "secret_rotated",
        "resource_type": "client",
        "resource_id": res.data[0]["id"]
    }
    supabase.table("audit_logs").insert(audit_data).execute()
    
    return {
        "message": "Secret rotated successfully.",
        "client_id": req.client_id,
        "raw_secret": raw_secret
    }

@router.post("/rotate-webhook-secret")
async def rotate_webhook_secret(req: RotateSecretRequest, _ = Depends(verify_master_key)):
    """
    Rotates the webhook signing secret for a given client_id.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    raw_webhook_secret = f"whsec_{secrets.token_urlsafe(32)}"
    
    res = supabase.table("clients").update({"webhook_secret": raw_webhook_secret}).eq("client_id", req.client_id).execute()
    
    if not res.data:
         raise HTTPException(status_code=404, detail="Client ID not found")
         
    audit_data = {
        "actor": "admin/dashboard",
        "action": "webhook_secret_rotated",
        "resource_type": "client",
        "resource_id": res.data[0]["id"]
    }
    supabase.table("audit_logs").insert(audit_data).execute()
    
    return {
        "message": "Webhook secret rotated successfully.",
        "client_id": req.client_id,
        "webhook_secret": raw_webhook_secret
    }
