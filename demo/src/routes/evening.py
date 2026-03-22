from uuid import UUID
from http import HTTPStatus
from fastapi import  APIRouter, Depends
from sqlalchemy.orm import Session        
from src.schemas.evening import EveningCreate, EveningUpdate, EveningResponse
from src.dependencies.database import get_db
import src.controllers.evening as controllers
from src.schemas.api_response import SuccessResponse
from src.dependencies.auth import get_current_user
from datetime import date



router = APIRouter(prefix="/evening", tags=["evening"])

@router.post("", status_code=HTTPStatus.CREATED, response_model=SuccessResponse[EveningResponse])
def create_evening(payload : EveningCreate, db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    return controllers.create_evening( payload,db, user_id)

@router.patch("/{evening_id}", status_code=HTTPStatus.OK, response_model=SuccessResponse[EveningResponse])
def update_evening(evening_id: UUID, payload: EveningUpdate, db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    return controllers.update_evening( payload, db,evening_id, user_id)

@router.get("/{target_date}", status_code=HTTPStatus.OK, response_model=SuccessResponse[EveningResponse])
def get_evening(target_date: date, db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    return controllers.get_evening(target_date, db, user_id)

@router.delete("/{evening_id}", status_code=HTTPStatus.OK, response_model=SuccessResponse)
def delete_evening(evening_id: UUID, db: Session = Depends(get_db), user_id=Depends(get_current_user)):
    return controllers.delete_evening(evening_id, db, user_id)