from http import HTTPStatus
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import src.controllers.setting as controllers
from src.dependencies.database import get_db
from src.dependencies.user import get_user_or_404
from src.models.user import User
from src.schemas.api_response import SuccessResponse
from src.schemas.setting import SettingCreateRequest, SettingPartialUpdateRequest, SettingResponse

router = APIRouter(prefix="/settings", tags=["settings"])


@router.post("", status_code=HTTPStatus.CREATED, response_model=SuccessResponse[SettingResponse])
def create_setting(
	payload: SettingCreateRequest,
	user: User = Depends(get_user_or_404),
	db: Session = Depends(get_db)
) -> SuccessResponse[SettingResponse]:
	return controllers.create_setting(
		payload,
		user,
		db
	)
	

@router.get("", status_code=HTTPStatus.OK, response_model=SuccessResponse[SettingResponse])
def get_settings(
	user: User = Depends(get_user_or_404),
    db: Session = Depends(get_db)
) -> SuccessResponse[SettingResponse]:
	return controllers.get_setting(
		user,
		db
	)


@router.patch("", status_code=HTTPStatus.OK, response_model=SuccessResponse[SettingResponse])
def update_setting(
    payload: SettingPartialUpdateRequest,
    user: User = Depends(get_user_or_404),
    db: Session = Depends(get_db)
) -> SuccessResponse[SettingResponse]:
	return controllers.partial_update_setting(
		payload,
		user,
		db
	)
