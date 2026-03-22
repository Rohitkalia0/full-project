from sqlalchemy.orm import Session

import src.services.skill as services
from src.models.skill import Skill
from src.models.skill_activity import SkillActivity
from src.models.user import User
from src.schemas.api_response import SuccessResponse
from src.schemas.skill import (
    SkillActivitiesCreateRequest,
    SkillActivitiesPartialUpdateRequest,
    SkillActivitiesResponse,
    SkillActivitiesUpdateRequest,
    SkillActivityResponse,
    SkillCreateRequest,
    SkillPartialUpdateRequest,
    SkillResponse,
    SkillsResponse,
    SkillUpdateRequest,
)


def get_skills(
	user: User,
	db: Session
) -> SuccessResponse[SkillsResponse]:
	skills_data = services.get_skills(
		user,
		db
	)

	return SuccessResponse[SkillsResponse](
		message=f"skills for user [{user.id}] fetched successfully",
		data=skills_data
	)


def create_skill(
	payload: SkillCreateRequest,
	user: User,
	db: Session
) -> SuccessResponse[SkillResponse]:
	skill_data = services.create_skill(
		payload,
		user,
		db
	)

	return SuccessResponse[SkillResponse](
		message="skill created successfully",
		data=skill_data
	)


def get_skill_by_id(
	skill: Skill,
	db: Session
) -> SuccessResponse[SkillResponse]:
	skill_data = services.get_skill_by_id(
		skill,
		db
	)

	return SuccessResponse[SkillResponse](
		message="skill fetched successfully",
		data=skill_data
	)


def update_skill_by_id(
	payload: SkillUpdateRequest,
	user: User,
	skill: Skill,
	db: Session
) -> SuccessResponse[SkillResponse]:
	skill_data = services.update_skill_by_id(
		payload,
		user,
		skill,
		db
	)

	return SuccessResponse[SkillResponse](
		message="skill updated successfully",
		data=skill_data
	)


def partial_update_skill_by_id(
	payload: SkillPartialUpdateRequest,
	user: User,
	skill: Skill,
	db: Session
) -> SuccessResponse[SkillResponse]:
	skill_data = services.partial_update_skill_by_id(
		payload,
		user,
		skill,
		db
	)

	return SuccessResponse[SkillResponse](
		message="skill patched successfully",
		data=skill_data
	)


def create_skill_activities(
	payload: SkillActivitiesCreateRequest,
	skill: Skill,
	db: Session
) -> SuccessResponse[SkillActivitiesResponse]:
	skill_activities_data = services.create_skill_activities(
		payload,
		skill,
		db
	)

	return SuccessResponse[SkillActivitiesResponse](
		message="skill activities created successfully",
		data=skill_activities_data
	)


def update_skill_activities(
	payload: SkillActivitiesUpdateRequest,
	skill: Skill,
	db: Session
) -> SuccessResponse[SkillActivitiesResponse]:
	skill_activities_data = services.update_skill_activities(
		payload,
		skill,
		db
	)

	return SuccessResponse[SkillActivitiesResponse](
		message="skill activities updated successfully",
		data=skill_activities_data
	)


def partial_update_skill_activities(
	payload: SkillActivitiesPartialUpdateRequest,
	skill: Skill,
	db: Session
) -> SuccessResponse[SkillActivitiesResponse]:
	skill_activities_data = services.partial_update_skill_activities(
		payload,
		skill,
		db
	)

	return SuccessResponse[SkillActivitiesResponse](
		message="skill activities patched successfully",
		data=skill_activities_data
	)


def get_skill_activity_by_id(
	activity: SkillActivity,
	skill: Skill,
	db: Session
) -> SuccessResponse[SkillActivityResponse]:
	skill_activity_data = services.get_skill_activity_by_id(
		activity,
		skill,
		db
	)

	return SuccessResponse[SkillActivityResponse](
		message="skill activity fetched successfully",
		data=skill_activity_data
	)


def delete_skill_activity_by_id(
	activity: SkillActivity,
	skill: Skill,
	db: Session
) -> SuccessResponse[SkillActivityResponse]:
	skill_activity_data = services.delete_skill_activity_by_id(
		activity,
		skill,
		db
	)

	return SuccessResponse[SkillActivityResponse](
		message="skill activity deleted successfully",
		data=skill_activity_data
	)
