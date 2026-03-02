from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.schemas.ranking import JDInput, RankingResponse
from src.control.agent.ranking_service import rank_resumes

app = FastAPI(title="Resume Ranking API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite frontend
    allow_credentials=True,
    allow_methods=["*"],   # <-- allows OPTIONS
    allow_headers=["*"],   # <-- allows Authorization header
)

@app.post(
    "/rank-resumes",
    response_model=RankingResponse,
    summary="Rank resumes against a Job Description"
)
def rank_resumes_api(payload: JDInput):
    ranked = rank_resumes(payload.jd_text)

    return {
        "total_resumes": len(ranked),
        "ranked_candidates": ranked
    }
