from http import HTTPStatus
from typing import List
from uuid import UUID

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from src.dependencies.database import get_db
from src.dependencies.user import get_user_or_404
from src.exceptions import DomainException
from src.models.skill import Skill
from src.models.skill_activity import SkillActivity
from src.models.user import User


def get_skill_or_404(
	skill_id: UUID,
	user: User = Depends(get_user_or_404),
	db: Session = Depends(get_db)
) -> Skill:

	stmt = select(Skill).where(Skill.id == skill_id)
	skill_data = db.scalar(stmt)

	if skill_data is None or skill_data.user_id != user.id:
		raise DomainException(
			status_code=HTTPStatus.NOT_FOUND,
			message=f"skill with {skill_id} does not exist"
		)

	return skill_data


def get_skill_activity_or_404(
	activity_id: UUID,
	skill: Skill = Depends(get_skill_or_404),
	db: Session = Depends(get_db)
) -> SkillActivity:
	stmt = select(SkillActivity).where(SkillActivity.id == activity_id)
	activity_data = db.scalar(stmt)

	if activity_data is None or activity_data.skill_id != skill.id:
		raise DomainException(
			status_code=HTTPStatus.NOT_FOUND,
			message=f"skill activity with {activity_id} does not exist"
		)

	return activity_data


def validate_skill_activity_ids_or_404(
	ids: List[UUID],
	skill_id: UUID,
	db: Session
) -> None:
	stmt = select(SkillActivity.id).where(SkillActivity.id.in_(ids)).where(SkillActivity.skill_id == skill_id)
	found_ids = db.scalars(stmt).all()
	missing_ids = set(ids) - set(found_ids)

	if missing_ids:
		raise DomainException(
			status_code=HTTPStatus.NOT_FOUND,
			message=f"activities not found: {missing_ids}"
		)
