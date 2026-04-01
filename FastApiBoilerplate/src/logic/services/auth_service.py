from src.data.unit_of_work import UnitOfWork
from src.data.entities.models import User
from src.presentation.dtos.auth_dtos import UserResponse, Token
from src.logic.results import Result
from src.core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    """Orchestrates authorization mappings binding Entities dynamically securely to generic logic states."""
    
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def register_user(self, email: str, raw_password: str, role: str = "User") -> Result[UserResponse]:
        try:
            with self.uow:
                existing = self.uow.users.get_by_email(email)
                if existing:
                    return Result.failure("Email already registered.")
                
                hashed_pw = get_password_hash(raw_password)
                new_user = User(Email=email, HashedPassword=hashed_pw, Role=role)
                self.uow.users.add(new_user)
                self.uow.session.flush() # Ensure ID and defaults are populated
                
                response = UserResponse.model_validate(new_user)
                return Result.success(response)
        except Exception as e:
            return Result.failure(f"Registration failed: {str(e)}")

    def authenticate_user(self, email: str, raw_password: str) -> Result[Token]:
        with self.uow:
            user = self.uow.users.get_by_email(email)
            if not user or not verify_password(raw_password, user.HashedPassword):
                return Result.failure("Unauthorized: Incorrect email or password")
            if not user.IsActive:
                return Result.failure("Forbidden: User account is inactive")
            
            # Form standard Token Mapping
            token_payload = {"sub": user.Email, "role": user.Role}
            access_token = create_access_token(data=token_payload)
            token = Token(access_token=access_token)
            
            return Result.success(token)
    
    # def get_current_user(self) -> Result[UserResponse]:
    #     # This method would typically extract user info from the token in a real implementation
    #     # For demonstration, we will just return a dummy user response
    #     try:
    #         # In a real scenario, you would decode the token and fetch user details from DB
    #         dummy_user = UserResponse(id="0B951E7F-67E2-4917-AEB4-5517FD613AB2", email="admin@corporate.com", role="Admin")
    #         return Result.success(dummy_user)
    #     except Exception as e:
    #         return Result.failure(f"Failed to get current user: {str(e)}")