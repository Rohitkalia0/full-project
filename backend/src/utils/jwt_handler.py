from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Tuple, Union
from uuid import UUID

import jwt
from pydantic import BaseModel

from src.core.config import settings


class JWTToken(str, Enum):
    ACCESS_TOKEN = "access"
    REFRESH_TOKEN = "refresh"


class JWTPayload(BaseModel):
    user_id: str
    exp: datetime
    iat: datetime
    token_type: str


ALGORITHM = "HS256"


def create_token(
    user_id: UUID,
    token_type: JWTToken
) -> Tuple[JWTPayload, str]:

    match token_type:
        case JWTToken.ACCESS_TOKEN:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        case JWTToken.REFRESH_TOKEN:
            expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)


    payload = JWTPayload(
        user_id=str(user_id),
        exp=expire,
        iat=datetime.now(timezone.utc),
        token_type=token_type.value
    )

    return (payload, jwt.encode(payload.model_dump(), settings.JWT_SECRET_KEY, ALGORITHM))


def decode_token(
    token: str
) -> Union[JWTPayload, None]:

    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, [ALGORITHM])
        return JWTPayload(**payload)
    except jwt.PyJWTError:
        return None
