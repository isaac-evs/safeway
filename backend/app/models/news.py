from sqlalchemy import Column, Integer, String, Text, Date, DateTime, func, CheckConstraint
from sqlalchemy.sql import text
from sqlalchemy.types import UserDefinedType
from datetime import date
from ..database import Base

class Geography(UserDefinedType):
    def get_col_spec(self):
        return "GEOGRAPHY(POINT, 4326)"

    def column_expression(self, col):
        return col

class News(Base):
    __tablename__ = "news"

    id = Column(Integer, primary_key=True, index=True)
    news_source = Column(Text)
    title = Column(Text)
    description = Column(Text)
    coordinates = Column(Geography)
    type = Column(Text, CheckConstraint("type IN ('crime', 'infrastructure', 'hazard', 'social')"))
    date = Column(Date)
    url = Column(Text, unique=True)
    processed_at = Column(DateTime, server_default=func.now())

    # Method to convert database model to dictionary/JSON
    def to_json(self):
        # Extract longitude and latitude from PostGIS POINT
        coords_query = text(f"SELECT ST_X(coordinates::geometry), ST_Y(coordinates::geometry) FROM news WHERE id = {self.id}")
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "coordinates": None,  # Will be populated in controller
            "type": self.type,
            "date": self.date.isoformat() if self.date else None,
            "url": self.url
        }
