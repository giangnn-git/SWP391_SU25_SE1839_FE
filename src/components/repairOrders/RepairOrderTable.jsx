const RepairOrderTable = ({ orders, loading, error }) => {
    if (loading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <table className="min-w-full border border-gray-300 rounded-md">
            <thead className="bg-gray-100">
                <tr>
                    <th className="p-2 border">ID</th>
                    <th className="p-2 border">Model</th>
                    <th className="p-2 border">VIN</th>
                    <th className="p-2 border">Year</th>
                    <th className="p-2 border">Technical</th>
                    <th className="p-2 border">Progress (%)</th>
                </tr>
            </thead>
            <tbody>
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <tr key={order.repairOrderId} className="text-center">
                            <td className="p-2 border">{order.repairOrderId}</td>
                            <td className="p-2 border">{order.modelName}</td>
                            <td className="p-2 border">{order.vin}</td>
                            <td className="p-2 border">{order.prodcutYear}</td>
                            <td className="p-2 border">{order.techinal}</td>
                            <td className="p-2 border">{order.percentInProcess}%</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="6" className="p-4 text-gray-500">
                            Không có Repair Order nào.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default RepairOrderTable;
