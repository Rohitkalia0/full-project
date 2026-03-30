from http import HTTPStatus
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import Session
from src.models.evening import Evening
from src.schemas.evening import EveningCreate, EveningUpdate, EveningResponse
from src.exceptions import DomainException
from datetime import date
# for creating the evening entry

def create_evening(db: Session , user_id: UUID, payload: EveningCreate):
    today = date.today()
    stmt = select(Evening).where(Evening.user_id == user_id, Evening.date == today)
    existing=db.scalar(stmt)
    if existing: 
        raise DomainException(
            status_code=HTTPStatus.CONFLICT,
            message=f"Evening entry for date {today} already exists.")
    evening=Evening(
        user_id=user_id,
        win=payload.win,
        mistake=payload.mistake,
        distraction=payload.distraction,
        mood_rating=payload.mood_rating,
        energy_rating=payload.energy_rating,
        lesson=payload.lesson)
    db.add(evening)
    db.flush()
    db.refresh(evening)
    return EveningResponse.model_validate(evening)

# for updating the evening entry
def update_evening(db: Session, user_id: UUID, payload: EveningUpdate, evening_id: UUID):
    stmt = select(Evening).where(Evening.id == evening_id, Evening.user_id == user_id)
    evening = db.scalar(stmt)
    if not evening:
        raise DomainException(
            status_code=HTTPStatus.NOT_FOUND,
            message="Evening entry not found.")
    update_data = payload.model_dump(exclude_unset=True, exclude_none=True)
    for field, value in update_data.items():
        setattr(evening, field, value)
    db.add(evening)
    db.flush()
    db.refresh(evening)
    return EveningResponse.model_validate(evening)

# for get evening by id

def get_evening(db: Session, target_date: date, user_id: UUID):

    stmt = select(Evening).where(
        Evening.date == target_date,
        Evening.user_id == user_id
    )

    evening = db.scalar(stmt)

    if not evening:
        raise DomainException(
            status_code=HTTPStatus.NOT_FOUND,
            message="Evening entry not found."
        )

    return EveningResponse.model_validate(evening)

# for deleting the evening entery

def delete_evening(db: Session, evening_id: UUID, user_id: UUID):
    stmt = select(Evening).where(Evening.id == evening_id, Evening.user_id == user_id)
    evening = db.scalar(stmt)
    if not evening:
        raise DomainException(
            status_code=HTTPStatus.NOT_FOUND,
            message="Evening entry not found.")
    db.delete(evening)