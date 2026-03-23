from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from typing import List
from pydantic import BaseModel

class DomainException(Exception):
    def __init__(
        self,
        status_code: int,
        message: str = "Request Failed",
    ):
        self.status_code = status_code
        self.message = message
        super().__init__(message)

class FieldViolation(BaseModel):
    field: str
    message: str

def error_response(status_code: int, message: str, field_violations: List[FieldViolation] = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message,
            "field_violations": [f.model_dump(mode="json") for f in field_violations] if field_violations else []
        }
    )




def register_exception_handlers(app: FastAPI):
    @app.exception_handler(DomainException)
    def domain_exception_handler(
        request: Request,
        exc: DomainException
    ) -> JSONResponse:
        return error_response(exc.status_code, exc.message)

    @app.exception_handler(RequestValidationError)
    def request_validation_exception_handler(
        request: Request,
        exc: RequestValidationError
    ) -> JSONResponse:
        
        field_violations: List[FieldViolation] = []
        for error in exc.errors():
            loc = error.get("loc", [])
            field_path = ".".join([str(value) for value in loc if value != "body"])
            field_violations.append(
            FieldViolation(
                field=field_path,
                message=error.get("msg", "Something went wrong")
            )
        )

        return error_response(
            HTTPStatus.UNPROCESSABLE_CONTENT,
            HTTPStatus.UNPROCESSABLE_CONTENT.phrase,
            field_violations=field_violations
        )
