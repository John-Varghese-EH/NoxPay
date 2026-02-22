import pytest
from worker.parser import ParserRegistry

def test_sbi_parser():
    email_body = """
    Dear Customer,
    Your A/c No. XXXXXX1234 is credited with Rs 5,000.00 on 22/02/26.
    By UPI transaction from mr.merchant@paytm.
    Ref No. 312345678912.
    Thank you for banking with SBI.
    """
    
    parser = ParserRegistry.detect(email_body)
    assert parser is not None
    assert parser.__class__.__name__ == "SBIParser"
    
    tx = parser.parse(email_body)
    assert tx is not None
    assert tx.amount == 5000.00
    assert tx.utr == "312345678912"

def test_hdfc_parser():
    email_body = """
    UPDATE: INR 10,500.00 deposited in your account **5678.
    Towards UPI txn from client@okicici.
    UPI Ref No. 323456789012.
    Thank you from HDFC Bank.
    """
    
    parser = ParserRegistry.detect(email_body)
    assert parser is not None
    assert parser.__class__.__name__ == "HDFCParser"
    
    tx = parser.parse(email_body)
    assert tx is not None
    assert tx.amount == 10500.00
    assert tx.utr == "323456789012"

def test_invalid_parser():
    email_body = "Hello! Your Swiggy order is delivered."
    parser = ParserRegistry.detect(email_body)
    assert parser is None
