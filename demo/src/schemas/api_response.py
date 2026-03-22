from typing import Generic, TypeVar, Union

from pydantic import BaseModel

T = TypeVar("T")

class SuccessResponse(BaseModel, Generic[T]):
	success: bool = True
	message: str = "Request Successful"
	data: Union[T, None] = None
