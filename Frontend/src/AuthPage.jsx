import { useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "firebase/auth";
import { auth } from "./firebase";

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

            const response = await fetch("http://127.0.0.1:8000/auth/create-profile", {
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

            const response = await fetch("http://127.0.0.1:8000/protected", {
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
        setMode(mode === "login" ? "signup" : "login");
    }

    const isSignup = mode === "signup";

    return (
        <div style={{ padding: "30px", maxWidth: "420px", margin: "40px auto" }}>
            <h1>CivicAI Roorkee</h1>

            <h2>
                {isSignup ? "Create Account" : "Login"}
            </h2>

            <form onSubmit={isSignup ? handleSignup : handleLogin}>
                {isSignup && (
                    <>
                        <input
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <br /><br />

                        <input
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                            disabled
                        />

                        <br /><br />

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

                        <br /><br />
                    </>
                )}

                <input
                    placeholder="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <br /><br />

                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <br /><br />

                <button type="submit" disabled={loading}>
                    {loading
                        ? "Please wait..."
                        : isSignup
                            ? "Signup"
                            : "Login"}
                </button>
            </form>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            <br />

            <button onClick={switchMode}>
                {isSignup
                    ? "Already have an account? Login"
                    : "New user? Create account"}
            </button>
        </div>
    );
}