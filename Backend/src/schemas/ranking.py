from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class JDInput(BaseModel):
    jd_text: str


class CandidateExplanation(BaseModel):
    summary: Optional[str]
    skills_explanation: Optional[str]
    experience_explanation: Optional[str]
    education_explanation: Optional[str]
    final_justification: Optional[str]
    final_score: float


class CandidateScore(BaseModel):
    rank: int
    name: str
    final_score: float
    explanation: CandidateExplanation


class RankingResponse(BaseModel):
    total_resumes: int
    ranked_candidates: List[CandidateScore]