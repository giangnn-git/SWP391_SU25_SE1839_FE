_________________________________________________________
import { useState } from "react";
import axios from "axios";
import "../../assets/css/UserForm.css";

const CustomerForm = () => {
    const [description, setDescription] = useState("");
    const [milleage, setMilleage] = useState("");
    const [vin, setVIN] = useState("");
    const [partClaims, setPartClaims] = useState([{ id: "", quantity: "" }]);
    const [attachments, setAttachments] = useState([]);
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        setAttachments(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!description || !milleage || !vin || partClaims.length === 0) {
            setError("Please fill all fields!");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            // Tạo FormData
            const formData = new FormData();

            // Tạo claim data
            const claimData = {
                description,
                milleage: Number(milleage),
                vin,
                partClaims: partClaims.map(pc => ({
                    id: Number(pc.id),
                    quantity: Number(pc.quantity)
                }))
            };

            // ✅ Dùng Blob với type application/json
            const claimBlob = new Blob(
                [JSON.stringify(claimData)],
                { type: 'application/json' }
            );
            formData.append('claim', claimBlob);

            // Thêm files
            attachments.forEach(file => {
                formData.append('attachments', file);
            });

            const res = await axios.post(
                "/api/claims",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        // KHÔNG set Content-Type
                    },
                }
            );

            console.log("Response from backend:", res.data);
            alert("Warranty claim created successfully!");

            // Reset form
            setDescription("");
            setMilleage("");
            setVIN("");
            setPartClaims([{ id: "", quantity: "" }]);
            setAttachments([]);
            document.getElementById('attachments').value = '';

        } catch (err) {
            if (err.response) {
                setError(err.response.data?.message || "Cannot connect to server. Please try again later!");
            } else if (err.request) {
                setError("Cannot connect to server. Please try again later!");
            } else {
                setError("Unexpected error: " + err.message);
            }
            console.error("Create warranty error:", err);
        }
    };

    // Thêm dòng mới cho partClaims
    const addPartClaim = () => {
        setPartClaims([...partClaims, { id: "", quantity: "" }]);
    };

    // Update partClaim
    const updatePartClaim = (index, field, value) => {
        const newClaims = [...partClaims];
        newClaims[index][field] = value;
        setPartClaims(newClaims);
    };

    // Xóa partClaim
    const removePartClaim = (index) => {
        if (partClaims.length > 1) {
            const newClaims = partClaims.filter((_, i) => i !== index);
            setPartClaims(newClaims);
        }
    };

    return (
        <div className="user-page">
            <div className="user-container">
                <div className="user-header">
                    <h2>Create Warranty Claim</h2>
                    <p className="user-subtitle">Fill out the form to create a new warranty claim</p>
                </div>

                <form className="user-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            className="form-input"
                            placeholder="Enter description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            rows="4"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="milleage">Mileage (km)</label>
                        <input
                            id="milleage"
                            type="number"
                            className="form-input"
                            placeholder="Enter mileage"
                            value={milleage}
                            onChange={(e) => setMilleage(e.target.value)}
                            required
                            min="0"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="vin">VIN</label>
                        <input
                            id="vin"
                            type="text"
                            className="form-input"
                            placeholder="Enter VIN (e.g., 1HGCM82633A004352)"
                            value={vin}
                            onChange={(e) => setVIN(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Part Claims</label>
                        {partClaims.map((pc, index) => (
                            <div key={index} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "center" }}>
                                <input
                                    type="number"
                                    placeholder="Part ID"
                                    className="form-input"
                                    style={{ flex: 1 }}
                                    value={pc.id}
                                    onChange={(e) => updatePartClaim(index, "id", e.target.value)}
                                    required
                                    min="1"
                                />
                                <input
                                    type="number"
                                    placeholder="Quantity"
                                    className="form-input"
                                    style={{ flex: 1 }}
                                    value={pc.quantity}
                                    onChange={(e) => updatePartClaim(index, "quantity", e.target.value)}
                                    required
                                    min="1"
                                />
                                {partClaims.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removePartClaim(index)}
                                        style={{
                                            padding: "8px 12px",
                                            background: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addPartClaim}
                            style={{
                                padding: "10px 20px",
                                background: "#28a745",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                marginTop: "10px"
                            }}
                        >
                            + Add Part
                        </button>
                    </div>

                    <div className="form-group">
                        <label htmlFor="attachments">Attachments (Images)</label>
                        <input
                            id="attachments"
                            type="file"
                            className="form-input"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                        {attachments.length > 0 && (
                            <p style={{ fontSize: "14px", color: "#666", marginTop: "5px" }}>
                                {attachments.length} file(s) selected
                            </p>
                        )}
                    </div>

                    <button type="submit" className="submit-button">
                        Submit Claim
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default CustomerForm;