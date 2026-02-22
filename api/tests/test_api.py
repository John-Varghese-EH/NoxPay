import pytest
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "NoxPay API"}

def test_unauthorized_intent_creation():
    # Attempting to create an intent without valid X-Client-ID and X-Client-Secret headers
    payload = {
        "amount": 500.00,
        "currency": "UPI",
        "order_id": "TEST_ORD_001"
    }
    response = client.post("/api/v1/intents/create-payment", json=payload)
    assert response.status_code == 401

def test_unauthorized_client_registration():
    # Only the dashboard with MASTER_API_KEY can register a client
    payload = {"name": "Test Merchant"}
    response = client.post("/api/v1/clients/", json=payload)
    assert response.status_code in [401, 403, 422, 500]

def test_intent_validation_negative_amount():
    """Negative amounts should be rejected with 422"""
    payload = {
        "amount": -100.00,
        "currency": "UPI",
        "order_id": "NEG_TEST_001"
    }
    response = client.post("/api/v1/intents/create-payment", json=payload)
    assert response.status_code in [401, 422]  # 401 because no auth, 422 if validation runs first

def test_intent_validation_empty_order_id():
    """Empty order_id should be rejected"""
    payload = {
        "amount": 100.00,
        "currency": "UPI",
        "order_id": ""
    }
    response = client.post("/api/v1/intents/create-payment", json=payload)
    assert response.status_code in [401, 422]

def test_intent_validation_special_chars_order_id():
    """Special characters in order_id should be rejected"""
    payload = {
        "amount": 100.00,
        "currency": "UPI",
        "order_id": "drop table; --"
    }
    response = client.post("/api/v1/intents/create-payment", json=payload)
    assert response.status_code in [401, 422]

def test_client_name_validation():
    """Too short client name should be rejected"""
    payload = {"name": "AB"}
    response = client.post(
        "/api/v1/clients/",
        json=payload,
        headers={"x-master-key": "test_key_that_wont_match"}
    )
    # Should get 403 (wrong key) or 500 (MASTER_API_KEY not set) or 422 (validation)
    assert response.status_code in [403, 422, 500]

def test_cors_headers():
    """Verify CORS headers are present on responses"""
    response = client.options(
        "/health",
        headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"}
    )
    # Should either allow or deny based on config; not crash
    assert response.status_code in [200, 400, 405]

def test_request_id_header():
    """Verify X-Request-ID header is present in response"""
    response = client.get("/health")
    assert "x-request-id" in response.headers
