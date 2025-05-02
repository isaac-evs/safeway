from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .views.news_routes import router as news_router

app = FastAPI(title="News API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(news_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {"message": "Welcome to the News API"}
