import hmac
import hashlib
import json
import logging
import asyncio
import time
import httpx
from worker.config import get_settings
from worker.matcher import supabase

logger = logging.getLogger(__name__)

async def deliver_webhook(client_id: str, payment_intent_id: str):
    """
    Fetches client webhook_url and webhook_secret from DB.
    Signs payload with HMAC-SHA256 using the dedicated webhook_secret.
    POSTs to client with exponential backoff retry.
    Logs result to webhook_logs table.
    """
    if not supabase:
        logger.error("Supabase not initialized, cannot deliver webhook.")
        return

    try:
        # Get client details — use webhook_secret (NOT secret_hash which is bcrypt)
        client_res = supabase.table("clients").select("webhook_url, webhook_secret").eq("id", client_id).execute()
        if not client_res.data or not client_res.data[0].get('webhook_url'):
            logger.info(f"No webhook URL configured for client {client_id}")
            return
            
        client_data = client_res.data[0]
        webhook_url = client_data['webhook_url']
        webhook_secret = client_data.get('webhook_secret', '')
        
        if not webhook_secret:
            logger.error(f"No webhook_secret configured for client {client_id}. Cannot sign payload.")
            return
        
        # Get intent details
        intent_res = supabase.table("payment_intents").select("*").eq("id", payment_intent_id).execute()
        if not intent_res.data:
            logger.error(f"Intent {payment_intent_id} not found.")
            return
            
        intent_data = intent_res.data[0]
        
        timestamp = str(int(time.time()))
        
        payload = {
            "event": "payment.success",
            "data": {
                "order_id": intent_data['order_id'],
                "amount": float(intent_data['amount']),
                "currency": intent_data['currency'],
                "status": intent_data['status'],
                "created_at": intent_data['created_at']
            }
        }
        
        payload_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')
        
        # Sign with timestamp for replay protection: HMAC(secret, timestamp.payload)
        signing_input = f"{timestamp}.".encode('utf-8') + payload_bytes
        signature = hmac.new(webhook_secret.encode('utf-8'), signing_input, hashlib.sha256).hexdigest()
        
        headers = {
            "Content-Type": "application/json",
            "X-NoxPay-Signature": signature,
            "X-NoxPay-Timestamp": timestamp,
        }

        # Exponential backoff retry loop (max 3 attempts)
        max_attempts = 3
        base_delay = 2

        for attempt in range(1, max_attempts + 1):
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(webhook_url, content=payload_bytes, headers=headers, timeout=10.0)
                
                status_code = response.status_code
                success = 200 <= status_code < 300
                
                log_data = {
                    "client_id": client_id,
                    "payment_intent_id": payment_intent_id,
                    "url": webhook_url,
                    "payload": payload,
                    "response_code": status_code,
                    "attempts": attempt,
                    "status": "delivered" if success else ("retrying" if attempt < max_attempts else "failed")
                }
                
                supabase.table("webhook_logs").insert(log_data).execute()
                
                if success:
                    logger.info(f"Webhook delivered successfully to {webhook_url}")
                    return
                else:
                    logger.warning(f"Webhook delivery failed (HTTP {status_code}) to {webhook_url}")
                    
            except httpx.RequestError as e:
                logger.error(f"Network error delivering webhook to {webhook_url}: {e}")
                
            if attempt < max_attempts:
                delay = base_delay ** attempt
                logger.info(f"Retrying webhook delivery in {delay} seconds...")
                await asyncio.sleep(delay)
                
        # Final failure log
        log_data = {
            "client_id": client_id,
            "payment_intent_id": payment_intent_id,
            "url": webhook_url,
            "payload": payload,
            "response_code": None,
            "attempts": max_attempts,
            "status": "failed"
        }
        supabase.table("webhook_logs").insert(log_data).execute()
        logger.error(f"Webhook delivery permanently failed after {max_attempts} attempts.")
            
    except Exception as e:
        logger.error(f"Unexpected error in deliver_webhook: {e}")
