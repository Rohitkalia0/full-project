from pydantic import ConfigDict, Field
from uuid import UUID
from src.schemas.base import BaseSchema
from typing import Optional
import datetime


class EveningCreate(BaseSchema):
    win: str
    mistake:str
    distraction: str
    mood_rating: int = Field(..., ge=1, le=5)
    energy_rating: int = Field(..., ge=1, le=5)
    lesson:str 

class EveningUpdate(BaseSchema):
    date: Optional[datetime.date] = None
    win: Optional[str] = None
    mistake: Optional[str] = None
    distraction: Optional[str] = None
    mood_rating: Optional[int] = Field(None, ge=1, le=5)
    energy_rating: Optional[int] = Field(None, ge=1, le=5)
    lesson: Optional[str] = None    


class EveningResponse(BaseSchema):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    date: datetime.date
    win: str
    mistake:str
    distraction: str
    mood_rating: int 
    energy_rating: int 
    lesson:str
    created_at: datetime.datetime
    updated_at: datetime.datetime

