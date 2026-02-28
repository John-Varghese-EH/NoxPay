import asyncio
import logging
import httpx
from worker.config import get_settings
from worker.matcher import match_and_settle_crypto

logger = logging.getLogger(__name__)
settings = get_settings()

class CryptoObserver:
    def __init__(self):
        self.solana_rpc = settings.solana_rpc_url
        self.solana_address = settings.solana_watch_address
        self.polygon_rpc = settings.polygon_rpc_url
        self.polygon_address = settings.polygon_watch_address
        self.poll_interval = settings.poll_interval
        
    async def poll_solana(self):
        """Polls Solana for USDC/SOL deposits"""
        if not self.solana_address:
            return
            
        logger.info(f"Starting Solana poller for {self.solana_address}")
        
        # In a real app, track the last signature to avoid re-fetching everything
        last_signature = None
        
        while True:
            try:
                async with httpx.AsyncClient() as client:
                    # 1. Get recent signatures
                    payload = {
                        "jsonrpc": "2.0",
                        "id": 1,
                        "method": "getSignaturesForAddress",
                        "params": [
                            self.solana_address,
                            {"limit": 10}
                        ]
                    }
                    if last_signature:
                        payload["params"][1]["until"] = last_signature
                        
                    res = await client.post(self.solana_rpc, json=payload)
                    data = res.json()
                    
                    if "result" in data and reversed(data["result"]):
                        sigs = [tx['signature'] for tx in data['result']]
                        
                        for sig in sigs:
                            # 2. Get Parsed Transaction
                            parsed_payload = {
                                "jsonrpc": "2.0",
                                "id": 1,
                                "method": "getTransaction",
                                "params": [
                                    sig,
                                    {"encoding": "jsonParsed", "maxSupportedTransactionVersion": 0}
                                ]
                            }
                            tx_res = await client.post(self.solana_rpc, json=parsed_payload)
                            tx_data = tx_res.json()
                            
                            if tx_data and tx_data.get("result"):
                                tx_info = tx_data["result"]
                                
                                # 3. Check if we need to process it
                                # (In a fully implemented version, we'd parse the token transfers closely)
                                # For demonstration, we simulate finding a memo and amount.
                                # Example checking for finalized status:
                                # if "meta" in tx_info and tx_info["meta"].get("err") is None:
                                
                                amount = 0.0 # extract amount
                                from_addr = "sender_placeholder"
                                memo = sig[-6:] # fake memo from sign
                                
                                # Call our settlement logic
                                # match_and_settle_crypto(amount, sig, from_addr, memo)
                                
                        if data["result"]:
                            last_signature = data["result"][0]["signature"]
                            
            except Exception as e:
                logger.error(f"Solana Polling error: {e}")
                
            await asyncio.sleep(self.poll_interval)
            
    async def poll_polygon(self):
        """Polls Polygon for USDT ERC-20 transfers"""
        if not self.polygon_address:
            return
            
        logger.info(f"Starting Polygon poller for {self.polygon_address}")
        
        while True:
            try:
                async with httpx.AsyncClient() as client:
                    # Fetch ERC-20 Transfer logs
                    # eth_getLogs payload ...
                    
                    # Example
                    # amount = ...
                    # tx_hash = ...
                    # from_addr = ...
                    # match_and_settle_crypto(amount, tx_hash, from_addr)
                    pass
            except Exception as e:
                logger.error(f"Polygon Polling error: {e}")
                
            await asyncio.sleep(self.poll_interval)
            
    async def run(self):
        """Runs all configured crypto pollers."""
        if not self.solana_address and not self.polygon_address:
            logger.info("No crypto watch addresses configured. Crypto poller disabled.")
            return
            
        await asyncio.gather(
            self.poll_solana(),
            self.poll_polygon()
        )
