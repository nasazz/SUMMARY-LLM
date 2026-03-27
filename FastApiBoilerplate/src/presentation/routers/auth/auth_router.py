from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from src.domain.auth.auth_shemas import Token, UserRegister, UserResponse
from src.services.auth_service import AuthService, get_auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service)
) -> Token:
    """
    OAuth2 compatible token login, getting username (email) and password from form data.
    """
    result = service.login(email=form_data.username, plain_password=form_data.password)
    
    if not result.is_success or result.value is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.error or "Login failed",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return result.value

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    user_in: UserRegister,
    service: AuthService = Depends(get_auth_service)
) -> UserResponse:
    """Registration endpoint for Angular."""
    result = service.register(user_in)
    
    if not result.is_success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error
        )
        
    assert result.value is not None
    return result.value