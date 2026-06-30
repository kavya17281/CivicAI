import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";

import AuthPage from "./AuthPage";
import UserPage from "./UserPage";
import AuthorityPage from "./AuthorityPage";
import Navbar from "./Navbar";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
    const [userProfile, setUserProfile] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    const [backendReady, setBackendReady] = useState(false);
    const [backendFailed, setBackendFailed] = useState(false);
    const [backendMessage, setBackendMessage] = useState("Starting CivicAI backend...");

    async function waitForBackend() {
        setBackendFailed(false);

        for (let attempt = 1; attempt <= 20; attempt++) {
            try {
                setBackendMessage(
                    attempt === 1
                        ? "Starting CivicAI backend..."
                        : `Still waking backend... attempt ${attempt}/20`
                );

                const response = await fetch(`${API_BASE_URL}/health`);

                if (response.ok) {
                    setBackendReady(true);
                    setBackendFailed(false);
                    return;
                }
            } catch {
                // Render backend may still be waking up
            }

            await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        setBackendFailed(true);
        setBackendMessage("Backend is taking longer than expected to start.");
    }

    async function fetchCurrentUser(firebaseUser) {
        const token = await firebaseUser.getIdToken(true);

        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            setUserProfile(null);
            return;
        }

        setUserProfile(data.user);
    }

    useEffect(() => {
        waitForBackend();
    }, []);

    useEffect(() => {
        if (!backendReady) return;

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setCheckingAuth(true);

            try {
                if (firebaseUser) {
                    await fetchCurrentUser(firebaseUser);
                } else {
                    setUserProfile(null);
                }
            } catch {
                setUserProfile(null);
            } finally {
                setCheckingAuth(false);
            }
        });

        return () => unsubscribe();
    }, [backendReady]);

    function handleLogin(user) {
        setUserProfile(user);
    }

    function handleLogout() {
        setUserProfile(null);
    }

    if (!backendReady) {
        return (
            <div className="startup-page">
                <div className="startup-card">
                    <h1>CivicAI Roorkee</h1>
                    <p>{backendMessage}</p>

                    {!backendFailed ? (
                        <div className="loader"></div>
                    ) : (
                        <button onClick={waitForBackend}>
                            Retry
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (checkingAuth) {
        return (
            <div className="startup-page">
                <div className="startup-card">
                    <h1>CivicAI Roorkee</h1>
                    <p>Checking login session...</p>
                    <div className="loader"></div>
                </div>
            </div>
        );
    }

    if (!userProfile) {
        return <AuthPage onLogin={handleLogin} />;
    }

    return (
        <>
            <Navbar user={userProfile} onLogout={handleLogout} />

            {userProfile.role === "authority" ? (
                <AuthorityPage user={userProfile} />
            ) : (
                <UserPage user={userProfile} />
            )}
        </>
    );
}

export default App;