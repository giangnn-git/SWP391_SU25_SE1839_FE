import React, { createContext, useContext, useState } from "react";

const ClaimsContext = createContext();

export function ClaimsProvider({ children }) {
    const [claims, setClaims] = useState([
        {
            id: 1,
            claimNumber: "WC-2025-1",
            vin: "VIN123456789",
            vehicleInfo: "EV Model X 2025",
            problemDescription: "Lỗi động cơ",
            diagnosticReport: "Phát hiện lỗi mô-tơ",
            estimatedCost: 5000,
            status: "submitted",
            submittedBy: "John Smith",
            submittedDate: new Date().toLocaleDateString(),
        },
    ]);

    const addClaim = (newClaim) => {
        setClaims((prev) => [
            ...prev,
            {
                id: prev.length + 1,
                claimNumber: `WC-2025-${prev.length + 1}`,
                submittedDate: new Date().toLocaleDateString(),
                status: "submitted",
                ...newClaim,
            },
        ]);
    };

    const updateClaimStatus = (id, newStatus) => {
        setClaims((prev) =>
            prev.map((claim) =>
                claim.id === id ? { ...claim, status: newStatus } : claim
            )
        );
    };

    return (
        <ClaimsContext.Provider value={{ claims, addClaim, updateClaimStatus }}>
            {children}
        </ClaimsContext.Provider>
    );
}

// ✅ export chuẩn, tương thích Fast Refresh
export const useClaims = () => useContext(ClaimsContext);
