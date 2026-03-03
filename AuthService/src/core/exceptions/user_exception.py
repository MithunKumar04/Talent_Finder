from fastapi import status
from src.core.exceptions.base_exception import AppException


class UserAlreadyExistsException(AppException):
    def __init__(self):
        super().__init__(
            message="User already exists",
            status_code=status.HTTP_400_BAD_REQUEST
        )


class UserNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="User not found",
            status_code=status.HTTP_404_NOT_FOUND
        )