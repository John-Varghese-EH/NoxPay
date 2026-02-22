import pytest
from api.utils.hmac import sign_payload, verify_signature

def test_sign_payload():
    secret = "sk_test_123456"
    payload = {"event": "payment.success", "amount": 500}
    
    signature = sign_payload(secret, payload)
    
    # Signature should be a string (hex digest)
    assert isinstance(signature, str)
    assert len(signature) == 64  # SHA256 hex length
    
def test_verify_signature():
    secret = "sk_test_123456"
    payload = {"event": "payment.success", "amount": 500}
    
    signature = sign_payload(secret, payload)
    
    # Should verify correctly
    assert verify_signature(secret, payload, signature) is True
    
    # Incorrect payload should fail
    modified_payload = {"event": "payment.success", "amount": 501}
    assert verify_signature(secret, modified_payload, signature) is False
    
    # Incorrect secret should fail
    wrong_secret = "sk_test_654321"
    assert verify_signature(wrong_secret, payload, signature) is False
