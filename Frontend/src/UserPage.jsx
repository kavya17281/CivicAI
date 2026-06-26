import { useEffect, useState } from "react";
import { auth } from "./firebase";

import ComplaintForm from "./ComplaintForm";
import ComplaintCard from "./ComplaintCard";

const SEVERITY_ORDER = ["critical", "high", "medium", "low"];

export default function UserPage({ user }) {
    const [myComplaints, setMyComplaints] = useState([]);
    const [areaComplaints, setAreaComplaints] = useState([]);
    const [cityComplaints, setCityComplaints] = useState([]);

    const [activeLeftTab, setActiveLeftTab] = useState("my");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function getToken() {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
            throw new Error("Please login first.");
        }

        return await firebaseUser.getIdToken(true);
    }

    async function fetchComplaints(endpoint, setter) {
        const token = await getToken();

        const response = await fetch(`http://127.0.0.1:8000${endpoint}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Failed to load complaints");
        }

        setter(data.complaints || []);
    }

    async function loadAllComplaints() {
        try {
            setLoading(true);
            setMessage("");

            await Promise.all([
                fetchComplaints("/complaints/my", setMyComplaints),
                fetchComplaints("/complaints/area", setAreaComplaints),
                fetchComplaints("/complaints/city", setCityComplaints)
            ]);
        }

        catch (error) {
            setMessage(error.message);
        }

        finally {
            setLoading(false);
        }
    }

    function handleComplaintCreated() {
        loadAllComplaints();
    }

    function groupBySeverity(complaints) {
        const groups = {
            critical: [],
            high: [],
            medium: [],
            low: []
        };

        complaints.forEach((complaint) => {
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

    useEffect(() => {
        loadAllComplaints();
    }, []);

    const areaGroups = groupBySeverity(areaComplaints);

    return (
        <div className="page-shell">
            <div className="page-heading">
                <div>
                    <h2>User Dashboard</h2>
                    <p>
                        Logged in as <b>{user.name}</b> · {user.area}, {user.city}
                    </p>
                </div>

                <button onClick={loadAllComplaints} disabled={loading}>
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
                    <div className="tab-row">
                        <button
                            className={activeLeftTab === "my" ? "active-tab" : ""}
                            onClick={() => setActiveLeftTab("my")}
                        >
                            My Complaints
                        </button>

                        <button
                            className={activeLeftTab === "area" ? "active-tab" : ""}
                            onClick={() => setActiveLeftTab("area")}
                        >
                            My Area
                        </button>
                    </div>

                    <div className="complaint-list left-list">
                        {activeLeftTab === "my" && (
                            <>
                                {myComplaints.length === 0 ? (
                                    <p className="empty-text">
                                        No complaints found.
                                    </p>
                                ) : (
                                    <div className="card-grid">
                                        {myComplaints.map((complaint) => (
                                            <ComplaintCard
                                                key={complaint.id}
                                                complaint={complaint}
                                                compact={true}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {activeLeftTab === "area" && (
                            <>
                                {areaComplaints.length === 0 ? (
                                    <p className="empty-text">
                                        No complaints found in your area.
                                    </p>
                                ) : (
                                    SEVERITY_ORDER.map((severity) => (
                                        areaGroups[severity].length > 0 && (
                                            <div key={severity} className="severity-group">
                                                <h3 className="severity-group-title">
                                                    {severity}
                                                </h3>

                                                <div className="severity-divider"></div>

                                                <div className="card-grid">
                                                    {areaGroups[severity].map((complaint) => (
                                                        <ComplaintCard
                                                            key={complaint.id}
                                                            complaint={complaint}
                                                            showUser={true}
                                                            compact={true}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    ))
                                )}
                            </>
                        )}
                    </div>

                    <ComplaintForm onComplaintCreated={handleComplaintCreated} />
                </section>

                <section className="panel-section right-panel">
                    <div className="section-title-row">
                        <h2>Complaints in Roorkee</h2>
                        <span>{cityComplaints.length} reports</span>
                    </div>

                    <div className="complaint-list">
                        {cityComplaints.length === 0 ? (
                            <p className="empty-text">
                                No Roorkee complaints found.
                            </p>
                        ) : (
                            <div className="card-grid">
                                {cityComplaints.map((complaint) => (
                                    <ComplaintCard
                                        key={complaint.id}
                                        complaint={complaint}
                                        showUser={true}
                                        compact={true}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}