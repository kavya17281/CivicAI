import { useState } from "react";
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

export default function ComplaintForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [city, setCity] = useState("Roorkee");
    const [area, setArea] = useState(AREAS[0]);
    const [address, setAddress] = useState("");
    const [images, setImages] = useState([]);

    const [loading, setLoading] = useState(false);
    const [output, setOutput] = useState("");

    async function submitComplaint(e) {
        e.preventDefault();

        try {
            setLoading(true);
            setOutput("");

            const user = auth.currentUser;

            if (!user) {
                setOutput("Please login first.");
                return;
            }

            if (images.length === 0) {
                setOutput("Please upload at least one image.");
                return;
            }

            if (images.length > 5) {
                setOutput("You can upload at most 5 images.");
                return;
            }

            const token = await user.getIdToken(true);

            const formData = new FormData();

            formData.append("title", title);
            formData.append("description", description);
            formData.append("city", city);
            formData.append("area", area);
            formData.append("address", address);

            images.forEach((image) => {
                formData.append("images", image);
            });

            const response = await fetch("http://127.0.0.1:8000/complaints/", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                setOutput(JSON.stringify(data, null, 2));
                return;
            }

            setOutput(JSON.stringify(data, null, 2));

            setTitle("");
            setDescription("");
            setCity("Roorkee");
            setArea(AREAS[0]);
            setAddress("");
            setImages([]);
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
            <h2>Submit Complaint</h2>

            <form onSubmit={submitComplaint}>
                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <br /><br />

                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />

                <br /><br />

                <input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
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

                <input
                    placeholder="Specific address / landmark"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                />

                <br /><br />

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setImages(Array.from(e.target.files))}
                    required
                />

                <p>
                    Selected images: {images.length}
                </p>

                <button type="submit" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Complaint"}
                </button>
            </form>

            <pre>{output}</pre>
        </div>
    );
}