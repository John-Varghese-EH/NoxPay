from fastapi import APIRouter, Depends, Query
from typing import Optional
from datetime import datetime, timedelta
from api.middleware.auth import verify_api_key
from api.middleware.rate_limit import rate_limit
from worker.matcher import supabase

router = APIRouter(prefix="/api/v1/analytics", tags=["Analytics"])

@router.get("/summary", dependencies=[Depends(rate_limit)])
async def get_analytics_summary(
    days: int = Query(7, ge=1, le=30),
    client: dict = Depends(verify_api_key)
):
    """
    Returns a summary of payment performance for the last X days.
    Includes volume, success rate, and active intent counts.
    """
    client_id = client.get("id")
    since = (datetime.utcnow() - timedelta(days=days)).isoformat()
    
    # 1. Total Volume (Success)
    vol_res = supabase.table("payment_intents") \
        .select("amount") \
        .eq("client_id", client_id) \
        .eq("status", "success") \
        .gte("created_at", since) \
        .execute()
    
    total_volume = sum(float(item['amount']) for item in vol_res.data) if vol_res.data else 0.0
    success_count = len(vol_res.data) if vol_res.data else 0
    
    # 2. Total Attempts (All statuses except pending if we want 'success rate' of closed ones)
    attempt_res = supabase.table("payment_intents") \
        .select("status") \
        .eq("client_id", client_id) \
        .neq("status", "pending") \
        .gte("created_at", since) \
        .execute()
    
    total_attempts = len(attempt_res.data) if attempt_res.data else 0
    success_rate = (success_count / total_attempts * 100) if total_attempts > 0 else 0.0
    
    # 3. Currently Pending
    pending_res = supabase.table("payment_intents") \
        .select("id", count="exact") \
        .eq("client_id", client_id) \
        .eq("status", "pending") \
        .execute()
    
    pending_count = pending_res.count if pending_res.count is not None else 0
    
    return {
        "period_days": days,
        "total_volume": round(total_volume, 2),
        "total_successful_tx": success_count,
        "total_closed_intents": total_attempts,
        "success_rate_percent": round(success_rate, 2),
        "active_pending_intents": pending_count
    }
