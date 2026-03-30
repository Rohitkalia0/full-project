from http import HTTPStatus
from uuid import UUID

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.dependencies.auth import get_current_user
from src.dependencies.database import get_db
from src.exceptions import DomainException
from src.models.user import User


def get_user_or_404(
	user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> User:
	stmt = select(User).where(User.id == user_id)
	user_data = db.scalar(stmt)
	if user_data is None:
		raise DomainException(
			status_code=HTTPStatus.NOT_FOUND,
			message="user does not exist"
		)

	return user_data
