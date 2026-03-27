from sqlalchemy.orm import Session
from fastapi import Depends
from app.domain.auth.auth_models import User
from app.infrastructure.database import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.result import Result
from app.domain.auth.auth_shemas import Token, UserRegister, UserResponse

class AuthService:
    def __init__(self, db: Session):
        # We inject the raw session here purely for read-only Auth lookups
        self._db = db

    def login(self, email: str, plain_password: str) -> Result[Token]:
        """
        Validates credentials and mints a JWT.
        """
        # 1. Find user by email
        user = self._db.query(User).filter(User.email == email).first()
        if not user:
            return Result(is_success=False, error="Incorrect email or password")
            
        # 2. Check if account is active
        if not user.is_active:
            return Result(is_success=False, error="Inactive user account")

        # 3. Verify cryptographic hash
        if not verify_password(plain_password, user.hashed_password):
            return Result(is_success=False, error="Incorrect email or password")

        # 4. Mint the JWT
        token_string = create_access_token(subject=str(user.id), role=user.role)
        
        token_dto = Token(access_token=token_string)
        return Result(is_success=True, value=token_dto)
    

    def register(self, user_in: UserRegister) -> Result[UserResponse]:
        """Registers a new user from the Angular frontend."""
        # 1. Check if email exists
        if self._db.query(User).filter(User.email == user_in.email).first():
            return Result(is_success=False, error="Email already registered")
            
        # 2. Map DTO to Entity (Mocking some fields for now that aren't in our DB yet)
        new_user = User(
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            # role="Operator", # Default role
            is_active=True
        )
        
        try:
            self._db.add(new_user)
            self._db.commit()
            self._db.refresh(new_user)
            
            return Result(
                is_success=True, 
                value=UserResponse(id=new_user.id, email=new_user.email)
            )
        except Exception as e:
            self._db.rollback()
            return Result(is_success=False, error=str(e))

def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    return AuthService(db)