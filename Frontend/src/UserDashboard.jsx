import { useState } from "react";
import { auth } from "./firebase";

export default function UserDashboard() {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    async function fetchMyComplaints() {
        try {
            setLoading(true);
            setOutput("");

            const user = auth.currentUser;

            if (!user) {
                setOutput("Please login first.");
                return;
            }

            const token = await user.getIdToken(true);

            const response = await fetch(`${API_BASE_URL}/complaints/my`, {
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

    return (
        <div style={{ padding: "20px", border: "1px solid #ccc", marginTop: "20px" }}>
            <h2>My Complaints</h2>

            <button onClick={fetchMyComplaints} disabled={loading}>
                {loading ? "Loading..." : "Load My Complaints"}
            </button>

            {output && <pre>{output}</pre>}

            {complaints.length === 0 && !output && (
                <p>No complaints loaded yet.</p>
            )}

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

                        <p>
                            <b>Status:</b> {complaint.status}
                        </p>

                        <p>
                            <b>Severity:</b> {complaint.severity}
                        </p>

                        <p>
                            <b>Category:</b> {complaint.category}
                        </p>

                        <p>
                            <b>Area:</b> {complaint.area}, {complaint.city}
                        </p>

                        {complaint.address && (
                            <p>
                                <b>Address:</b> {complaint.address}
                            </p>
                        )}

                        <p>
                            <b>Complaint Text:</b> {complaint.complaintText}
                        </p>

                        <p>
                            <b>AI Summary:</b> {complaint.aiSummary}
                        </p>

                        <p>
                            <b>Verification Count:</b> {complaint.verificationCount}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}