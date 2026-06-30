import { useState } from "react";
import { auth } from "./firebase";

export default function ComplaintForm({ onComplaintCreated }) {
    const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;
    const [complaintText, setComplaintText] = useState("");
    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    async function submitComplaint(e) {
        e.preventDefault();

        if (complaintText.trim().length < 15) {
            setMessage("Please describe the civic issue and mention a specific address or landmark.");
            return;
        }

        if (images.length === 0) {
            setMessage("Please upload at least one image.");
            return;
        }

        if (images.length > 5) {
            setMessage("You can upload at most 5 images.");
            return;
        }

        try {
            setLoading(true);
            setMessage("");

            const user = auth.currentUser;

            if (!user) {
                setMessage("Please login first.");
                return;
            }

            const token = await user.getIdToken(true);

            const formData = new FormData();
            formData.append("complaintText", complaintText);

            images.forEach((image) => {
                formData.append("images", image);
            });

            const response = await fetch(`${API_BASE_URL}/complaints/`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.detail || "Complaint submission failed");
                return;
            }

            setMessage("Complaint submitted successfully.");
            setComplaintText("");
            setImages([]);

            const fileInput = document.getElementById("complaint-images-input");
            if (fileInput) {
                fileInput.value = "";
            }

            if (onComplaintCreated) {
                onComplaintCreated(data.complaint);
            }
        }

        catch (error) {
            setMessage(error.message);
        }

        finally {
            setLoading(false);
        }
    }

    return (
        <div className="complaint-input-box">
            {message && (
                <p className="form-message">
                    {message}
                </p>
            )}

            {images.length > 0 && (
                <p className="selected-images">
                    {images.length} image(s) selected
                </p>
            )}

            <form onSubmit={submitComplaint} className="complaint-form">
                <label className="upload-button" title="Upload images">
                    +
                    <input
                        id="complaint-images-input"
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) => setImages(Array.from(e.target.files))}
                    />
                </label>

                <textarea
                    placeholder="Describe the issue and mention the exact address or landmark..."
                    value={complaintText}
                    onChange={(e) => setComplaintText(e.target.value)}
                    rows={2}
                />

                <button type="submit" disabled={loading}>
                    {loading ? "..." : "Send"}
                </button>
            </form>
        </div>
    );
}