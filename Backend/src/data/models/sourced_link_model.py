from sqlalchemy import *
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid

class SourcedLink(Base):
    __tablename__ = "sourced_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cd_id = Column(UUID(as_uuid=True), ForeignKey("candidates.cd_id", ondelete="CASCADE"))
    platform = Column(Text, nullable=False)
    role = Column(Text, nullable=False)
    link = Column(Text, nullable=False)