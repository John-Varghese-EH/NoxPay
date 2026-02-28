import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_key: str
    
    # IMAP Configuration
    imap_server: str = "imap.gmail.com"
    imap_port: int = 993
    imap_user: str
    imap_password: str
    
    # Blockchain
    usdt_watch_address: str = ""
    tron_rpc_url: str = "https://api.trongrid.io"
    eth_rpc_url: str = "https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID"
    
    # Crypto Observer Settings
    solana_rpc_url: str = "https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY"
    solana_watch_address: str = ""
    polygon_rpc_url: str = "https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY"
    polygon_watch_address: str = ""
    
    # Worker Settings
    poll_interval: int = 5
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

def get_settings():
    return Settings()
