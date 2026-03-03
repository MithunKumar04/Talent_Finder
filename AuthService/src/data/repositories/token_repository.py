from sqlalchemy import select
from src.data.models.user_model import RefreshToken


class TokenRepository:

    @staticmethod
    async def create(db, token, user_id, expires_at):
        db_token = RefreshToken(
            token=token,
            user_id=user_id,
            expires_at=expires_at,
        )
        db.add(db_token)
        await db.commit()
        return db_token

    @staticmethod
    async def get_valid_token(db, token):
        result = await db.execute(
            select(RefreshToken).where(
                RefreshToken.token == token,
                RefreshToken.revoked == 0,
            )
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def revoke(db, db_token):
        db_token.revoked = 1
        await db.commit()