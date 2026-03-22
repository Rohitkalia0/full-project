from uuid import UUID
from pydantic import ConfigDict
from src.schemas.base import BaseSchema


class MorningActivityCreate(BaseSchema):
    title: str
    is_priority: bool = False
    is_habit: bool = False


class MorningActivityUpdate(BaseSchema):
    id: UUID
    title: str | None = None
    is_priority: bool | None = None
    is_habit: bool | None = None
    is_completed: bool | None = None


class MorningActivityResponse(BaseSchema):

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    checkin_id: UUID
    title: str
    is_priority: bool
    is_habit: bool
    is_completed: bool