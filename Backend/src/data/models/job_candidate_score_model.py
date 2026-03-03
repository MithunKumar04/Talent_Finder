from sqlalchemy import *
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
import uuid

candidate_stage_enum = ENUM(
    "sourced", "screened", "shortlisted",
    name="candidate_stage",
    create_type=False
)

class JobCandidateScore(Base):
    __tablename__ = "job_candidate_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.job_id", ondelete="CASCADE"))
    cd_id = Column(UUID(as_uuid=True), ForeignKey("candidates.cd_id", ondelete="RESTRICT"))

    skill_score = Column(Float)
    education_score = Column(Float)
    experience_score = Column(Float)
    role_fit_score = Column(Float)
    recency_score = Column(Float)
    final_weighted_score = Column(Float)

    bucket = Column(candidate_stage_enum, default="sourced")
    remarks = Column(Text)

    updated_at = Column(DateTime(timezone=True), server_default=func.now())

    job = relationship("Job", back_populates="scores")
    candidate = relationship("Candidate", back_populates="scores")