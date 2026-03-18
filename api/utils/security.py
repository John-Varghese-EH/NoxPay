import socket
import ipaddress
from urllib.parse import urlparse
from passlib.context import CryptContext

# Set up the context to use bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_secret(secret: str) -> str:
    """
    Hashes a client secret using bcrypt.
    """
    return pwd_context.hash(secret)

def verify_secret(plain_secret: str, hashed_secret: str) -> bool:
    """
    Verifies a plaintext secret against its bcrypt hash.
    """
    return pwd_context.verify(plain_secret, hashed_secret)

def validate_webhook_url(url: str) -> str:
    """
    Validates a webhook URL to prevent Server-Side Request Forgery (SSRF).
    Checks that the URL is HTTP/HTTPS and does not resolve to a private/internal IP.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ["http", "https"]:
            raise ValueError("URL scheme must be http or https.")
            
        hostname = parsed.hostname
        if not hostname:
            raise ValueError("Invalid URL hostname.")
            
        # Resolve hostname to IP
        ip_str = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_str)
        
        # Check against local, private, and reserved IP ranges
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_multicast or ip.is_reserved or ip.is_unspecified:
            raise ValueError("Webhook URL resolves to a forbidden internal or restricted IP address.")
            
    except socket.gaierror:
        raise ValueError("Could not resolve webhook hostname.")
    except Exception as e:
        raise ValueError(f"Invalid webhook URL: {str(e)}")
        
    return url
