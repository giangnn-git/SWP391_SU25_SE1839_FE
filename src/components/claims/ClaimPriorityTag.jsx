const ClaimPriorityTag = ({ level }) => {
    const colorMap = {
        High: "bg-red-100 text-red-700",
        "Medium": "bg-yellow-100 text-yellow-700",
        Low: "bg-gray-100 text-gray-700",
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[level]}`}>
            {level}
        </span>
    );
};

export default ClaimPriorityTag;
