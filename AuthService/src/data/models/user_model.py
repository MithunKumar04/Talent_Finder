from sqlalchemy import *
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from src.data.clients.postgres_client import Base
import enum
class RoleEnum(str,enum.Enum):
    super_admin = "super_admin"
    hr = "hr"
    viewer = "viewer"


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"schema": "auth"}


    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    name = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.viewer)    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    refresh_tokens = relationship("RefreshToken", back_populates="user")
    
class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    __table_args__ = {"schema": "auth"}


    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token = Column(String, unique=True, nullable=False) 
    user_id = Column(UUID, ForeignKey("auth.users.user_id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime)
    revoked = Column(Integer, default=0)

    user = relationship("User", back_populates="refresh_tokens")