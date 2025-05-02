from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import date
from ..models.news import News

class NewsController:
    @staticmethod
    async def get_today_news(db: AsyncSession):
        query = text("""
            SELECT
                id,
                title,
                description,
                ST_X(coordinates::geometry) as longitude,
                ST_Y(coordinates::geometry) as latitude,
                type,
                date,
                url
            FROM news
            WHERE date = CURRENT_DATE
            ORDER BY id
        """)

        result = await db.execute(query)
        news_items = result.fetchall()

        formatted_news = []
        for item in news_items:
            # Truncate description to 250 characters, add ellipsis if needed
            desc = item.description or ""
            if len(desc) > 250:
                desc = desc[:250] + "..."

            formatted_news.append({
                "id": item.id,
                "title": item.title,
                "description": desc,
                "coordinates": [item.longitude, item.latitude],
                "type": item.type,
                "date": item.date.isoformat() if item.date else None,
                "url": item.url
            })

        return formatted_news
