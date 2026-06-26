import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";

import AuthPage from "./AuthPage";
import UserPage from "./UserPage";
import AuthorityPage from "./AuthorityPage";
import Navbar from "./Navbar";
import "./App.css";

function App() {
    const [userProfile, setUserProfile] = useState(null);
    const [checkingAuth, setCheckingAuth] = useState(true);

    async function fetchCurrentUser(firebaseUser) {
        const token = await firebaseUser.getIdToken(true);

        const response = await fetch("http://127.0.0.1:8000/protected", {
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
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    await fetchCurrentUser(firebaseUser);
                } else {
                    setUserProfile(null);
                }
            }

            catch {
                setUserProfile(null);
            }

            finally {
                setCheckingAuth(false);
            }
        });

        return () => unsubscribe();
    }, []);

    function handleLogin(user) {
        setUserProfile(user);
    }

    function handleLogout() {
        setUserProfile(null);
    }

    if (checkingAuth) {
        return <p style={{ padding: "20px" }}>Loading...</p>;
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