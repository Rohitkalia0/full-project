from http import HTTPStatus

from sqlalchemy.orm import Session
from sqlalchemy.sql import select

from src.exceptions import DomainException
from src.models.setting import Setting
from src.models.user import User
from src.schemas.setting import SettingCreateRequest, SettingPartialUpdateRequest, SettingResponse


def create_setting(
	payload: SettingCreateRequest,
	user: User,
	db: Session
) -> SettingResponse:
	stmt = select(Setting).where(Setting.user_id == user.id)
	setting_data = db.scalar(stmt)
	if setting_data is not None:
		raise DomainException(
			status_code=HTTPStatus.CONFLICT,
			message=f"settings for user[{user.id}] already exists",
		)
	
	setting_data = Setting(
		user_id=user.id,
		**payload.model_dump()
	)
	
	db.add(setting_data)
	db.flush()
	db.refresh(setting_data)
	
	return SettingResponse.model_validate(setting_data)


def get_setting(
	user: User,
	db: Session
) -> SettingResponse:

	stmt = select(Setting).where(Setting.user_id == user.id)
	setting_data = db.scalar(stmt)

	if setting_data is None:
		raise DomainException(
			status_code=HTTPStatus.NOT_FOUND,
			message=f"settings for user[{user.id}] not found",
		)

	return SettingResponse.model_validate(setting_data)



def partial_update_setting(
	payload: SettingPartialUpdateRequest,
	user: User,
	db: Session
) -> SettingResponse:

	stmt = select(Setting).where(Setting.user_id == user.id)
	setting_data = db.scalar(stmt)

	if setting_data is None:
		raise DomainException(
			status_code=HTTPStatus.NOT_FOUND,
			message=f"settings for user[{user.id}] not found",
		)

	updated_payload = payload.model_dump(exclude_unset=True, exclude_none=True)
	for key, value in updated_payload.items():
		setattr(setting_data, key, value)

	db.flush()
	db.refresh(setting_data)

	return SettingResponse.model_validate(setting_data)
