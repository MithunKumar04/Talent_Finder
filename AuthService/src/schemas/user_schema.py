from pydantic import BaseModel, EmailStr
from typing import Literal


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: Literal["super_admin", "hr", "viewer"]

class UserResponse(BaseModel):
    user_id: int
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

class UserLoginInput(BaseModel):
    email : EmailStr
    password: str
    
class TokenResponse(BaseModel):
    access_token : str
    refresh_token : str
    token_type : str = "bearer"