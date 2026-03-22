from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class DomainException(Exception):
    def __init__(
        self,
        status_code: int,
        message: str = "Request Failed",
    ):
        self.status_code = status_code
        self.message = message
        super().__init__(message)


def error_response(status_code: int, message: str) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": False,
            "message": message
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
        return error_response(
            HTTPStatus.UNPROCESSABLE_CONTENT,
            HTTPStatus.UNPROCESSABLE_CONTENT.phrase
        )
