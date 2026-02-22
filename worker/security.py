import logging
from authres import AuthenticationResultsHeader

logger = logging.getLogger(__name__)

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
    In Gmail, the IMAP server often adds an 'Authentication-Results' header
    such as:
    Authentication-Results: mx.google.com;
       dkim=pass header.i=@sbi.co.in header.s=s1 header.b=...;
       spf=pass (google.com: domain of alerts@sbi.co.in designates...)
       dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=sbi.co.in
    
    This function parses that header using the 'authres' library to ensure
    DKIM passed and the signing domain is permitted.
    """
    auth_results_raw = email_headers.get('authentication-results', '')
    
    if not auth_results_raw:
        logger.warning("No Authentication-Results header found. Email might be forwarded or tampered.")
        return False
        
    try:
        # Pydantic/imap_tools gives us a tuple or list if multiple headers exist, or a string
        if isinstance(auth_results_raw, (list, tuple)):
            auth_results_str = auth_results_raw[0]
        else:
            auth_results_str = str(auth_results_raw)

        # Parse the header using authres
        # Example format required by authres: Authentication-Results: hostname; dkim=pass ...
        # If it doesn't start with Authentication-Results:, we prepend it for the parser
        if not auth_results_str.lower().startswith('authentication-results:'):
            auth_results_str = f"Authentication-Results: {auth_results_str}"

        parsed_header = AuthenticationResultsHeader.parse(auth_results_str)
        
        dkim_pass = False
        valid_domain = False
        
        for result in parsed_header.results:
            if result.method == 'dkim':
                if result.result.lower() == 'pass':
                    dkim_pass = True
                    # Check if the domain (header.i/header.d) is in our allowed list
                    signing_domain = getattr(result, 'properties', {}).get('header.i', '').lstrip('@').lower()
                    
                    # Sometimes properties are objects, let's do a safe extraction
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
    """
    # email_msg.headers is a dict of lowercased header names
    # Example: {'authentication-results': ('mx.google.com; dkim=pass...',)}
    
    sender = str(email_msg.from_).lower()
    
    # Basic envelope sender check
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
