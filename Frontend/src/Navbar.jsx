import { signOut } from "firebase/auth";
import { auth } from "./firebase";

export default function Navbar({ user, onLogout }) {
    async function handleLogout() {
        await signOut(auth);
        onLogout();
    }

    return (
        <div className="navbar">
            <h2>CivicAI Roorkee</h2>

            {user && (
                <div className="navbar-user">
                    <span>
                        {user.name} · {user.role}
                    </span>

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
}