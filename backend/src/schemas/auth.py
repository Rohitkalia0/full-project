import re
from typing import Union

from pydantic import BaseModel, EmailStr, field_validator

from src.schemas.base import BaseSchema


PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$"
)

class SignupRequest(BaseSchema):
	email: EmailStr
	password: str

	@field_validator("password")
	@classmethod
	def password_strength(cls, passwd: str):
		if not PASSWORD_REGEX.match(passwd):
			raise ValueError(
				"Password must contain uppercase, lowercase, digit, special character and be 8+ chars"
			)
		return passwd
	
	@field_validator("email", mode="before")
	@classmethod
	def normalize_email(cls, value: str) -> str:
		return value.lower()


class LoginRequest(BaseSchema):
	email: EmailStr
	password: str
	
	@field_validator("email", mode="before")
	@classmethod
	def normalize_email(cls, value: str) -> str:
		return value.lower()


class TokenResponse(BaseModel):
	token_type: str
	access_token: str
	refresh_token: Union[str, None] = None


class RefreshTokenRequest(BaseSchema):
	refresh_token: str

