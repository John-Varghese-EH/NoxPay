import asyncio
import logging
import sys
from imap_tools import MailBox, AioMailBox, AND
from worker.config import get_settings
from worker.security import is_secure_email
from worker.parser import ParserRegistry
from worker.matcher import match_and_settle
from worker.blockchain import BlockchainPoller

# Setup Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("VoidPay-Worker")
settings = get_settings()

async def process_email(msg):
    """Processes a single incoming bank email."""
    logger.info(f"Processing new email from {msg.from_}: {msg.subject}")
    
    if not is_secure_email(msg):
        logger.warning(f"Email from {msg.from_} failed security checks. Discarding.")
        return

    # Extract plain text or HTML body
    body = msg.text or msg.html
    if not body:
        logger.warning("Empty email body. Skipping.")
        return
        
    parsed_tx = ParserRegistry.process(body)
    
    if parsed_tx:
        success = match_and_settle(parsed_tx)
        if success:
            logger.info(f"Successfully processed transaction for UTR {parsed_tx.utr}")
        else:
            logger.error(f"Failed to settle transaction for UTR {parsed_tx.utr}")
    else:
        logger.warning("Failed to parse transaction details from email.")

async def imap_idle_loop():
    """
    Listens to Gmail via IMAP IDLE.
    Implements an exponential backoff strategy if the connection drops.
    """
    max_backoff = 300 # 5 minutes max delay
    backoff = 2
    
    while True:
        try:
            logger.info(f"Connecting to IMAP {settings.imap_server}...")
            
            # Note: The true async way to use imap_tools is typically polling or wrapping the sync call in an executor.
            # Using AioMailBox from imap_tools (if supported in 1.6+)
            # Alternatively, since IMAP IDLE blocks, we can run it in a thread or use aioimaplib.
            # For simplicity, let's use a polling loop that simulates IDLE by checking every N seconds
            # if the strict async bindings aren't flawless, but IMAP IDLE is requested.
            # We'll use a standard sync loop inside a thread if needed, but let's try AioMailBox for now.
            
            # Fallback to simple polling if AioMailBox lacks true IDLE in current version
            with MailBox(settings.imap_server, port=settings.imap_port).login(settings.imap_user, settings.imap_password, initial_folder='INBOX') as mailbox:
                logger.info("IMAP Logged in. Watching for SEEN=False messages...")
                backoff = 2 # Reset backoff on successful connect
                
                # Fetch currently unseen before starting IDLE-like behavior
                for msg in mailbox.fetch(AND(seen=False), mark_seen=False):
                    await process_email(msg)
                    # Mark seen manually? Let's leave it simple for now (mark_seen=True normally)
                
                logger.info("Entering IDLE loop...")
                # While a true IDLE block exists in imap_tools (mailbox.idle()), it blocks the thread.
                # So we simulate it or run idle() with a timeout.
                while True:
                    # Wait for new message from the server using IDLE
                    responses = mailbox.idle.wait(timeout=60)
                    if responses:
                        # New messages arrived
                        for msg in mailbox.fetch(AND(seen=False), mark_seen=True):
                            await process_email(msg)
                            
        except Exception as e:
            logger.error(f"IMAP connection dropped or failed: {e}")
            logger.info(f"Reconnecting in {backoff} seconds...")
            await asyncio.sleep(backoff)
            backoff = min(backoff * 2, max_backoff)

async def main():
    logger.info("Starting VoidPay Worker 🚀")
    
    # Initialize blockchain poller
    from worker.crypto_observer import CryptoObserver
    poller = CryptoObserver()
    
    # Run IMAP watcher and Blockchain poller concurrently
    await asyncio.gather(
        imap_idle_loop(),
        poller.run()
    )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Worker shutting down.")
