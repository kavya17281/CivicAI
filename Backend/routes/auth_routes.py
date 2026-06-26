from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from google.cloud.firestore import SERVER_TIMESTAMP

from Backend.auth import get_verified_firebase_user
from Backend.firebase_service import db

router = APIRouter(prefix="/auth", tags=["Auth"])


ALLOWED_CITIES = {"Roorkee"}

ALLOWED_AREAS = {
    "Civil Lines",
    "Main Market",
    "Railway Road",
    "Bus Stand Area",
    "IIT Roorkee Campus",
    "Shivaji Colony",
    "Ganeshpur",
    "Ram Nagar",
    "Adarsh Nagar",
    "Malviya Chowk",
    "Prem Mandir Road",
    "Canal Road",
    "Saket Colony",
    "Bharat Nagar",
    "Purani Tehsil",
    "New Haridwar Road",
    "Sot Mohalla",
    "Subhash Nagar",
    "Dhandera",
    "Other"
}


class CreateProfileRequest(BaseModel):
    name: str
    city: str
    area: str


@router.post("/create-profile")
def create_profile(
    request: CreateProfileRequest,
    firebase_user: dict = Depends(get_verified_firebase_user)
):
    if request.city not in ALLOWED_CITIES:
        raise HTTPException(status_code=400, detail="Only Roorkee is supported currently")

    if request.area not in ALLOWED_AREAS:
        raise HTTPException(status_code=400, detail="Invalid area selected")

    uid = firebase_user["uid"]
    email = firebase_user["email"]

    user_data = {
        "uid": uid,
        "name": request.name,
        "email": email,
        "role": "user",
        "city": request.city,
        "area": request.area,
        "createdAt": SERVER_TIMESTAMP
    }

    db.collection("users").document(uid).set(user_data)

    return {
        "message": "Profile created successfully",
        "user": {
            "uid": uid,
            "name": request.name,
            "email": email,
            "role": "user",
            "city": request.city,
            "area": request.area
        }
    }