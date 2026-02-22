import re
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, field_validator
import os
from datetime import datetime, timedelta
from typing import Optional
from supabase import create_client

from api.middleware.auth import verify_api_key
from api.middleware.rate_limit import rate_limit
from api.utils.upi import generate_upi_uri, generate_qr_base64

router = APIRouter(prefix="/api/v1/intents", tags=["Payment Intents"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

class CreateIntentRequest(BaseModel):
    amount: float
    currency: str = "UPI"
    order_id: str
    upi_vpa: Optional[str] = None  # Falls back to client's configured VPA

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("Amount must be greater than 0")
        if v > 1_000_000:
            raise ValueError("Amount cannot exceed ₹10,00,000")
        return round(v, 2)

    @field_validator("order_id")
    @classmethod
    def validate_order_id(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("order_id cannot be empty")
        if len(v) > 64:
            raise ValueError("order_id cannot exceed 64 characters")
        if not re.match(r"^[a-zA-Z0-9_\-]+$", v):
            raise ValueError("order_id must be alphanumeric with hyphens/underscores only")
        return v

class IntentResponse(BaseModel):
    id: str
    order_id: str
    amount: float
    currency: str
    status: str
    payment_uri: Optional[str] = None
    qr_code_base64: Optional[str] = None
    expires_at: datetime

@router.post("/create-payment", response_model=IntentResponse, dependencies=[Depends(rate_limit)])
async def create_intent(intent_req: CreateIntentRequest, request: Request, client: dict = Depends(verify_api_key)):
    """
    Creates a new payment intent and returns a UPI deep-link URI with QR code.
    """
    if intent_req.currency != "UPI":
        raise HTTPException(status_code=400, detail="Only UPI currency is currently supported for intent creation")
    
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    client_id = client.get("id")
    client_name = client.get("name")
    
    # Use client's configured VPA or the one provided in the request
    vpa = intent_req.upi_vpa or client.get("upi_vpa") or "noxpay@sbi"
    
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    
    intent_data = {
        "client_id": client_id,
        "amount": intent_req.amount,
        "currency": intent_req.currency,
        "order_id": intent_req.order_id,
        "upi_vpa": vpa,
        "status": "pending",
        "expires_at": expires_at.isoformat()
    }
    
    # Insert intent
    res = supabase.table("payment_intents").insert(intent_data).execute()
    
    if not res.data:
        raise HTTPException(status_code=500, detail="Failed to create payment intent")
        
    created_intent = res.data[0]
    
    # Generate UPI URI
    uri = generate_upi_uri(
        pa=vpa,
        pn=client_name,
        am=float(intent_req.amount),
        tr=intent_req.order_id
    )
    qr_base64 = generate_qr_base64(uri)
    
    return {
        "id": created_intent["id"],
        "order_id": created_intent["order_id"],
        "amount": created_intent["amount"],
        "currency": created_intent["currency"],
        "status": created_intent["status"],
        "payment_uri": uri,
        "qr_code_base64": qr_base64,
        "expires_at": created_intent["expires_at"]
    }

@router.get("/{order_id}", dependencies=[Depends(rate_limit)])
async def get_intent_status(order_id: str, request: Request, client: dict = Depends(verify_api_key)):
    """
    Polls the status of an existing payment intent by its order_id.
    Ensures the client only accesses their own intents.
    Auto-expires stale intents.
    """
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")

    client_id = client.get("id")
    
    res = supabase.table("payment_intents").select("*").eq("order_id", order_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=404, detail="Order ID not found")
        
    intent = res.data[0]
    
    if intent.get("client_id") != client_id:
        raise HTTPException(status_code=403, detail="Unauthorized access to this order")
    
    # Auto-expire stale pending intents
    if intent["status"] == "pending" and intent.get("expires_at"):
        expires_at = datetime.fromisoformat(intent["expires_at"].replace("Z", "+00:00"))
        if datetime.utcnow().replace(tzinfo=expires_at.tzinfo) > expires_at:
            supabase.table("payment_intents").update({"status": "expired"}).eq("id", intent["id"]).execute()
            intent["status"] = "expired"
        
    return {
        "id": intent["id"],
        "order_id": intent["order_id"],
        "amount": intent["amount"],
        "status": intent["status"],
        "created_at": intent["created_at"]
    }
