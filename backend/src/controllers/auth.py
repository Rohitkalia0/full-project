from http import HTTPStatus

from fastapi import Request, Response
from sqlalchemy.orm import Session

import src.services.auth as services
from src.exceptions import DomainException
from src.schemas.api_response import SuccessResponse
from src.schemas.auth import LoginRequest, RefreshTokenRequest, SignupRequest
from src.schemas.user import UserResponse
from src.core.config import settings



def signup(
	payload: SignupRequest,
	db: Session
) -> SuccessResponse[UserResponse]:
    user_data = services.signup(
    	payload,
     	db
    )

    return SuccessResponse[UserResponse](
    	message="user created successfully",
     	data=user_data
    )


def login(
    payload: LoginRequest,
    db: Session,
    response: Response,
) -> SuccessResponse:
	tokens = services.login(payload, db)

	response.set_cookie("access_token", tokens["access_token"], httponly=True, samesite="none", secure=True, path="/", max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
	response.set_cookie("refresh_token", tokens["refresh_token"], httponly=True, samesite="none", secure=True, path="/", max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60)

	return SuccessResponse(
		message="User logged in.",
	)


def logout(
	request: Request,
	db: Session,
	response: Response,
) -> SuccessResponse:
	refresh_token = request.cookies.get("refresh_token")
	if not refresh_token:
		raise DomainException(
			status_code=HTTPStatus.UNAUTHORIZED,
			message="No refresh token provided"
		)

	payload = RefreshTokenRequest(refresh_token=refresh_token)
	_ = services.logout(payload, db)

	response.delete_cookie("access_token", httponly=True, samesite="none", secure=True, path="/")
	response.delete_cookie("refresh_token", httponly=True, samesite="none", secure=True, path="/")

	return SuccessResponse(
		message="user successfully logout"
	)


def refresh(
	request: Request,
	db: Session,
	response: Response,
) -> SuccessResponse:
	refresh_token = request.cookies.get("refresh_token")
	if not refresh_token:
		raise DomainException(
			status_code=HTTPStatus.UNAUTHORIZED,
			message="No refresh token provided"
		)

	payload = RefreshTokenRequest(refresh_token=refresh_token)
	tokens = services.refresh(payload, db)

	response.set_cookie("access_token", tokens["access_token"], httponly=True, samesite="none", secure=True, path="/", max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)
	response.set_cookie("refresh_token", tokens["refresh_token"], httponly=True, samesite="none", secure=True, path="/", max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60)

	return SuccessResponse(
		message="new access token generated for user",
	)
