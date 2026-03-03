from sqlalchemy import select
from src.data.models.user_model import User
from src.data.clients.postgres_client import AsyncSessionLocal
from src.utils.security import hash_password

async def seed_super_admin():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(User).where(User.role == "super_admin")
        )
        existing = result.scalar_one_or_none()

        if not existing:
            admin = User(
                email="admin@company.com",
                name = "Admin",
                password_hash=hash_password("admin123"),
                role="super_admin"
            )
            db.add(admin)
            await db.commit()