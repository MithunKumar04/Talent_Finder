from sqlalchemy import *
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid

class Candidate(Base):
    __tablename__ = "candidates"

    cd_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cd_name = Column(String(255), nullable=False)
    cd_email = Column(String(255))
    cd_url = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    scores = relationship("JobCandidateScore", back_populates="candidate")