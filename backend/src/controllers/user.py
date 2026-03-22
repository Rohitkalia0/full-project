from fastapi import UploadFile
from sqlalchemy.orm import Session

import src.services.user as services
from src.models.user import User
from src.schemas.api_response import SuccessResponse
from src.schemas.user import UserPartialUpdateRequest, UserProfileResponse, UserResponse


def partial_update_user(
	payload: UserPartialUpdateRequest,
	user: User,
	db: Session
) -> SuccessResponse[UserResponse]:
	user_data = services.partial_update_user(
		payload,
		user,
		db
	)

	return SuccessResponse[UserResponse](
		message=f"user[{user.id}] patched successfully",
		data=user_data
	)


def delete_user(
	user: User,
	db: Session
) -> None:
	services.delete_user(
		user,
		db
	)


def update_profile_picture(
    file: UploadFile,
    user: User,
    db: Session
) -> SuccessResponse[UserProfileResponse]:

    user_data = services.update_profile_picture(
        file,
        user,
        db
    )

    return SuccessResponse[UserProfileResponse](
        message="profile picture updated successfully",
        data=user_data
    )
