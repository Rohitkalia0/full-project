from http import HTTPStatus

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import src.controllers.auth as controllers
from src.dependencies.database import get_db
from src.schemas.api_response import SuccessResponse
from src.schemas.auth import LoginRequest, RefreshTokenRequest, SignupRequest, TokenResponse
from src.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/signup",
    status_code=HTTPStatus.CREATED,
    response_model=SuccessResponse[UserResponse],
)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    return controllers.signup(payload, db)


@router.post(
    "/login", status_code=HTTPStatus.OK, response_model=SuccessResponse[TokenResponse]
)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    return controllers.login(payload, db)


@router.post("/logout", status_code=HTTPStatus.OK, response_model=SuccessResponse)
def logout(
	payload: RefreshTokenRequest,
	db: Session = Depends(get_db)
) -> SuccessResponse:
	return controllers.logout(
		payload,
		db
	)


@router.post("/refresh", status_code=HTTPStatus.OK, response_model=SuccessResponse[TokenResponse])
def refresh(
	payload: RefreshTokenRequest,
	db: Session = Depends(get_db)
) -> SuccessResponse[TokenResponse]:
	return controllers.refresh(
		payload,
		db
	)

