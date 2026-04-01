from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator
from typing import Optional
from uuid import UUID
import re

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
    id: UUID = Field(validation_alias="Id")
    email: EmailStr = Field(validation_alias="Email")
    role: str = Field(validation_alias="Role")
    is_active: bool = Field(validation_alias="IsActive")

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "User"

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Fluent-style validation verifying password length and complexity mapping."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long.")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain an uppercase letter.")
        if not re.search(r"[\W_]", v):
            raise ValueError("Password must contain a special character.")
        return v

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
