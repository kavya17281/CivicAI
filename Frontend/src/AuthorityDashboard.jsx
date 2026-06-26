import { useEffect, useState } from "react";
import { auth } from "./firebase";
import ComplaintCard from "./ComplaintCard";

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

const STATUS_ORDER = ["in_progress", "resolved", "rejected"];

const STATUS_OPTIONS = [
    "reported",
    "in_progress",
    "resolved",
    "rejected"
];

export default function AuthorityDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [dashboard, setDashboard] = useState(null);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function getToken() {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            throw new Error("Please login first.");
        }

        return await firebaseUser.getIdToken(true);
    }

    async function fetchAuthorityComplaints() {
        const token = await getToken();

        const response = await fetch("http://127.0.0.1:8000/authority/complaints", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to load authority complaints");
        }

        setComplaints(data.complaints || []);
    }

    async function fetchDashboardStats() {
        const token = await getToken();

        const response = await fetch("http://127.0.0.1:8000/authority/dashboard", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to load dashboard stats");
        }

        setDashboard(data);
    }

    async function loadAuthorityData() {
        try {
            setLoading(true);
            setMessage("");

            await Promise.all([
                fetchAuthorityComplaints(),
                fetchDashboardStats()
            ]);
        }

        catch (error) {
            setMessage(error.message);
        }

        finally {
            setLoading(false);
        }
    }

    async function updateStatus(complaintId, newStatus) {
        try {
            setMessage("");

            const token = await getToken();

            const response = await fetch(
                `http://127.0.0.1:8000/authority/complaints/${complaintId}/status`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status: newStatus
                    })
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Failed to update status");
            }

            setComplaints((previousComplaints) =>
                previousComplaints.map((complaint) =>
                    complaint.id === complaintId
                        ? { ...complaint, status: newStatus }
                        : complaint
                )
            );

            fetchDashboardStats();
        }

        catch (error) {
            setMessage(error.message);
        }
    }

    function groupReportedBySeverity() {
        const groups = {
            critical: [],
            high: [],
            medium: [],
            low: []
        };

        complaints.forEach((complaint) => {
            if (complaint.status !== "reported") {
                return;
            }

            const severity = complaint.severity || "low";

            if (groups[severity]) {
                groups[severity].push(complaint);
            }

            else {
                groups.low.push(complaint);
            }
        });

        return groups;
    }

    function groupHandledByStatus() {
        const groups = {
            in_progress: [],
            resolved: [],
            rejected: []
        };

        complaints.forEach((complaint) => {
            if (complaint.status === "reported") {
                return;
            }

            const status = complaint.status || "rejected";

            if (groups[status]) {
                groups[status].push(complaint);
            }

            else {
                groups.rejected.push(complaint);
            }
        });

        return groups;
    }

    function formatStatus(status) {
        if (status === "in_progress") {
            return "In Progress";
        }

        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    useEffect(() => {
        loadAuthorityData();
    }, []);

    const reportedGroups = groupReportedBySeverity();
    const handledGroups = groupHandledByStatus();

    const reportedComplaints = complaints.filter(
        (complaint) => complaint.status === "reported"
    );

    const handledComplaints = complaints.filter(
        (complaint) => complaint.status !== "reported"
    );

    return (
        <>
            <div className="authority-stats-row">
                <div className="stat-card">
                    <span>Total</span>
                    <b>{dashboard?.total ?? 0}</b>
                </div>

                <div className="stat-card">
                    <span>Reported</span>
                    <b>{dashboard?.statusCounts?.reported ?? 0}</b>
                </div>

                <div className="stat-card">
                    <span>In Progress</span>
                    <b>{dashboard?.statusCounts?.in_progress ?? 0}</b>
                </div>

                <div className="stat-card">
                    <span>Resolved</span>
                    <b>{dashboard?.statusCounts?.resolved ?? 0}</b>
                </div>

                <button onClick={loadAuthorityData} disabled={loading}>
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {message && (
                <p className="page-message">
                    {message}
                </p>
            )}

            <div className="main-panel">
                <section className="panel-section left-panel">
                    <div className="section-title-row">
                        <h2>Reported Complaints</h2>
                        <span>{reportedComplaints.length} pending</span>
                    </div>

                    <div className="complaint-list">
                        {reportedComplaints.length === 0 ? (
                            <p className="empty-text">
                                No reported complaints pending.
                            </p>
                        ) : (
                            SEVERITY_ORDER.map((severity) => (
                                reportedGroups[severity].length > 0 && (
                                    <div key={severity} className="severity-group">
                                        <h3 className="severity-group-title">
                                            {severity}
                                        </h3>

                                        <div className="severity-divider"></div>

                                        <div className="card-grid">
                                            {reportedGroups[severity].map((complaint) => (
                                                <ComplaintCard
                                                    key={complaint.id}
                                                    complaint={complaint}
                                                    showUser={true}
                                                    compact={true}
                                                >
                                                    <div className="authority-actions">
                                                        <select
                                                            value={complaint.status}
                                                            onChange={(e) =>
                                                                updateStatus(complaint.id, e.target.value)
                                                            }
                                                        >
                                                            {STATUS_OPTIONS.map((status) => (
                                                                <option key={status} value={status}>
                                                                    {status}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </ComplaintCard>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))
                        )}
                    </div>
                </section>

                <section className="panel-section right-panel">
                    <div className="section-title-row">
                        <h2>Handled Complaints</h2>
                        <span>{handledComplaints.length} reports</span>
                    </div>

                    <div className="complaint-list">
                        {handledComplaints.length === 0 ? (
                            <p className="empty-text">
                                No handled complaints found.
                            </p>
                        ) : (
                            STATUS_ORDER.map((status) => (
                                handledGroups[status].length > 0 && (
                                    <div key={status} className="severity-group">
                                        <h3 className="severity-group-title">
                                            {formatStatus(status)}
                                        </h3>

                                        <div className="severity-divider"></div>

                                        <div className="card-grid">
                                            {handledGroups[status].map((complaint) => (
                                                <ComplaintCard
                                                    key={complaint.id}
                                                    complaint={complaint}
                                                    showUser={true}
                                                    compact={true}
                                                >
                                                    <div className="authority-actions">
                                                        <select
                                                            value={complaint.status}
                                                            onChange={(e) =>
                                                                updateStatus(complaint.id, e.target.value)
                                                            }
                                                        >
                                                            {STATUS_OPTIONS.map((statusOption) => (
                                                                <option key={statusOption} value={statusOption}>
                                                                    {statusOption}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </ComplaintCard>
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}