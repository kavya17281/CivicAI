from fastapi import APIRouter, Depends
from pydantic import BaseModel
from google.cloud.firestore import SERVER_TIMESTAMP

from Backend.auth import get_verified_firebase_user
from Backend.firebase_service import db

router = APIRouter(prefix="/auth", tags=["Auth"])


class CreateProfileRequest(BaseModel):
    name: str


@router.post("/create-profile")
def create_profile(
    request: CreateProfileRequest,
    firebase_user: dict = Depends(get_verified_firebase_user)
):
    uid = firebase_user["uid"]
    email = firebase_user["email"]

    user_data = {
        "uid": uid,
        "name": request.name,
        "email": email,
        "role": "user",
        "createdAt": SERVER_TIMESTAMP
    }

    db.collection("users").document(uid).set(user_data)

    return {
        "message": "Profile created successfully",
        "user": {
            "uid": uid,
            "name": request.name,
            "email": email,
            "role": "user"
        }
    }