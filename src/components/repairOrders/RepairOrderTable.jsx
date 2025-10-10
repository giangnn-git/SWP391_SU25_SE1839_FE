import { useState } from "react";

const RepairOrderTable = ({ orders, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const filteredOrders = orders.filter(
        (o) =>
            o.claim.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.technician.toLowerCase().includes(searchTerm.toLowerCase()) ||
            o.parts.some((p) => p.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const displayedOrders = filteredOrders.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="overflow-x-auto bg-white border rounded-lg shadow-sm">
            <div className="flex justify-between p-4">
                <input
                    type="text"
                    placeholder="Search orders by Technician"
                    className="pl-3 pr-4 py-2 border border-gray-300 rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-2 text-left">Claim</th>
                        <th className="px-4 py-2 text-left">Technician</th>
                        <th className="px-4 py-2 text-left">Parts</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {displayedOrders.length > 0 ? (
                        displayedOrders.map((o) => (
                            <tr key={o.orderId} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{o.claim}</td>
                                <td className="px-4 py-2">{o.technician}</td>
                                <td className="px-4 py-2">
                                    {o.parts.map((p, idx) => (
                                        <div key={idx}>{p}</div>
                                    ))}
                                </td>
                                <td className="px-4 py-2">{o.status}</td>
                                <td className="px-4 py-2 flex gap-2">
                                    <button
                                        className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        onClick={() => onEdit(o)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        onClick={() => onDelete(o.orderId)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="text-center py-6">
                                No repair orders found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div className="flex justify-end gap-2 p-4">
                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        className={`px-3 py-1 rounded-md border ${currentPage === i + 1
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700"
                            }`}
                        onClick={() => setCurrentPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default RepairOrderTable;
