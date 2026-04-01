from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from src.presentation.dtos.auth_dtos import UserRegister, UserResponse, Token
from src.logic.services.auth_service import AuthService
from src.presentation.dependencies import get_auth_service, get_current_user
from src.core.exceptions import raise_for_result

# Modern N-Layer Auth Router
router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_endpoint(
    payload: UserRegister,
    service: AuthService = Depends(get_auth_service)
):
    """Registers a new user using the modern AuthService logic."""
    result = service.register_user(payload.email, payload.password, payload.role)
    raise_for_result(result)
    return result.value

@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login_endpoint(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service)
):
    """Login endpoint mapped to OAuth2 form data for Swagger compatibility."""
    result = service.authenticate_user(form_data.username, form_data.password)
    raise_for_result(result)
    return result.value

@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def me_endpoint(
    current_user: UserResponse = Depends(get_current_user)
):
    """Returns the currently authenticated user derived from the JWT token."""
    return current_user

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout_endpoint():
    """
    Stateless logout. Since we use JWTs, the server holds no session.
    The client is responsible for discarding the token.
    """
    return {"message": "Logged out successfully."}
