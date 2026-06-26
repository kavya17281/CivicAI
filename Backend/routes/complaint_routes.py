from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from google.cloud.firestore import SERVER_TIMESTAMP

from Backend.auth import get_current_user
from Backend.firebase_service import db
from Backend.image_service import upload_multiple_images_to_imgbb
from Backend.gemini_service import analyze_complaint_with_gemini

router = APIRouter(prefix="/complaints", tags=["Complaints"])


ALLOWED_CATEGORIES = {
    "road_damage",
    "water_leakage",
    "streetlight_issue",
    "waste_management",
    "public_safety",
    "other"
}

ALLOWED_SEVERITIES = {
    "low",
    "medium",
    "high",
    "critical"
}


@router.post("/")
async def create_complaint(
    title: str = Form(...),
    description: str = Form(...),
    city: str = Form(...),
    area: str = Form(...),
    address: str = Form(""),
    images: list[UploadFile] = File(...),
    current_user: dict = Depends(get_current_user)
):
    if len(images) > 5:
        raise HTTPException(
            status_code=400,
            detail="You can upload at most 5 images"
        )

    image_urls, images_data = await upload_multiple_images_to_imgbb(images)

    ai_result = analyze_complaint_with_gemini(
        images_data=images_data,
        title=title,
        description=description,
        city=city,
        area=area
    )

    category = ai_result.get("category", "other")
    severity = ai_result.get("severity", "medium")

    if category not in ALLOWED_CATEGORIES:
        category = "other"

    if severity not in ALLOWED_SEVERITIES:
        severity = "medium"

    icon_image_index = ai_result.get("icon_image_index", 0)

    if not isinstance(icon_image_index, int):
        icon_image_index = 0

    if icon_image_index < 0 or icon_image_index >= len(image_urls):
        icon_image_index = 0

    icon_image_url = image_urls[icon_image_index]

    complaint_data = {
        "userId": current_user["uid"],
        "userName": current_user["name"],
        "userEmail": current_user["email"],

        "title": title,
        "description": description,

        "city": city,
        "area": area,
        "address": address,

        "imageUrls": image_urls,
        "iconImageUrl": icon_image_url,

        "isCivicIssue": ai_result.get("is_civic_issue", False),
        "category": category,
        "severity": severity,
        "aiSummary": ai_result.get("summary", ""),
        "aiConfidence": ai_result.get("confidence", 0),

        "status": "reported",
        "verificationCount": 0,

        "createdAt": SERVER_TIMESTAMP,
        "updatedAt": SERVER_TIMESTAMP
    }

    doc_ref = db.collection("complaints").document()
    doc_ref.set(complaint_data)

    response_complaint = complaint_data.copy()
    response_complaint["createdAt"] = None
    response_complaint["updatedAt"] = None

    return {
        "message": "Complaint created successfully",
        "complaintId": doc_ref.id,
        "complaint": response_complaint
    }


@router.get("/my")
def get_my_complaints(
    current_user: dict = Depends(get_current_user)
):
    docs = (
        db.collection("complaints")
        .where("userId", "==", current_user["uid"])
        .stream()
    )

    complaints = []

    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id

        if data.get("createdAt"):
            data["createdAt"] = data["createdAt"].isoformat()

        if data.get("updatedAt"):
            data["updatedAt"] = data["updatedAt"].isoformat()

        complaints.append(data)

    return {
        "complaints": complaints
    }