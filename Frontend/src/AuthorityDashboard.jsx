import { useState } from "react";
import { auth } from "./firebase";

const STATUSES = [
    "",
    "reported",
    "verified",
    "in_progress",
    "resolved",
    "rejected"
];

const SEVERITIES = [
    "",
    "low",
    "medium",
    "high",
    "critical"
];

const AREAS = [
    "",
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
];

export default function AuthorityDashboard() {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState(null);

    const [statusFilter, setStatusFilter] = useState("");
    const [severityFilter, setSeverityFilter] = useState("");
    const [areaFilter, setAreaFilter] = useState("");

    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    async function getToken() {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("Please login first.");
        }

        return await user.getIdToken(true);
    }

    async function fetchDashboardStats() {
        try {
            setLoading(true);
            setOutput("");

            const token = await getToken();

            const response = await fetch("http://127.0.0.1:8000/authority/dashboard", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                setOutput(JSON.stringify(data, null, 2));
                return;
            }

            setStats(data);
        }

        catch (error) {
            setOutput(error.message);
        }

        finally {
            setLoading(false);
        }
    }

    async function fetchComplaints() {
        try {
            setLoading(true);
            setOutput("");

            const token = await getToken();

            const params = new URLSearchParams();

            if (statusFilter) params.append("status", statusFilter);
            if (severityFilter) params.append("severity", severityFilter);
            if (areaFilter) params.append("area", areaFilter);

            const url = `http://127.0.0.1:8000/authority/complaints?${params.toString()}`;

            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                setOutput(JSON.stringify(data, null, 2));
                return;
            }

            setComplaints(data.complaints || []);
        }

        catch (error) {
            setOutput(error.message);
        }

        finally {
            setLoading(false);
        }
    }

    async function updateStatus(complaintId, newStatus) {
        try {
            setOutput("");

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
                setOutput(JSON.stringify(data, null, 2));
                return;
            }

            setComplaints((prev) =>
                prev.map((complaint) =>
                    complaint.id === complaintId
                        ? { ...complaint, status: newStatus }
                        : complaint
                )
            );

            setOutput("Status updated successfully.");
        }

        catch (error) {
            setOutput(error.message);
        }
    }

    return (
        <div style={{ padding: "20px", border: "1px solid #ccc", marginTop: "20px" }}>
            <h2>Authority Dashboard</h2>

            <button onClick={fetchDashboardStats} disabled={loading}>
                Load Dashboard Stats
            </button>

            <button onClick={fetchComplaints} disabled={loading} style={{ marginLeft: "10px" }}>
                Load Complaints
            </button>

            {output && <pre>{output}</pre>}

            {stats && (
                <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ddd" }}>
                    <h3>Stats</h3>

                    <p><b>Total:</b> {stats.total}</p>

                    <p><b>Reported:</b> {stats.statusCounts.reported}</p>
                    <p><b>Verified:</b> {stats.statusCounts.verified}</p>
                    <p><b>In Progress:</b> {stats.statusCounts.in_progress}</p>
                    <p><b>Resolved:</b> {stats.statusCounts.resolved}</p>
                    <p><b>Rejected:</b> {stats.statusCounts.rejected}</p>

                    <p><b>High Severity:</b> {stats.severityCounts.high}</p>
                    <p><b>Critical Severity:</b> {stats.severityCounts.critical}</p>

                    <h4>Category Counts</h4>
                    <pre>{JSON.stringify(stats.categoryCounts, null, 2)}</pre>

                    <h4>Area Counts</h4>
                    <pre>{JSON.stringify(stats.areaCounts, null, 2)}</pre>
                </div>
            )}

            <div style={{ marginTop: "20px" }}>
                <h3>Filters</h3>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    {STATUSES.map((status) => (
                        <option key={status} value={status}>
                            {status || "All Statuses"}
                        </option>
                    ))}
                </select>

                <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    style={{ marginLeft: "10px" }}
                >
                    {SEVERITIES.map((severity) => (
                        <option key={severity} value={severity}>
                            {severity || "All Severities"}
                        </option>
                    ))}
                </select>

                <select
                    value={areaFilter}
                    onChange={(e) => setAreaFilter(e.target.value)}
                    style={{ marginLeft: "10px" }}
                >
                    {AREAS.map((area) => (
                        <option key={area} value={area}>
                            {area || "All Areas"}
                        </option>
                    ))}
                </select>
            </div>

            <div style={{ marginTop: "20px" }}>
                {complaints.map((complaint) => (
                    <div
                        key={complaint.id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            marginBottom: "15px",
                            borderRadius: "8px"
                        }}
                    >
                        {complaint.iconImageUrl && (
                            <img
                                src={complaint.iconImageUrl}
                                alt={complaint.title}
                                style={{
                                    width: "180px",
                                    height: "120px",
                                    objectFit: "cover",
                                    borderRadius: "6px"
                                }}
                            />
                        )}

                        <h3>{complaint.title}</h3>

                        <p><b>User:</b> {complaint.userName} ({complaint.userEmail})</p>
                        <p><b>Status:</b> {complaint.status}</p>
                        <p><b>Severity:</b> {complaint.severity}</p>
                        <p><b>Category:</b> {complaint.category}</p>
                        <p><b>Area:</b> {complaint.area}, {complaint.city}</p>

                        {complaint.address && (
                            <p><b>Address:</b> {complaint.address}</p>
                        )}

                        <p><b>Description:</b> {complaint.description}</p>
                        <p><b>AI Summary:</b> {complaint.aiSummary}</p>
                        <p><b>Verification Count:</b> {complaint.verificationCount}</p>

                        <select
                            value={complaint.status}
                            onChange={(e) => updateStatus(complaint.id, e.target.value)}
                        >
                            <option value="reported">reported</option>
                            <option value="verified">verified</option>
                            <option value="in_progress">in_progress</option>
                            <option value="resolved">resolved</option>
                            <option value="rejected">rejected</option>
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
}