import React, { useState } from "react";
import { useAuth } from '../../context/AuthContext';
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

function ClaimCreate() {
    const { user } = useAuth(); // SC Staff đang login
    const [vin, setVin] = useState("");
    const [description, setDescription] = useState("");
    const [cost, setCost] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const newClaim = {
            id: Date.now(), // fake id
            vin,
            scStaffId: user?.id || "SC001",
            description,
            totalCost: parseFloat(cost),
            status: "Pending",
            createDate: new Date().toISOString(),
        };

        // Lưu localStorage (mock API)
        const existing = JSON.parse(localStorage.getItem("claims") || "[]");
        existing.push(newClaim);
        localStorage.setItem("claims", JSON.stringify(existing));

        alert("Claim created successfully!");
        navigate("/warranty-claims");
    };

    return (
        <div className="p-6 max-w-lg mx-auto">
            <h2 className="text-xl font-bold mb-4">Create Warranty Claim</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    placeholder="Enter VIN"
                    value={vin}
                    onChange={(e) => setVin(e.target.value)}
                    required
                />
                <Textarea
                    placeholder="Describe the issue"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                />
                <Input
                    type="number"
                    placeholder="Estimated Cost"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    required
                />
                <Button type="submit">Submit Claim</Button>
            </form>
        </div>
    );
}

export default ClaimCreate;
