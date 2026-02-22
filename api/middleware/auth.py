from fastapi import Request, HTTPException
from supabase import create_client
import os
from api.utils.security import verify_secret

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

async def verify_api_key(request: Request):
    """
    Dependency to verify X-Client-ID and X-Client-Secret headers.
    Checks the database to ensure the client exists and the secret matches the bcrypt hash.
    Sets the client data on request.state.client.
    """
    client_id = request.headers.get("X-Client-ID")
    client_secret = request.headers.get("X-Client-Secret")
    
    if not client_id or not client_secret:
        raise HTTPException(status_code=401, detail="Missing X-Client-ID or X-Client-Secret headers")
        
    if not supabase:
        raise HTTPException(status_code=500, detail="Database not configured")
        
    # Lookup client by ID
    res = supabase.table("clients").select("*").eq("client_id", client_id).execute()
    
    if not res.data:
        raise HTTPException(status_code=401, detail="Invalid Client ID")
        
    client_data = res.data[0]
    
    if not client_data.get("is_active"):
        raise HTTPException(status_code=403, detail="Client account is disabled")
        
    stored_hash = client_data.get("secret_hash", "")
    
    # Verify the provided secret against the stored bcrypt hash
    if not verify_secret(client_secret, stored_hash):
        raise HTTPException(status_code=401, detail="Invalid Client Secret")
        
    # Store client info for downstream routes
    request.state.client = client_data
    return client_data
