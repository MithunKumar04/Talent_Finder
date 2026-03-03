from datetime import datetime, timedelta
from src.data.repositories.user_repository import UserRepository
from src.data.repositories.token_repository import TokenRepository
from src.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from src.config.settings import settings


class AuthService:

    @staticmethod
    async def create_user(db, email, password, role):

        existing = await UserRepository.get_by_email(db, email)
        if existing:
            return None

        return await UserRepository.create_user(
            db,
            email,
            hash_password(password),
            role,
        )

    @staticmethod
    async def login(db, email, password):

        user = await UserRepository.get_by_email(db, email)
        if not user:
            return "email no"

        if not verify_password(password, user.password_hash):
            return "password no"

        access = create_access_token(
            {"sub": user.email, "role": user.role}
        )

        refresh = create_refresh_token(
            {"sub": user.email}
        )

        await TokenRepository.create(
            db,
            token=refresh,
            user_id=user.user_id,
            expires_at=datetime.utcnow()
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )

        return {"access_token" :access, "refresh_token": refresh, "token_type": "bearer"}

    @staticmethod
    async def refresh(db, refresh_token):

        payload = decode_token(refresh_token)

        if not payload or payload.get("type") != "refresh":
            return None

        db_token = await TokenRepository.get_valid_token(
            db, refresh_token
        )

        if not db_token:
            return None

        await TokenRepository.revoke(db, db_token)

        new_access = create_access_token(
            {"sub": payload["sub"]}
        )

        new_refresh = create_refresh_token(
            {"sub": payload["sub"]}
        )

        await TokenRepository.create(
            db,
            token=new_refresh,
            user_id=db_token.user_id,
            expires_at=datetime.utcnow()
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        )

        return new_access, new_refresh