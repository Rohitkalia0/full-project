from datetime import date
from http import HTTPStatus
from typing import List, Union
from uuid import UUID

from sqlalchemy import asc, desc
from sqlalchemy.orm import Session
from sqlalchemy.sql import select

from src.dependencies.skill import validate_skill_activity_ids_or_404
from src.exceptions import DomainException
from src.models.skill import Skill
from src.models.skill_activity import SkillActivity
from src.models.user import User
from src.schemas.skill import (
    SkillActivitiesCreateRequest,
    SkillActivitiesPartialUpdateRequest,
    SkillActivitiesResponse,
    SkillActivitiesUpdateRequest,
    SkillActivityResponse,
    SkillCreateRequest,
    SkillPartialUpdateRequest,
    SkillResponse,
    SkillSortField,
    SkillsResponse,
    SkillUpdateRequest,
    SortOrder,
)


def get_skills(
	entry_date: Union[date, None],
	sort_by: SkillSortField,
	order: SortOrder,
	user: User,
	db: Session
) -> SkillsResponse:
	order_func = asc if order == SortOrder.asc else desc
	stmt = select(Skill).where(Skill.user_id == user.id).order_by(order_func(sort_by))
	skills_data = db.scalars(stmt).all()

	result: List[SkillResponse] = []

	for data in skills_data:
		activities: List[SkillActivityResponse] = []
		if entry_date is None:
			stmt = select(SkillActivity).where(SkillActivity.skill_id == data.id)
		else:
			stmt = select(SkillActivity).where(SkillActivity.skill_id == data.id, SkillActivity.entry_date == entry_date)
		skill_activity_data = db.scalars(stmt).all()
		for activity in skill_activity_data:
			activities.append(SkillActivityResponse.model_validate(activity))

		result.append(SkillResponse(
			id=data.id,
			name=data.name,
			is_completed=data.is_completed,
			total_activities=len(activities),
			activities=activities
		))

	return SkillsResponse(
		total_skills=len(skills_data),
		skills=result
	)


def create_skill(
	payload: SkillCreateRequest,
	user: User,
	db: Session
) -> SkillResponse:

	stmt = select(Skill).where(Skill.name.ilike(payload.name), Skill.user_id == user.id)
	skill_data = db.scalar(stmt)
	if skill_data is not None:
		raise DomainException(
			status_code=HTTPStatus.CONFLICT,
			message=f"skill with name [{payload.name}] already exists"
		)

	skill_data = Skill(
		user_id=user.id,
		name=payload.name
	)
	db.add(skill_data)
	db.flush()
	db.refresh(skill_data)

	activities: List[SkillActivityResponse] = []
	if payload.activities is not None:

		for activity in payload.activities:
			skill_activity_data = SkillActivity(
				skill_id=skill_data.id,
				**activity.model_dump()
			)
			db.add(skill_activity_data)
			db.flush()
			db.refresh(skill_activity_data)

			activities.append(SkillActivityResponse.model_validate(skill_activity_data))

	return SkillResponse(
		id=skill_data.id,
		name=skill_data.name,
		is_completed=skill_data.is_completed,
		total_activities=len(activities),
		activities=activities
	)


def get_skill_by_id(
	skill: Skill,
	db: Session
) -> SkillResponse:
	activities: List[SkillActivityResponse] = []
	stmt = select(SkillActivity).where(SkillActivity.skill_id == skill.id)
	skill_activity_data = db.scalars(stmt).all()
	for activity in skill_activity_data:
		activities.append(SkillActivityResponse.model_validate(activity))

	return SkillResponse(
		id=skill.id,
		name=skill.name,
		is_completed=skill.is_completed,
		total_activities=len(activities),
		activities=activities
	)


def update_skill_by_id(
	payload: SkillUpdateRequest,
	user: User,
	skill: Skill,
	db: Session
) -> SkillResponse:
	stmt = select(Skill).where(Skill.name.ilike(payload.name), Skill.user_id == user.id, Skill.id != skill.id)
	skill_data = db.scalar(stmt)
	if skill_data is not None:
		raise DomainException(
			status_code=HTTPStatus.CONFLICT,
			message=f"skill with name [{payload.name}] already exists"
		)

	updated_payload = payload.model_dump()
	for key, value in updated_payload.items():
		setattr(skill, key, value)

	db.flush()
	db.refresh(skill)

	return SkillResponse(
		id=skill.id,
		name=skill.name,
		is_completed=skill.is_completed
	)


def partial_update_skill_by_id(
	payload: SkillPartialUpdateRequest,
	user: User,
	skill: Skill,
	db: Session
) -> SkillResponse:
	if payload.name:
		stmt = select(Skill).where(Skill.name.ilike(payload.name), Skill.user_id == user.id, Skill.id != skill.id)
		skill_data = db.scalar(stmt)
		if skill_data is not None:
			raise DomainException(
				status_code=HTTPStatus.CONFLICT,
				message=f"skill with name [{payload.name}] already exists"
			)

	updated_payload = payload.model_dump(exclude_none=True, exclude_unset=True)
	for key, value in updated_payload.items():
		setattr(skill, key, value)

	db.flush()
	db.refresh(skill)

	return SkillResponse(
		id=skill.id,
		name=skill.name,
		is_completed=skill.is_completed
	)


def create_skill_activities(
	payload: SkillActivitiesCreateRequest,
	skill: Skill,
	db: Session
) -> SkillActivitiesResponse:
	activities: List[SkillActivityResponse] = []
	for activity in payload.activities:
		skill_activity_data = SkillActivity(
			skill_id=skill.id,
			**activity.model_dump()
		)
		db.add(skill_activity_data)
		db.flush()
		db.refresh(skill_activity_data)

		activities.append(SkillActivityResponse.model_validate(skill_activity_data))

	return SkillActivitiesResponse(
		activities=activities
	)


def update_skill_activities(
	payload: SkillActivitiesUpdateRequest,
	skill: Skill,
	db: Session
) -> SkillActivitiesResponse:
	ids: List[UUID] = [activity.id for activity in payload.activities]
	validate_skill_activity_ids_or_404(ids, skill.id, db)

	activities: List[SkillActivityResponse] = []
	for activity in payload.activities:
		stmt = select(SkillActivity).where(SkillActivity.id == activity.id)
		skill_activity_data = db.scalar(stmt)

		updated_payload = activity.model_dump(exclude={"id"})
		for key, value in updated_payload.items():
			setattr(skill_activity_data, key, value)

		db.flush()
		db.refresh(skill_activity_data)
		activities.append(SkillActivityResponse.model_validate(skill_activity_data))

	return SkillActivitiesResponse(
		activities=activities
	)


def partial_update_skill_activities(
	payload: SkillActivitiesPartialUpdateRequest,
	skill: Skill,
	db: Session
) -> SkillActivitiesResponse:
	ids: List[UUID] = [activity.id for activity in payload.activities]
	validate_skill_activity_ids_or_404(ids, skill.id, db)

	activities: List[SkillActivityResponse] = []
	for activity in payload.activities:
		stmt = select(SkillActivity).where(SkillActivity.id == activity.id)
		skill_activity_data = db.scalar(stmt)

		updated_payload = activity.model_dump(exclude={"id"}, exclude_none=True, exclude_unset=True)
		for key, value in updated_payload.items():
			setattr(skill_activity_data, key, value)

		db.flush()
		db.refresh(skill_activity_data)
		activities.append(SkillActivityResponse.model_validate(skill_activity_data))

	return SkillActivitiesResponse(
		activities=activities
	)


def get_skill_activity_by_id(
	activity: SkillActivity,
	skill: Skill,
	db: Session
) -> SkillActivityResponse:
	return SkillActivityResponse.model_validate(activity)


def delete_skill_activity_by_id(
	activity: SkillActivity,
	skill: Skill,
	db: Session
) -> SkillActivityResponse:
	db.delete(activity)
	db.flush()

	return SkillActivityResponse.model_validate(activity)
