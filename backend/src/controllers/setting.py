from sqlalchemy.orm import Session

import src.services.setting as services
from src.models.user import User
from src.schemas.api_response import SuccessResponse
from src.schemas.setting import SettingCreateRequest, SettingPartialUpdateRequest, SettingResponse


def create_setting(
	payload: SettingCreateRequest,
	user: User,
	db: Session
) -> SuccessResponse[SettingResponse]:
	setting_data = services.create_setting(
		payload,
		user,
		db
	)
	
	return SuccessResponse[SettingResponse](
		message=f"settings for user[{user.id}] fetched successfully",
		data=setting_data
	)


def get_setting(
	user: User,
	db: Session
) -> SuccessResponse[SettingResponse]:
	setting_data = services.get_setting(
		user,
		db
	)

	return SuccessResponse[SettingResponse](
		message=f"settings for user[{user.id}] fetched successfully",
		data=setting_data
	)


def partial_update_setting(
	payload: SettingPartialUpdateRequest,
	user: User,
	db: Session
) -> SuccessResponse[SettingResponse]:
	setting_data = services.partial_update_setting(
		payload,
		user,
		db
	)

	return SuccessResponse[SettingResponse](
		message=f"settings for user[{user.id}] fetched successfully",
		data=setting_data
	)
