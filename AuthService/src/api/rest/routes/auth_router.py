from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from src.schemas.user_schema import UserCreate, UserResponse, UserLoginInput, TokenResponse
from src.api.rest.dependencies import get_db, get_current_user,require_role
from src.core.services.auth_service import AuthService
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from src.utils.security import decode_token, create_access_token, create_refresh_token
from src.data.models.user_model import RefreshToken
from src.core.exceptions.user_exception import UserAlreadyExistsException, UserNotFoundException
from src.core.exceptions.auth_exception import InvalidCredentialsException, InvalidTokenException


router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/create-user", response_model=UserResponse)
async def create_user(user: UserCreate, db: Session = Depends(get_db),current_user=Depends(require_role(["super_admin"]))):
    new_user = await AuthService.create_user(db, user.email, user.password,user.role)

    if not new_user:
        raise UserAlreadyExistsException()

    return new_user


@router.post("/login", response_model = TokenResponse )
async def login(user:UserLoginInput,db: Session = Depends(get_db)):

    result = await AuthService.login(
        db,
        user.email,
        user.password
    )

    if result == "email no":
        raise UserNotFoundException()
    
    if result == "password no":
        raise InvalidCredentialsException()


    return  result

@router.get("/me")
async def me(current_user: dict = Depends(get_current_user)):
    return current_user


@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):

    payload = decode_token(refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise InvalidTokenException()

    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == refresh_token,
        RefreshToken.revoked == 0
    ).first()

    if not db_token:
        raise InvalidTokenException()

    # Rotate: revoke old token
    db_token.revoked = 1
    db.commit()

    # Create new tokens
    new_access = create_access_token({"sub": payload["sub"]})
    new_refresh = create_refresh_token({"sub": payload["sub"]})

    new_db_token = RefreshToken(
        token=new_refresh,
        user_id=db_token.user_id,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    db.add(new_db_token)
    db.commit()

    return {
        "access_token": new_access,
        "refresh_token": new_refresh
    }