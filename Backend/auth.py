from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from Backend.firebase_service import firebase_auth, db

security = HTTPBearer()


def get_verified_firebase_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        decoded_token = firebase_auth.verify_id_token(token, clock_skew_seconds=10)

        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email")
        }

    except Exception as e:
        print("Token verification error:", repr(e))
        raise HTTPException(status_code=401, detail=str(e))


def get_current_user(
    firebase_user: dict = Depends(get_verified_firebase_user)
):
    uid = firebase_user["uid"]

    user_doc = db.collection("users").document(uid).get()

    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User profile not found")

    user_data = user_doc.to_dict()

    return {
        "uid": uid,
        "email": firebase_user.get("email"),
        "name": user_data.get("name"),
        "role": user_data.get("role"),
        "city": user_data.get("city"),
        "area": user_data.get("area")
    }


def require_authority(
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "authority":
        raise HTTPException(status_code=403, detail="Authority access required")

    return current_user