from pydantic import ConfigDict, Field
from uuid import UUID
from src.schemas.base import BaseSchema
from typing import Annotated, Optional, Union
import datetime


class EveningCreate(BaseSchema):
    win: Annotated[str, Field(min_length=2, max_length=2000)]
    mistake: Annotated[str, Field(min_length=2, max_length=2000)]
    distraction: Annotated[str, Field(min_length=2, max_length=2000)]
    mood_rating: int = Field(..., ge=1, le=5)
    energy_rating: int = Field(..., ge=1, le=5)
    lesson: Annotated[str, Field(min_length=2, max_length=2000)] 

class EveningUpdate(BaseSchema):
    date: Optional[datetime.date] = None
    win: Annotated[Union[str, None], Field(min_length=2, max_length=2000)] = None
    mistake: Annotated[Union[str, None], Field(min_length=2, max_length=2000)] = None
    distraction: Annotated[Union[str, None], Field(min_length=2, max_length=2000)] = None
    mood_rating: Optional[int] = Field(None, ge=1, le=5)
    energy_rating: Optional[int] = Field(None, ge=1, le=5)
    lesson: Annotated[Union[str, None], Field(min_length=2, max_length=2000)] = None   


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

