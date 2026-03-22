import os
from datetime import datetime, timezone

from fastapi import UploadFile
from sqlalchemy.orm import Session

from src.models.user import User
from src.schemas.user import UserPartialUpdateRequest, UserProfileResponse, UserResponse
from src.core.config import settings

def partial_update_user(
	payload: UserPartialUpdateRequest,
	user: User,
	db: Session
) -> UserResponse:
	updated_payload = payload.model_dump(exclude_none=True, exclude_unset=True)
	for key, value in updated_payload.items():
		setattr(user, key, value)

	db.flush()
	db.refresh(user)

	return UserResponse.model_validate(user)


def delete_user(
	user: User,
	db: Session
) -> None:
	user.deleted_at = datetime.now(timezone.utc)


def update_profile_picture(
    file: UploadFile,
    user: User,
    db: Session
) -> UserProfileResponse:

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    file_path = f"{settings.UPLOAD_DIR}/{user.id}_{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    user.profile_pic_url = file_path

    db.flush()
    db.refresh(user)

    return UserProfileResponse.model_validate(user)
