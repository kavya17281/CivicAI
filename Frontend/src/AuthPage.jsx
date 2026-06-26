import { useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from "./firebase";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const AREAS = [
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

export default function AuthPage({ onLogin }) {
    const [mode, setMode] = useState("login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [city, setCity] = useState("Roorkee");
    const [area, setArea] = useState(AREAS[0]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const isSignup = mode === "signup";

    async function handleSignup(e) {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;
            const token = await user.getIdToken(true);

            const response = await fetch(`${API_BASE_URL}/auth/create-profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name,
                    city: city,
                    area: area
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Profile creation failed");
                return;
            }

            onLogin(data.user);
        }

        catch (err) {
            setError(err.message);
        }

        finally {
            setLoading(false);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();

        try {
            setLoading(true);
            setError("");

            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;
            const token = await user.getIdToken(true);

            const response = await fetch(`${API_BASE_URL}/auth/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.detail || "Login failed");
                return;
            }

            onLogin(data.user);
        }

        catch (err) {
            setError(err.message);
        }

        finally {
            setLoading(false);
        }
    }

    function switchMode() {
        setError("");
        setMode(isSignup ? "login" : "signup");
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>CivicAI Roorkee</h1>
                    <p>
                        Report, track, and manage civic issues in your locality.
                    </p>
                </div>

                <div className="auth-tabs">
                    <button
                        className={!isSignup ? "auth-tab-active" : ""}
                        onClick={() => {
                            setError("");
                            setMode("login");
                        }}
                        type="button"
                    >
                        Login
                    </button>

                    <button
                        className={isSignup ? "auth-tab-active" : ""}
                        onClick={() => {
                            setError("");
                            setMode("signup");
                        }}
                        type="button"
                    >
                        Signup
                    </button>
                </div>

                <form
                    className="auth-form"
                    onSubmit={isSignup ? handleSignup : handleLogin}
                >
                    {isSignup && (
                        <>
                            <label>Name</label>
                            <input
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <label>City</label>
                            <input
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                required
                                disabled
                            />

                            <label>Area</label>
                            <select
                                value={area}
                                onChange={(e) => setArea(e.target.value)}
                                required
                            >
                                {AREAS.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <label>Email</label>
                    <input
                        placeholder="Enter your email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        placeholder="Enter your password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <p className="auth-error">
                            {error}
                        </p>
                    )}

                    <button className="auth-submit" type="submit" disabled={loading}>
                        {loading
                            ? "Please wait..."
                            : isSignup
                                ? "Create Account"
                                : "Login"}
                    </button>
                </form>

                <p className="auth-switch-text">
                    {isSignup
                        ? "Already have an account?"
                        : "New to CivicAI?"}

                    <button onClick={switchMode} type="button">
                        {isSignup ? "Login" : "Create account"}
                    </button>
                </p>
            </div>
        </div>
    );
}