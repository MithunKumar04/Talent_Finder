from fastapi import status
from src.core.exceptions.base_exception import AppException


class InvalidCredentialsException(AppException):
    def __init__(self):
        super().__init__(
            message="Invalid email or password",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class InvalidTokenException(AppException):
    def __init__(self):
        super().__init__(
            message="Invalid or expired token",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class PermissionDeniedException(AppException):
    def __init__(self):
        super().__init__(
            message="You do not have permission",
            status_code=status.HTTP_403_FORBIDDEN
        )