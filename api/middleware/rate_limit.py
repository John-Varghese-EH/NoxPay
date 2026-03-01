import time
import threading
from fastapi import Request, HTTPException
from collections import defaultdict

# Simple In-Memory Sliding Window Rate Limiter
# In production with multiple workers, replace with Redis.

# Structure: { client_id: [timestamp_of_request_1, ...] }
request_history: dict[str, list[float]] = defaultdict(list)
_lock = threading.Lock()

# Periodic cleanup interval (seconds)
_CLEANUP_INTERVAL = 120
_last_cleanup = time.time()

def _cleanup_stale_entries():
    """Remove all entries older than 60 seconds to prevent memory leak."""
    global _last_cleanup
    now = time.time()
    if now - _last_cleanup < _CLEANUP_INTERVAL:
        return
    _last_cleanup = now
    cutoff = now - 60.0
    stale_keys = []
    for key, timestamps in request_history.items():
        filtered = [t for t in timestamps if t > cutoff]
        if not filtered:
            stale_keys.append(key)
        else:
            request_history[key] = filtered
    for key in stale_keys:
        del request_history[key]

def rate_limit(request: Request):
    """
    Dependency to enforce rate limits per client based on their DB configured 'rate_limit' (requests/minute).
    Includes a 20% burst tolerance.
    """
    client = getattr(request.state, "client", None)
    if not client:
        return
        
    client_uuid = client.get("id")
    # Base limit from DB, default to 100 rpm
    base_limit = client.get("rate_limit", 100)
    # Allow 20% burst
    max_limit = int(base_limit * 1.2)
    
    current_time = time.time()
    window_start = current_time - 60.0
    
    with _lock:
        history = request_history[client_uuid]
        
        # Fast filter: remove stamps outside 60s window
        # We do this every request for the specific client for accuracy
        history = [t for t in history if t > window_start]
        
        if len(history) >= max_limit:
            request_history[client_uuid] = history
            # Calculate wait time until first request in window expires
            retry_after = int(60 - (current_time - history[0])) + 1
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded ({base_limit} rpm + burst). Try again later.",
                headers={"Retry-After": str(retry_after)}
            )
        
        history.append(current_time)
        request_history[client_uuid] = history
        
        # Periodic global cleanup for inactive clients
        _cleanup_stale_entries()
