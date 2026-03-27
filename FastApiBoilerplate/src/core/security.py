from datetime import datetime, timedelta, timezone
from typing import Any
from jose import jwt
import bcrypt
from src.core.config import settings

ALGORITHM = "HS256"

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a plain password against the hashed version in the database."""
    # bcrypt requires raw bytes for both the password and the hash
    password_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    
    return bcrypt.checkpw(password_bytes, hash_bytes)

def get_password_hash(password: str) -> str:
    """Generates a secure bcrypt hash for a new password."""
    password_bytes = password.encode('utf-8')
    
    # Generate a secure salt and hash the password
    salt = bcrypt.gensalt()
    hashed_bytes = bcrypt.hashpw(password_bytes, salt)
    
    # Decode back to a string so it can be saved in our SQLAlchemy String column
    return hashed_bytes.decode('utf-8')

def create_access_token(
    subject: str | Any, 
    role: str, 
    expires_delta: timedelta | None = None
) -> str:
    """
    Generates a JWT token containing the user's ID (sub) and their Role (role).
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode: dict[str, Any] = {"exp": expire, "sub": str(subject), "role": role}
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt