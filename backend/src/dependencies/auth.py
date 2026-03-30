from http import HTTPStatus
from uuid import UUID

from fastapi import Request

from src.exceptions import DomainException
from src.utils.jwt_handler import JWTToken, decode_token

# --- OLD: Bearer token based auth ---
# from typing import Union
# from fastapi import Depends
# from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
#
# security = HTTPBearer(auto_error=False)
#
# def get_current_user(
#     credentials: Union[HTTPAuthorizationCredentials, None] = Depends(security)
# ) -> UUID:
#     if not credentials:
#         raise DomainException(
#             status_code=HTTPStatus.UNAUTHORIZED,
#             message="Invalid Credentials"
#         )
#     token = decode_token(credentials.credentials)
#     if token is None or token.token_type != JWTToken.ACCESS_TOKEN:
#         raise DomainException(
#             status_code=HTTPStatus.UNAUTHORIZED,
#             message="Invalid Credentials"
#         )
#     return UUID(token.user_id)
# --- END OLD ---


def get_current_user(request: Request) -> UUID:
	access_token = request.cookies.get("access_token")

	if not access_token:
		raise DomainException(
			status_code=HTTPStatus.UNAUTHORIZED,
			message="Invalid Credentials"
		)

	token = decode_token(access_token)

	if token is None or token.token_type != JWTToken.ACCESS_TOKEN:
		raise DomainException(
			status_code=HTTPStatus.UNAUTHORIZED,
			message="Invalid Credentials"
		)

	return UUID(token.user_id)
