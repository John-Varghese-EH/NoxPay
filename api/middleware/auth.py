from fastapi import Request, HTTPException
from supabase import create_client
import os
import time
from api.utils.security import verify_secret

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

# Simple In-Memory Cache for Auth: { client_id: (client_data, expiry_timestamp) }
_auth_cache: dict[str, tuple[dict, float]] = {}
_CACHE_TTL = 60.0 # 1 minute

async def verify_api_key(request: Request):
    """
    Dependency to verify X-Client-ID and X-Client-Secret headers.
    Checks the database to ensure the client exists and the secret matches the bcrypt hash.
    Sets the client data on request.state.client.
    Includes IP Whitelisting and TTL Caching for performance.
    """
    client_id = request.headers.get("X-Client-ID")
    client_secret = request.headers.get("X-Client-Secret")
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=401, detail="Missing X-Client-ID or X-Client-Secret headers")
        
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
    
    client_data = None
    now = time.time()
    
    # 1. Check Cache
    if client_id in _auth_cache:
        cached_data, expiry = _auth_cache[client_id]
        if now < expiry:
            client_data = cached_data
            
    # 2. Database Lookup if not in cache or expired
    if not client_data:
        res = supabase.table("clients").select("*").eq("client_id", client_id).execute()
        if not res.data:
            raise HTTPException(status_code=401, detail="Invalid Client ID")
        client_data = res.data[0]
        
        # Verify the provided secret against the stored bcrypt hash (Only on DB hit)
        stored_hash = client_data.get("secret_hash", "")
        if not verify_secret(client_secret, stored_hash):
            raise HTTPException(status_code=401, detail="Invalid Client Secret")
            
        # Update Cache
        _auth_cache[client_id] = (client_data, now + _CACHE_TTL)
        
    # 3. IP Whitelisting Check
    allowed_ips = client_data.get("allowed_ips", [])
    if allowed_ips:
        client_ip = request.client.host
        if client_ip not in allowed_ips:
            raise HTTPException(status_code=403, detail=f"IP Address {client_ip} is not whitelisted.")
            
    if not client_data.get("is_active"):
        raise HTTPException(status_code=403, detail="Client account is disabled")
        
    # Store client info for downstream routes
    request.state.client = client_data
    return client_data
