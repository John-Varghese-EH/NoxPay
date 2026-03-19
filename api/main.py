import logging
import os
import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from api.routes import intents, webhooks, clients, analytics

# Configure Logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("NoxPay-API")

app = FastAPI(
    title="NoxPay API",
    description="Sovereign SaaS UPI & Crypto Payment Gateway API",
    version="1.1.0"
)

# --- Security: CORS from env, no wildcard ---
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in ALLOWED_ORIGINS],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Client-ID", "X-Client-Secret", "X-Request-ID"],
)

# --- Security Headers Middleware ---
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none';"
    return response

# --- Request ID middleware ---
@app.middleware("http")
async def add_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# --- Global exception handler ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.error(f"[{request_id}] Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred.", "request_id": request_id}
    )

# Route registration
app.include_router(intents.router)
app.include_router(webhooks.router)
app.include_router(clients.router)
app.include_router(analytics.router)

@app.get("/api/wake", tags=["Health"])
async def wake_service():
    """Wake-up endpoint to prevent Render free-tier cold starts.
    Configure a free cron service (e.g., cron-job.org, UptimeRobot)
    to ping this endpoint every 14 minutes."""
    return {"status": "awake", "service": "NoxPay API"}

@app.get("/health", tags=["Health"])
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok", "service": "NoxPay API"}

if __name__ == "__main__":
    logger.info("Starting NoxPay API Server 🚀")
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)
