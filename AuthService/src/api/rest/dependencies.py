from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from src.data.clients.postgres_client import AsyncSessionLocal
from src.utils.security import decode_token
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

security =  HTTPBearer()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session


async def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)):
    payload = decode_token(token.credentials)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    return payload

def require_role(allowed_roles: list):

    async def role_checker(token: HTTPAuthorizationCredentials = Depends(security)):
        payload = decode_token(token.credentials)

        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )

        user_role = payload.get("role")

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions"
            )

        return payload

    return role_checker