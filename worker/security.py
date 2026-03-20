import logging
import os
import socket
import ipaddress
from urllib.parse import urlparse
from authres import AuthenticationResultsHeader

logger = logging.getLogger(__name__)

# --- Dev / Test Mode ---
# Set DEV_MODE=true in env to bypass email security checks during testing
DEV_MODE = os.getenv("DEV_MODE", "false").lower() in ("true", "1", "yes")

# Comma-separated list of email addresses that are always allowed (for testing)
# Example: AUTHORIZED_SENDERS=john@gmail.com,test@outlook.com
AUTHORIZED_SENDERS = [s.strip().lower() for s in os.getenv("AUTHORIZED_SENDERS", "").split(",") if s.strip()]

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

# List of allowed bank domains. Emails from other domains will be rejected.
ALLOWED_BANK_DOMAINS = [
    "sbi.co.in",
    "hdfcbank.net",
    "icicibank.com",
    "axisbank.com",
    "paytm.com"
]

def verify_dkim(email_headers: dict) -> bool:
    """
    Verifies the DKIM signature by checking the Authentication-Results header.
    """
    auth_results_raw = email_headers.get('authentication-results', '')
    
    if not auth_results_raw:
        logger.warning("No Authentication-Results header found. Email might be forwarded or tampered.")
        return False
        
    try:
        if isinstance(auth_results_raw, (list, tuple)):
            auth_results_str = auth_results_raw[0]
        else:
            auth_results_str = str(auth_results_raw)

        if not auth_results_str.lower().startswith('authentication-results:'):
            auth_results_str = f"Authentication-Results: {auth_results_str}"

        parsed_header = AuthenticationResultsHeader.parse(auth_results_str)
        
        dkim_pass = False
        valid_domain = False
        
        for result in parsed_header.results:
            if result.method == 'dkim':
                if result.result.lower() == 'pass':
                    dkim_pass = True
                    signing_domain = getattr(result, 'properties', {}).get('header.i', '').lstrip('@').lower()
                    
                    if not signing_domain and hasattr(result, 'header_i'):
                        signing_domain = result.header_i.lstrip('@').lower()
                    if not signing_domain and hasattr(result, 'header_d'):
                        signing_domain = result.header_d.lstrip('@').lower()
                        
                    if signing_domain in ALLOWED_BANK_DOMAINS:
                        valid_domain = True
                        break
                    else:
                        logger.warning(f"DKIM passed, but signing domain '{signing_domain}' is not allowed.")
                        return False
                        
        if dkim_pass and valid_domain:
            return True
            
        logger.warning("DKIM verification failed or domain not matched in Authentication-Results.")
        return False

    except Exception as e:
        logger.error(f"Error parsing Authentication-Results header: {e}")
        return False

def verify_spf(email_headers: dict) -> bool:
    """
    Verifies SPF alignment from the Authentication-Results header.
    """
    auth_results_raw = email_headers.get('authentication-results', '')
    if not auth_results_raw:
        return False
        
    try:
        if isinstance(auth_results_raw, (list, tuple)):
            auth_results_str = auth_results_raw[0]
        else:
            auth_results_str = str(auth_results_raw)

        if not auth_results_str.lower().startswith('authentication-results:'):
            auth_results_str = f"Authentication-Results: {auth_results_str}"

        parsed_header = AuthenticationResultsHeader.parse(auth_results_str)
        
        for result in parsed_header.results:
            if result.method == 'spf':
                if result.result.lower() == 'pass':
                    return True
        return False
    except Exception as e:
        logger.error(f"Error parsing SPF in Authentication-Results: {e}")
        return False

def is_secure_email(email_msg) -> bool:
    """
    Main security gateway. Uses headers parsed by imap_tools.
    Expects email_msg to be an imap_tools.MailMessage object.
    
    In DEV_MODE or when sender is in AUTHORIZED_SENDERS, security checks are bypassed.
    """
    sender = str(email_msg.from_).lower()

    # --- Dev Mode: skip all security checks ---
    if DEV_MODE:
        logger.warning(f"[DEV_MODE] Bypassing security checks for email from {sender}")
        return True

    # --- Authorized Senders: allow specific test emails ---
    if sender in AUTHORIZED_SENDERS:
        logger.info(f"[AUTHORIZED] Email from {sender} is in authorized senders list. Skipping bank domain/DKIM/SPF checks.")
        return True
    
    # --- Production: full security checks ---
    sender_domain = sender.split('@')[-1] if '@' in sender else ''
    if sender_domain not in ALLOWED_BANK_DOMAINS:
        logger.error(f"Sender domain '{sender_domain}' not in allowed list.")
        return False

    # Deep verify DKIM and SPF headers
    if not verify_dkim(email_msg.headers):
        return False
        
    if not verify_spf(email_msg.headers):
        logger.warning(f"SPF validation failed for {sender}")
        return False
        
    return True

