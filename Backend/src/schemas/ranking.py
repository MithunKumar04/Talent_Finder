from pydantic import BaseModel
from typing import List, Optional


class JDInput(BaseModel):
    jd_text: str


class CandidateExplanation(BaseModel):
    summary: Optional[str] = None
    skills_explanation: Optional[str] = None
    experience_explanation: Optional[str] = None
    education_explanation: Optional[str] = None
    responsibility_explanation: Optional[str] = None
    final_justification: Optional[str] = None


class CandidateScore(BaseModel):
    rank: int
    name: str
    email: str
    final_score: float
    explanation: CandidateExplanation


class RankingResponse(BaseModel):
    total_resumes: int
    ranked_candidates: List[CandidateScore]