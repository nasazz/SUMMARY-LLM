from typing import Generator
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from src.core.config import settings
from src.data.unit_of_work import UnitOfWork
from src.logic.services.document_service import DocumentService
from src.logic.services.auth_service import AuthService
from src.presentation.dtos.auth_dtos import UserResponse

def get_uow() -> Generator[UnitOfWork, None, None]:
    """Dependency provider for the UnitOfWork."""
    # We yield the instance so the FastAPI dependency system manages lifecycle,
    # but the Service itself will explicitly use `with self.uow:` to bound transactions.
    uow = UnitOfWork()
    yield uow

def get_document_service(uow: UnitOfWork = Depends(get_uow)) -> DocumentService:
    """Dependency provider injecting the UoW into DocumentService."""
    return DocumentService(uow)

def get_auth_service(uow: UnitOfWork = Depends(get_uow)) -> AuthService:
    """Dependency provider injecting the UoW into AuthService."""
    return AuthService(uow)

# Automatically pulls the header `Authorization: Bearer <token>`
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme), 
    auth_service: AuthService = Depends(get_auth_service)
) -> UserResponse:
    """Middleware validating JWT boundaries strictly verifying DB sessions accurately asynchronously."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token identity.")
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token uniquely expired or invalid.")
        
    with auth_service.uow:
        user = auth_service.uow.users.get_by_email(email)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User Identity mapped incorrectly unauthorized.")
        return UserResponse.model_validate(user)