from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from src.core.config import settings
from src.domain.auth.auth_shemas import TokenPayload

# This tells Swagger UI where to send credentials to get the token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user_payload(token: str = Depends(oauth2_scheme)) -> TokenPayload:
    """
    Extracts the Bearer token from the header, decodes it, and validates it.
    Equivalent to the ASP.NET Core JWT Middleware.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        user_id: str | None = payload.get("sub")
        role: str | None = payload.get("role")
        
        if user_id is None or role is None:
            raise credentials_exception
            
        return TokenPayload(sub=user_id, role=role)
        
    except JWTError:
        raise credentials_exception

class RoleChecker:
    """
    Equivalent to [Authorize(Roles = "Admin, Manager")]
    """
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, payload: TokenPayload = Depends(get_current_user_payload)) -> TokenPayload:
        if payload.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted. Insufficient role permissions."
            )
        return payload