import React, { createContext, useContext, useEffect, useState } from "react";

const ClaimsContext = createContext(null);

export const useClaims = () => {
    const context = useContext(ClaimsContext);
    if (!context) {
        throw new Error("useClaims must be used within ClaimsProvider");
    }
    return context;
};

export const ClaimsProvider = ({ children }) => {
    const [claims, setClaims] = useState(() => {
        const saved = localStorage.getItem("warrantyClaims");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("warrantyClaims", JSON.stringify(claims));
    }, [claims]);

    const addClaim = (claim) => {
        setClaims((prev) => [
            ...prev,
            { id: Date.now().toString(), status: "submitted", ...claim }
        ]);
    };

    return (
        <ClaimsContext.Provider value={{ claims, addClaim }}>
            {children}
        </ClaimsContext.Provider>
    );
};
