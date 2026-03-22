from uuid import UUID
from datetime import date
from sqlalchemy.orm import Session

import src.services.morning as Service

from src.schemas.api_response import SuccessResponse
from src.schemas.morning import MorningCreate, MorningUpdate
from src.schemas.morning_activity import MorningActivityCreate


def create_morning(payload: MorningCreate, db: Session, user_id: UUID):

    morning = Service.create_morning(db, user_id, payload)

    return SuccessResponse(
        message="Morning created successfully",
        data=morning
    )


def add_activity(checkin_id: UUID, payload: MorningActivityCreate, db: Session, user_id: UUID):

    activity = Service.add_activity(db, user_id, checkin_id, payload)

    return SuccessResponse(
        message="Activity added",
        data=activity
    )


def update_morning(checkin_id: UUID, payload: MorningUpdate, db: Session, user_id: UUID):

    morning = Service.update_morning(db, user_id, checkin_id, payload)

    return SuccessResponse(
        message="Morning updated",
        data=morning
    )


def get_morning(target_date: date, db: Session, user_id: UUID):

    morning = Service.get_morning(db, user_id, target_date)

    return SuccessResponse(
        message="Morning retrieved",
        data=morning
    )


def delete_activity(activity_id: UUID, db: Session, user_id: UUID):

    Service.delete_activity(db, user_id, activity_id)

    return SuccessResponse(
        message="Activity deleted"
    )