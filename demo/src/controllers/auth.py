from sqlalchemy.orm import Session

import src.services.auth as services
from src.schemas.api_response import SuccessResponse
from src.schemas.auth import LoginRequest, RefreshTokenRequest, SignupRequest, TokenResponse
from src.schemas.user import UserResponse


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
    db: Session
) -> SuccessResponse[TokenResponse]:
	token_data = services.login(
		payload,
		db
	)

	return SuccessResponse[TokenResponse](
		message="User logged in.",
		data=token_data
	)


def logout(
	payload: RefreshTokenRequest,
	db: Session
) -> SuccessResponse:
	_ = services.logout(
		payload,
		db
	)
	
	return SuccessResponse(
		message="user successfully logout"
	)


def refresh(
	payload: RefreshTokenRequest,
	db: Session
) -> SuccessResponse[TokenResponse]:
	token_data = services.refresh(
		payload,
		db
	)
	
	return SuccessResponse[TokenResponse](
		message="new access token generated for user",
		data=token_data
	)
	

