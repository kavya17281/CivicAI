export default function ComplaintCard({ complaint, showUser = false, compact = false, children }) {
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

                {compact && complaint.aiSummary && (
                    <p className="compact-summary">
                        {complaint.aiSummary}
                    </p>
                )}

                {!complaint.isValidComplaint && complaint.rejectionReason && (
                    <p className="rejection-text">
                        <b>Rejection Reason:</b> {complaint.rejectionReason}
                    </p>
                )}

                {children}
            </div>
        </div>
    );
}