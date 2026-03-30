from http import HTTPStatus

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

import src.controllers.auth as controllers
from src.dependencies.database import get_db
from src.schemas.api_response import SuccessResponse
from src.schemas.auth import LoginRequest, SignupRequest
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
    "/login", status_code=HTTPStatus.OK, response_model=SuccessResponse
)
def login(payload: LoginRequest, db: Session = Depends(get_db), response: Response = None):
    return controllers.login(payload, db, response)


@router.post("/logout", status_code=HTTPStatus.OK, response_model=SuccessResponse)
def logout(
	request: Request,
	db: Session = Depends(get_db),
	response: Response = None,
) -> SuccessResponse:
	return controllers.logout(request, db, response)


@router.post("/refresh", status_code=HTTPStatus.OK, response_model=SuccessResponse)
def refresh(
	request: Request,
	db: Session = Depends(get_db),
	response: Response = None,
) -> SuccessResponse:
	return controllers.refresh(request, db, response)
