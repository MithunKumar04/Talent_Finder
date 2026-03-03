from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.schemas.ranking import JDInput, RankingResponse
from src.api.middleware.cors import add_cors

app = FastAPI(title="Resume Ranking API")

add_cors(app)

