from typing import Annotated, Union
from uuid import UUID
from pydantic import ConfigDict, Field
from src.schemas.base import BaseSchema


class MorningActivityCreate(BaseSchema):
    title: Annotated[str, Field(min_length=2, max_length=2000)]
    is_priority: bool = False
    is_habit: bool = False


class MorningActivityUpdate(BaseSchema):
    id: UUID
    title: Annotated[Union[str, None], Field(min_length=2, max_length=2000)] = None
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