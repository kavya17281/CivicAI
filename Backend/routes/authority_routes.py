from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from google.cloud.firestore import SERVER_TIMESTAMP

from Backend.auth import require_authority
from Backend.firebase_service import db

router = APIRouter(prefix="/authority", tags=["Authority"])


ALLOWED_STATUSES = {
    "reported",
    "in_progress",
    "resolved",
    "rejected"
}


class StatusUpdateRequest(BaseModel):
    status: str


@router.get("/complaints")
def get_all_complaints(
    status: str | None = None,
    severity: str | None = None,
    area: str | None = None,
    current_user: dict = Depends(require_authority)
):
    query = db.collection("complaints")

    if status:
        query = query.where("status", "==", status)

    if severity:
        query = query.where("severity", "==", severity)

    if area:
        query = query.where("area", "==", area)

    docs = query.stream()

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


@router.patch("/complaints/{complaint_id}/status")
def update_complaint_status(
    complaint_id: str,
    request: StatusUpdateRequest,
    current_user: dict = Depends(require_authority)
):
    if request.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Invalid status"
        )

    doc_ref = db.collection("complaints").document(complaint_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    doc_ref.update({
        "status": request.status,
        "updatedAt": SERVER_TIMESTAMP,
        "lastUpdatedBy": current_user["uid"]
    })

    return {
        "message": "Complaint status updated successfully",
        "complaintId": complaint_id,
        "status": request.status
    }


@router.get("/dashboard")
def get_authority_dashboard(
    current_user: dict = Depends(require_authority)
):
    docs = db.collection("complaints").stream()

    total = 0
    status_counts = {
        "reported": 0,
        "in_progress": 0,
        "resolved": 0,
        "rejected": 0
    }

    severity_counts = {
        "low": 0,
        "medium": 0,
        "high": 0,
        "critical": 0
    }

    category_counts = {}
    area_counts = {}
    valid_count = 0
    invalid_count = 0

    for doc in docs:
        data = doc.to_dict()
        total += 1

        status = data.get("status", "reported")
        severity = data.get("severity", "medium")
        category = data.get("category", "other")
        area = data.get("area", "Unknown")

        if status in status_counts:
            status_counts[status] += 1

        if severity in severity_counts:
            severity_counts[severity] += 1

        category_counts[category] = category_counts.get(category, 0) + 1
        area_counts[area] = area_counts.get(area, 0) + 1

        if data.get("isValidComplaint"):
            valid_count += 1
        else:
            invalid_count += 1

    return {
        "total": total,
        "validComplaints": valid_count,
        "invalidComplaints": invalid_count,
        "statusCounts": status_counts,
        "severityCounts": severity_counts,
        "categoryCounts": category_counts,
        "areaCounts": area_counts
    }