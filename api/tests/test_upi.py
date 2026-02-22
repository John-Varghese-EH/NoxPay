import pytest
import base64
from api.utils.upi import generate_upi_uri, generate_qr_base64

def test_generate_upi_uri():
    vpa = "merchant@sbi"
    name = "NoxPay Merchant"
    amount = 500.00
    order_id = "VOID12345"
    
    uri = generate_upi_uri(pa=vpa, pn=name, am=amount, tr=order_id)
    
    assert uri.startswith("upi://pay?")
    assert "pa=merchant%40sbi" in uri
    assert "pn=NoxPay+Merchant" in uri
    assert "am=500.00" in uri
    assert "tn=NOXPAY-VOID12345-source-website%2Fcustom-dev-fixed-note" in uri
    assert "cu=INR" in uri

def test_upi_uri_small_amount():
    """Test with a small amount"""
    uri = generate_upi_uri(pa="test@upi", pn="Test", am=1.50, tr="SMALL001")
    assert "am=1.50" in uri
    assert "tr=SMALL001" in uri

def test_upi_uri_large_amount():
    """Test with a large amount"""
    uri = generate_upi_uri(pa="test@upi", pn="Test", am=999999.99, tr="LARGE001")
    assert "am=999999.99" in uri

def test_upi_uri_special_name():
    """Test with spaces and special characters in merchant name"""
    uri = generate_upi_uri(pa="test@upi", pn="Merchant & Sons", am=100.00, tr="SPEC001")
    assert "pn=Merchant" in uri  # URL encoded will split

def test_qr_base64_returns_valid_base64():
    """QR code output should be valid base64"""
    uri = "upi://pay?pa=test%40sbi&pn=Test&am=100.00"
    qr = generate_qr_base64(uri)
    
    # Should be a non-empty string
    assert isinstance(qr, str)
    assert len(qr) > 0
    
    # Should be valid base64
    decoded = base64.b64decode(qr)
    assert decoded is not None
    
    # Should start with PNG magic bytes
    assert decoded[:4] == b'\x89PNG'

def test_qr_base64_consistency():
    """Same URI should produce same QR code"""
    uri = "upi://pay?pa=test%40sbi&pn=Test&am=100.00"
    qr1 = generate_qr_base64(uri)
    qr2 = generate_qr_base64(uri)
    assert qr1 == qr2
