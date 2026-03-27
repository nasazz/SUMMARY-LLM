from pydantic import BaseModel, Field, EmailStr

class Token(BaseModel):
    """The standard OAuth2 response schema for a successful login."""
    access_token: str
    token_type: str = "bearer"

class TokenPayload(BaseModel):
    """The strict schema for the data embedded inside our JWT."""
    sub: str
    role: str

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    fullName: str
    department: str
    jobTitle: str

class UserResponse(BaseModel):
    id: int
    email: str
    message: str = "User registered successfully"