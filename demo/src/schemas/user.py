from typing import Union
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from src.schemas.base import BaseSchema

class ProfilePicUpdateRequest(BaseModel):
	profile_pic_url: str


class UserProfileResponse(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	profile_pic_url: Union[str]


class UserResponse(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	id: UUID
	first_name: Union[str, None] = None
	last_name: Union[str, None] = None
	email: str
	profile_pic_url: Union[str, None] = None


class UserPartialUpdateRequest(BaseSchema):
	first_name: Union[str, None] = Field(
		default=None,
		min_length=2,
		max_length=20
	)
	last_name: Union[str, None] = Field(
		default=None,
		min_length=True,
		max_length=True
	)
