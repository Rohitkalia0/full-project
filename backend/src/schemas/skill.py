from datetime import date
from enum import Enum
from typing import List, Union
from uuid import UUID

from pydantic import BaseModel, ConfigDict, field_validator

from src.schemas.base import BaseSchema


class SkillActivityResponse(BaseModel):
	model_config = ConfigDict(from_attributes=True)

	id: UUID
	entry_date: date
	name: str
	is_priority: bool
	is_habit_to_protect: bool
	is_completed: bool
	minutes_practised: int


class SkillActivityCreateRequest(BaseSchema):
	name: str
	is_priority: bool = False
	is_habit_to_protect: bool = False
	is_completed: bool = False
	minutes_practised: int = 0

	@field_validator("minutes_practised", mode="after")
	def validate_minutes_practised(cls, param):
		if param < 0:
			raise ValueError("minutes_practised should be greater than or equal to 0")
		return param



class SkillActivityUpdateRequest(BaseSchema):
	id: UUID
	name: str
	is_priority: bool
	is_habit_to_protect: bool
	is_completed: bool
	minutes_practised: int

	@field_validator("id", mode="before")
	def validate_id(cls, param):
		return UUID(param)

	@field_validator("minutes_practised", mode="after")
	def validate_minutes_practised(cls, param):
		if param < 0:
			raise ValueError("minutes_practised should be greater than or equal to 0")
		return param

class SkillActivityPartialUpdateRequest(BaseSchema):
	id: UUID
	name: Union[str, None] = None
	is_priority: Union[bool, None] = None
	is_habit_to_protect: Union[bool, None] = None
	is_completed: Union[bool, None] = None
	minutes_practised: Union[int, None] = None

	@field_validator("id", mode="before")
	def validate_id(cls, param):
		return UUID(param)

	@field_validator("minutes_practised", mode="after")
	def validate_minutes_practised(cls, param):
		if param < 0:
			raise ValueError("minutes_practised should be greater than or equal to 0")
		return param


class SkillActivitiesCreateRequest(BaseSchema):
	activities: List[SkillActivityCreateRequest]

class SkillActivitiesUpdateRequest(BaseSchema):
	activities: List[SkillActivityUpdateRequest]

class SkillActivitiesPartialUpdateRequest(BaseSchema):
	activities: List[SkillActivityPartialUpdateRequest]

class SkillActivitiesResponse(BaseModel):
	activities: Union[List[SkillActivityResponse], None] = None

class SkillResponse(BaseModel):
    id: UUID
    name: str
    is_completed: bool
    total_activities: Union[int, None] = None
    activities: Union[List[SkillActivityResponse], None] = None

class SkillCreateRequest(BaseSchema):
    name: str
    activities: Union[List[SkillActivityCreateRequest], None] = None

class SkillUpdateRequest(BaseSchema):
    name: str
    is_completed: bool

class SkillPartialUpdateRequest(BaseSchema):
    name: Union[str, None] = None
    is_completed: Union[bool, None] = None


class SkillsResponse(BaseModel):
	total_skills: int
	skills: Union[List[SkillResponse], None] = None



class SkillSortField(str, Enum):
	created_at = "created_at"
	updated_at = "updated_at"
	skill_name = "name"
	
class SortOrder(str, Enum):
	asc = "asc"
	desc = "desc"
