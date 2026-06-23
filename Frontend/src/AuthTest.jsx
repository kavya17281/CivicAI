import { useState } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import { auth } from "./firebase";

export default function AuthTest() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [output, setOutput] = useState("");

    async function signup() {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;
            const token = await user.getIdToken(true);

            console.log("Token:", token);
            console.log("Token length:", token.length);

            const response = await fetch("http://127.0.0.1:8000/auth/create-profile", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: name
                })
            });

            const data = await response.json();
            setOutput(JSON.stringify(data, null, 2));
        }

        catch (error) {
            setOutput(error.message);
        }
    }

    async function login() {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;
            const token = await user.getIdToken();

            const response = await fetch("http://127.0.0.1:8000/protected", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            setOutput(JSON.stringify(data, null, 2));
        }

        catch (error) {
            setOutput(error.message);
        }
    }

    async function logout() {
        await signOut(auth);
        setOutput("Logged out");
    }

    async function testAuthority() {
        try {
            const user = auth.currentUser;

            if (!user) {
                setOutput("No user logged in");
                return;
            }

            const token = await user.getIdToken();

            const response = await fetch("http://127.0.0.1:8000/authority-only", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();
            setOutput(JSON.stringify(data, null, 2));
        }

        catch (error) {
            setOutput(error.message);
        }
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>CivicAI Auth Test</h2>

            <input
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <br /><br />

            <input
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <br /><br />

            <input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <br /><br />

            <button onClick={signup}>Signup</button>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>
            <button onClick={testAuthority}>Test Authority</button>

            <pre>{output}</pre>
        </div>
    );
}