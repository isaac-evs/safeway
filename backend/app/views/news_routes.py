from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..controllers.news_controller import NewsController

router = APIRouter(prefix="/news", tags=["news"])

@router.get("/today")
async def get_today_news(db: AsyncSession = Depends(get_db)):
    try:
        news_data = await NewsController.get_today_news(db)
        return news_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve news: {str(e)}")
