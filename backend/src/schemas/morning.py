from datetime import date
from uuid import UUID
from typing import List

from pydantic import ConfigDict, Field
from src.schemas.base import BaseSchema
from src.schemas.morning_activity import (
    MorningActivityCreate,
    MorningActivityUpdate,
    MorningActivityResponse
)


class MorningCreate(BaseSchema):

    confidence_rating: int = Field(..., ge=1, le=5)

    activities: List[MorningActivityCreate] = []


class MorningUpdate(BaseSchema):

    confidence_rating: int | None = None
    activities: list[MorningActivityUpdate] | None = None


class MorningResponse(BaseSchema):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    date: date
    confidence_rating: int
    activities: list[MorningActivityResponse]