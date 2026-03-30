from typing import Annotated, Union
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from src.schemas.base import BaseSchema


class UserResponse(BaseModel):
	model_config = ConfigDict(from_attributes=True)
	id: UUID
	first_name: Union[str, None] = None
	last_name: Union[str, None] = None
	email: str
	profile_pic_url: Union[str, None] = None


class UserPartialUpdateRequest(BaseSchema):
	first_name: Annotated[Union[str, None], Field(min_length=2, max_length=20)] = None
	last_name: Annotated[Union[str, None], Field(min_length=2, max_length=20)] = None
