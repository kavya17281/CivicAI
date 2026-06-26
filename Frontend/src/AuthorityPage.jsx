import AuthorityDashboard from "./AuthorityDashboard";

export default function AuthorityPage({ user }) {
    return (
        <div className="page-shell">
            <div className="page-heading">
                <div>
                    <h2>Authority Dashboard</h2>
                    <p>
                        Logged in as <b>{user.name}</b> · {user.city || "Roorkee"}
                    </p>
                </div>
            </div>

            <AuthorityDashboard />
        </div>
    );
}