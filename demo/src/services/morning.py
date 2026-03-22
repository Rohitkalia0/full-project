from datetime import date
from uuid import UUID
from http import HTTPStatus

from sqlalchemy.orm import Session
from sqlalchemy import select

from src.models.morning import Morning
from src.models.morning_activity import MorningActivity
from src.schemas.morning import MorningCreate, MorningUpdate, MorningResponse
from src.schemas.morning_activity import MorningActivityResponse
from src.exceptions import DomainException
from src.schemas.morning_activity import MorningActivityCreate


def create_morning(db: Session, user_id: UUID, payload: MorningCreate):

    today = date.today()

    stmt = select(Morning).where(
        Morning.user_id == user_id,
        Morning.date == today
    )

    existing = db.scalar(stmt)

    if existing:
        raise DomainException(
            status_code=HTTPStatus.CONFLICT,
            message="Morning already exists"
        )

    morning = Morning(
        user_id=user_id,
        confidence_rating=payload.confidence_rating
    )

    db.add(morning)
    db.flush()

    for activity in payload.activities:

        new_activity = MorningActivity(
            checkin_id=morning.id,
            title=activity.title,
            is_priority=activity.is_priority,
            is_habit=activity.is_habit
        )

        db.add(new_activity)

    db.flush()
    db.refresh(morning)

    return MorningResponse.model_validate(morning)


def add_activity(db: Session, user_id: UUID, checkin_id: UUID, payload: MorningActivityCreate):

    stmt = select(Morning).where(
        Morning.id == checkin_id,
        Morning.user_id == user_id
    )

    morning = db.execute(stmt).scalar_one_or_none()

    if not morning:
        raise DomainException(
            status_code=HTTPStatus.NOT_FOUND,
            message="Morning not found"
        )

    activity = MorningActivity(
        checkin_id=checkin_id,
        title=payload.title,
        is_priority=payload.is_priority,
        is_habit=payload.is_habit
    )

    db.add(activity)
    db.flush()
    db.refresh(activity)

    return MorningActivityResponse.model_validate(activity)


def update_morning(db: Session, user_id: UUID, checkin_id: UUID, payload: MorningUpdate):

    stmt = select(Morning).where(
        Morning.id == checkin_id,
        Morning.user_id == user_id
    )

    morning = db.execute(stmt).scalar_one_or_none()

    if not morning:
        raise DomainException(
            status_code=HTTPStatus.NOT_FOUND,
            message="Morning not found"
        )

    if payload.confidence_rating is not None:
        morning.confidence_rating = payload.confidence_rating

    if payload.activities:

        for activity_update in payload.activities:

            stmt = select(MorningActivity).where(
                MorningActivity.id == activity_update.id,
                MorningActivity.checkin_id == checkin_id
            )

            activity = db.execute(stmt).scalar_one_or_none()

            if not activity:
                continue

            update_data = activity_update.model_dump(exclude_unset=True)

            for key, value in update_data.items():
                setattr(activity, key, value)

    db.flush()
    db.refresh(morning)

    return MorningResponse.model_validate(morning)


def get_morning(db: Session, user_id: UUID, target_date: date):

    stmt = select(Morning).where(
        Morning.user_id == user_id,
        Morning.date == target_date
    )

    morning = db.execute(stmt).scalar_one_or_none()

    if not morning:
        raise DomainException(
            status_code=HTTPStatus.NOT_FOUND,
            message="Morning not found"
        )

    return MorningResponse.model_validate(morning)


def delete_activity(db: Session, user_id: UUID, activity_id: UUID):

    stmt = select(MorningActivity).join(Morning).where(
        MorningActivity.id == activity_id,
        Morning.user_id == user_id
    )

    activity = db.execute(stmt).scalar_one_or_none()

    if not activity:
        raise DomainException(
            status_code=HTTPStatus.NOT_FOUND,
            message="Activity not found"
        )

    db.delete(activity)
    db.flush()
    return MorningActivityResponse.model_validate(activity)