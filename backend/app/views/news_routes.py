from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..controllers.news_controller import NewsController

router = APIRouter(prefix="/news", tags=["news"])

@router.get("/today")
async def get_today_news(db: AsyncSession = Depends(get_db)):
    print("[DEBUG] Entered get_today_news endpoint")
    try:
        print("[DEBUG] Calling NewsController.get_today_news...")
        news_data = await NewsController.get_today_news(db)
        print(f"[DEBUG] Retrieved {len(news_data)} news items")
        return news_data
    except Exception as e:
        print(f"[DEBUG] Database error in get_today_news: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve news: {str(e)}")
