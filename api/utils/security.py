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
