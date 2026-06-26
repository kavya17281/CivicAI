import { useState } from "react";

export default function ComplaintCard({
    complaint,
    showUser = false,
    compact = false,
    children
}) {
    const [showDetails, setShowDetails] = useState(false);

    function formatDate(dateString) {
        if (!dateString) {
            return "Not available";
        }

        try {
            return new Date(dateString).toLocaleString();
        }

        catch {
            return "Not available";
        }
    }

    return (
        <div className={`complaint-card ${compact ? "compact-card" : ""}`}>
            {complaint.iconImageUrl && (
                <img
                    className="complaint-card-image"
                    src={complaint.iconImageUrl}
                    alt={complaint.title || "Complaint"}
                />
            )}

            <div className="complaint-card-content">
                <div className="complaint-card-header">
                    <h3>{complaint.title || "Untitled Complaint"}</h3>

                    <span className={`status-badge status-${complaint.status}`}>
                        {complaint.status}
                    </span>
                </div>

                <div className="badge-row">
                    <span className={`severity-badge severity-${complaint.severity}`}>
                        {complaint.severity}
                    </span>

                    <span className="category-badge">
                        {complaint.category}
                    </span>
                </div>

                <p>
                    <b>Area:</b> {complaint.area}, {complaint.city}
                </p>

                {complaint.specificAddress && (
                    <p>
                        <b>Address:</b> {complaint.specificAddress}
                    </p>
                )}

                {showUser && (
                    <p>
                        <b>Reported by:</b> {complaint.userName}
                    </p>
                )}

                {compact && complaint.aiSummary && (
                    <p className="compact-summary">
                        {complaint.aiSummary}
                    </p>
                )}

                {!compact && (
                    <>
                        <p>
                            <b>User Complaint:</b> {complaint.complaintText}
                        </p>

                        <p>
                            <b>AI Summary:</b> {complaint.aiSummary}
                        </p>
                    </>
                )}

                {!complaint.isValidComplaint && complaint.rejectionReason && (
                    <p className="rejection-text">
                        <b>Rejection Reason:</b> {complaint.rejectionReason}
                    </p>
                )}

                <button
                    className="details-button"
                    onClick={() => setShowDetails(!showDetails)}
                >
                    {showDetails ? "Hide Details" : "View Details"}
                </button>

                {showDetails && (
                    <div className="complaint-details">
                        <h4>Complaint Details</h4>

                        {complaint.imageUrls && complaint.imageUrls.length > 0 && (
                            <div className="details-image-grid">
                                {complaint.imageUrls.map((imageUrl, index) => (
                                    <img
                                        key={imageUrl}
                                        src={imageUrl}
                                        alt={`Complaint ${index + 1}`}
                                    />
                                ))}
                            </div>
                        )}

                        <p>
                            <b>Full Complaint:</b> {complaint.complaintText || "Not available"}
                        </p>

                        <p>
                            <b>AI Summary:</b> {complaint.aiSummary || "Not available"}
                        </p>

                        <p>
                            <b>Specific Address:</b> {complaint.specificAddress || "Not specified"}
                        </p>

                        <p>
                            <b>Category:</b> {complaint.category || "other"}
                        </p>

                        <p>
                            <b>Severity:</b> {complaint.severity || "medium"}
                        </p>

                        <p>
                            <b>Status:</b> {complaint.status || "reported"}
                        </p>

                        <p>
                            <b>AI Confidence:</b>{" "}
                            {complaint.aiConfidence !== undefined
                                ? complaint.aiConfidence
                                : "Not available"}
                        </p>

                        <p>
                            <b>Valid Complaint:</b>{" "}
                            {complaint.isValidComplaint ? "Yes" : "No"}
                        </p>

                        {!complaint.isValidComplaint && (
                            <p className="rejection-text">
                                <b>Rejection Reason:</b>{" "}
                                {complaint.rejectionReason || "Not provided"}
                            </p>
                        )}

                        {showUser && (
                            <>
                                <p>
                                    <b>Reported By:</b> {complaint.userName || "Unknown"}
                                </p>

                                <p>
                                    <b>Email:</b> {complaint.userEmail || "Not available"}
                                </p>
                            </>
                        )}

                        <p>
                            <b>Created At:</b> {formatDate(complaint.createdAt)}
                        </p>

                        <p>
                            <b>Updated At:</b> {formatDate(complaint.updatedAt)}
                        </p>
                    </div>
                )}

                {children}
            </div>
        </div>
    );
}