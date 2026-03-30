from http import HTTPStatus

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

import src.controllers.user as controllers
from src.dependencies.database import get_db
from src.dependencies.user import get_user_or_404
from src.models.user import User
from src.schemas.api_response import SuccessResponse
from src.schemas.user import UserPartialUpdateRequest, UserResponse

router = APIRouter(prefix="/users", tags=["users"])

@router.patch("", status_code=HTTPStatus.OK, response_model=SuccessResponse[UserResponse])
def partial_update_user(
	payload: UserPartialUpdateRequest,
	user: User = Depends(get_user_or_404),
	db: Session = Depends(get_db)
) -> SuccessResponse[UserResponse]:
	return controllers.partial_update_user(
		payload,
		user,
		db
	)


@router.delete("", status_code=HTTPStatus.NO_CONTENT, response_model=None)
def delete_user(
	user: User = Depends(get_user_or_404),
	db: Session = Depends(get_db)
) -> None:
	controllers.delete_user(
		user,
		db
	)


@router.patch(
    "/profile-picture",
    status_code=HTTPStatus.OK,
    response_model=SuccessResponse[UserResponse]
)
def update_profile_picture(
    file: UploadFile = File(...),
    user: User = Depends(get_user_or_404),
    db: Session = Depends(get_db)
):
    return controllers.update_profile_picture(
        file,
        user,
        db
    )


@router.get("/me", status_code=HTTPStatus.OK, response_model=SuccessResponse[UserResponse])
def get_user(
	user: User = Depends(get_user_or_404),
) -> SuccessResponse[UserResponse]:
	return SuccessResponse[UserResponse](
		message="User fetched successfully",
		data=UserResponse.model_validate(user)
	)
@router.delete(
    "/profile-picture",
    status_code=HTTPStatus.OK,
    response_model=SuccessResponse[UserResponse]
)
def delete_profile_picture(
    user: User = Depends(get_user_or_404),
    db: Session = Depends(get_db)
):
    user.profile_pic_url = None
    db.flush()
    db.refresh(user)
    return SuccessResponse[UserResponse](
        message="User fetched successfully",
        data=UserResponse.model_validate(user)
    )