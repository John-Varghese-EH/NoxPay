import hmac
import hashlib
import json

def sign_payload(secret: str, payload: dict) -> str:
    """
    Signs a JSON payload using HMAC-SHA256 and the provided secret.
    Returns the hex digest signature.
    """
    payload_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')
    signature = hmac.new(secret.encode('utf-8'), payload_bytes, hashlib.sha256).hexdigest()
    return signature

def verify_signature(secret: str, payload: dict, provided_signature: str) -> bool:
    """
    Verifies an HMAC-SHA256 signature securely against timing attacks.
    """
    expected_signature = sign_payload(secret, payload)
    return hmac.compare_digest(expected_signature, provided_signature)
