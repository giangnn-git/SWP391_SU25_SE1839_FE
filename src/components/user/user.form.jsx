import { useState } from "react";
import { Input, Button } from "antd";
import "../../assets/css/UserForm.css";

const UserForm = () => {
    const [mileage, setMileage] = useState("");
    const [vin, setVin] = useState("");
    const [categories, setCategories] = useState("");
    const [part, setPart] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!mileage || !vin || !categories || !part || !file) {
            setError("Please fill all fields and upload a file!");
            return;
        }

        setError("");
        // Xử lý dữ liệu ở đây (call API, console.log,...)
        console.log({
            mileage,
            vin,
            categories,
            part,
            file,
        });
    };

    return (
        <div className="user-form">
            <h2>User Form</h2>
            <form onSubmit={handleSubmit} className="form-container">
                <div className="form-group">
                    <label>Mileage</label>
                    <Input value={mileage} onChange={(e) => setMileage(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>VIN</label>
                    <Input value={vin} onChange={(e) => setVin(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>Categories</label>
                    <Input
                        value={categories}
                        onChange={(e) => setCategories(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label>Part</label>
                    <Input value={part} onChange={(e) => setPart(e.target.value)} />
                </div>

                <div className="form-group">
                    <label>MultipartFile</label>
                    <input
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="form-input"
                    />
                </div>

                {error && <p className="error-message">{error}</p>}

                <Button type="primary" htmlType="submit">
                    Submit
                </Button>
            </form>
        </div>
    );
};

export default UserForm;
