import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../assets/css/UserForm.css";

const CustomerForm = () => {

    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [vin, setVIN] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!name || !phoneNumber || !email || !address || !vin) {
            setError("Please fill all fields!");
            return;
        }

        try {
            // Lấy token từ localStorage (đã lưu khi login)
            const token = localStorage.getItem("token");

            const res = await axios.post(
                "/api/api/customers", // API tạo customer
                {
                    name,
                    phoneNumber,
                    email,
                    address,
                    vin,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // gửi kèm token
                    },
                }
            );

            console.log("Response from backend:", res.data);

            alert("Customer created successfully!");

            // Reset form
            setName("");
            setPhoneNumber("");
            setEmail("");
            setAddress("");
            setVIN("");

            // Giữ nguyên trang (chưa navigate)
            // navigate("/users", { replace: true });

        } catch (err) {
            if (err.response) {
                setError(err.response.data?.message || "Cannot connect to server. Please try again later!");
            } else if (err.request) {
                setError("Cannot connect to server. Please try again later!");
            } else {
                setError("Unexpected error: " + err.message);
            }
            console.error("Create user error:", err);
        }
    };

    return (
        <div className="user-page">
            <div className="user-container">
                <div className="user-header">
                    <h2>Create Customer</h2>
                    <p className="user-subtitle">Fill out the form to create a new customer</p>
                </div>

                <form className="user-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            id="name"
                            type="text"
                            className="form-input"
                            placeholder="Enter name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            id="phoneNumber"
                            type="text"
                            className="form-input"
                            placeholder="Enter phone number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="text"
                            className="form-input"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            id="address"
                            type="text"
                            className="form-input"
                            placeholder="Enter address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="vin">VIN</label>
                        <input
                            id="vin"
                            type="text"
                            className="form-input"
                            placeholder="Enter vin"
                            value={vin}
                            onChange={(e) => setVIN(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-button">
                        Submit
                    </button>
                </form>

                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default CustomerForm;
