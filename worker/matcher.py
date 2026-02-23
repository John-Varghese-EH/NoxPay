import logging
from typing import Optional
from supabase import create_client, Client
from worker.config import get_settings
from worker.parser import ParsedTransaction

logger = logging.getLogger(__name__)
settings = get_settings()

try:
    supabase: Client = create_client(settings.supabase_url, settings.supabase_key)
except Exception as e:
    logger.error(f"Failed to initialize Supabase client: {e}")
    supabase = None

def match_and_settle(tx: ParsedTransaction) -> bool:
    """
    1. Check for Idempotency (does UTR exist?)
    2. Insert into verified_transactions
    3. Look up pending payment_intents by amount & order_id
    4. Update intent to success
    5. Trigger Webhook delivery (async or queued)
    """
    if not supabase:
        logger.error("Supabase client not initialized.")
        return False
        
    try:
        # 1. Idempotency Check
        existing = supabase.table("verified_transactions").select("id").eq("utr", tx.utr).execute()
        if existing.data:
            logger.info(f"UTR {tx.utr} already processed. Skipping.")
            return True # Successfully ignored
            
        # 2. Try to find matching pending intent.
        # Strict matching: amount must match exactly, and order_id must match intent.
        # Sometimes remarks might be truncated, so we might need fuzzy matching or strict exact match.
        intent_query = supabase.table("payment_intents").select("*").eq("status", "pending").eq("amount", tx.amount)
        if tx.order_id:
            intent_query = intent_query.eq("order_id", tx.order_id)
            
        intents = intent_query.execute()
        
        matched_intent_id = None
        client_id_for_webhook = None
        
        if intents.data and len(intents.data) == 1:
            matched_intent = intents.data[0]
            matched_intent_id = matched_intent['id']
            client_id_for_webhook = matched_intent['client_id']
            logger.info(f"Matched UTR {tx.utr} to Intent {matched_intent['order_id']}")
        elif intents.data and len(intents.data) > 1:
            logger.warning(f"Multiple pending intents found for amount {tx.amount} and order {tx.order_id}. Manual intervention needed.")
        else:
            logger.warning(f"No pending intent matched for UTR {tx.utr}, Amount {tx.amount}, Order {tx.order_id}")

        # 3. Insert transaction
        tx_data = {
            "utr": tx.utr,
            "amount": float(tx.amount),
            "bank_source": tx.bank_source,
            "payment_intent_id": matched_intent_id,
            "metadata": {"sender_vpa": tx.sender_vpa}
        }
        res_insert = supabase.table("verified_transactions").insert(tx_data).execute()
        
        # 4. Update Intent Status
        if matched_intent_id:
            supabase.table("payment_intents").update({"status": "success"}).eq("id", matched_intent_id).execute()
            
            # 5. Trigger Webhook delivery
            from worker.webhook import deliver_webhook
            import asyncio
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(deliver_webhook(client_id_for_webhook, matched_intent_id))
            except RuntimeError:
                # If no running loop is found (which shouldn't happen if called from async process_email)
                asyncio.run(deliver_webhook(client_id_for_webhook, matched_intent_id))
            
        return True

    except Exception as e:
        logger.error(f"Error in match_and_settle for UTR {tx.utr}: {e}")
        return False
