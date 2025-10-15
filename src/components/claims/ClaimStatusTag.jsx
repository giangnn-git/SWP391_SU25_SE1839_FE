const ClaimStatusTag = ({ status }) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium";
    const colors = {
        Pending: "bg-yellow-100 text-yellow-800",
        Approved: "bg-green-100 text-green-800",
        Rejected: "bg-red-100 text-red-800",
    };

    return (
        <span className={`${base} ${colors[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
    );
};

export default ClaimStatusTag;
