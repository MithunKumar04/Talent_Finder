from sqlalchemy.orm import Session
from src.data.models.user_model import User
from sqlalchemy import select


class UserRepository:

    @staticmethod
    async def get_by_email(db: Session, email: str):
        result = await db.execute(select(User).where(User.email == email))        
        return result.scalar_one_or_none()

    @staticmethod
    async def create_user(db: Session, email: str, password_hashed: str, role: str):
        user = User(email=email, password_hash=password_hashed, role = role)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user