import React, { useState, useEffect } from "react";
import { UserPlus, Eye, X } from "lucide-react";
import { getAllVehiclesApi, createCustomerApi } from "../services/api.service";

const CustomerRegistration = () => {
    const [vehicles, setVehicles] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [viewVehicle, setViewVehicle] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        phoneNumber: "",
        email: "",
        address: "",
        vin: "",
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // 🔹 Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // ✅ Ẩn thông báo tự động sau 5 giây
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => {
                setSuccess("");
                setError("");
            }, 5000); // ⏱ 5 giây
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // Fetch vehicles
    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const res = await getAllVehiclesApi();
            const data = res.data?.data?.vehicles || [];
            setVehicles(data);
        } catch (err) {
            console.error("❌ Error fetching vehicles:", err);
            setError("Failed to load vehicle data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVehicles();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ Submit form — call backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.phoneNumber || !formData.vin) {
            setError("⚠️ Please fill all required fields before submitting.");
            setSuccess("");
            return;
        }

        try {
            console.log("📤 Registering customer:", formData);
            const response = await createCustomerApi(formData);
            console.log("✅ API Response:", response.data);

            setSuccess("✅ Customer registered successfully!");
            setError("");
            setShowForm(false);

            setFormData({
                name: "",
                phoneNumber: "",
                email: "",
                address: "",
                vin: "",
            });

            // 🔄 Refresh vehicle list
            fetchVehicles();
        } catch (err) {
            console.error("❌ Error registering customer:", err.response?.data || err.message);
            setError(
                `❌ Failed to register customer: ${err.response?.data?.message || "Please try again."
                }`
            );
        }
    };

    // 🔹 Pagination logic
    const totalPages = Math.ceil(vehicles.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentVehicles = vehicles.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <UserPlus className="text-blue-600" size={24} />
                        Customer Registration
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Register customers and link them to a vehicle VIN.
                    </p>
                </div>

                {/* Register Button */}
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md 
                     hover:bg-gray-900 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Register
                </button>
            </div>

            {/* Messages */}
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-md shadow-sm transition-all duration-300">
                    {success}
                </div>
            )}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md shadow-sm transition-all duration-300">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <p className="text-center text-gray-500 py-6">Loading vehicle data...</p>
            ) : (
                <>
                    {/* Table */}
                    <div className="overflow-x-auto border rounded-lg shadow-sm">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3 text-left">VIN</th>
                                    <th className="px-4 py-3 text-left">Model</th>
                                    <th className="px-4 py-3 text-left">Year</th>
                                    <th className="px-4 py-3 text-left">Customer Name</th>
                                    <th className="px-4 py-3 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentVehicles.map((v, i) => (
                                    <tr key={i} className="border-b hover:bg-blue-50 transition-colors">
                                        <td className="px-4 py-3 align-middle font-medium">{v.vin}</td>
                                        <td className="px-4 py-3 align-middle">{v.modelName}</td>
                                        <td className="px-4 py-3 align-middle">{v.productYear}</td>
                                        <td className="px-4 py-3 align-middle">
                                            {v.customerName === "N/A" ? "—" : v.customerName}
                                        </td>
                                        <td className="px-4 py-3 text-center align-middle">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 
                                     text-white rounded-md transition-all duration-200 shadow-sm 
                                     hover:shadow-md active:scale-95"
                                                    onClick={() => setViewVehicle(v)}
                                                    title="View details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {vehicles.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="text-center text-gray-500 py-6 italic">
                                            No vehicles found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* 🔹 Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 mt-6">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded-md border text-sm ${currentPage === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                    className={`px-3 py-1 rounded-md text-sm border ${currentPage === i + 1
                                        ? "bg-black text-white"
                                        : "hover:bg-gray-100 text-gray-700"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded-md border text-sm ${currentPage === totalPages
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* View Detail Modal */}
            {viewVehicle && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-[500px] border border-gray-200 relative">
                        <button
                            onClick={() => setViewVehicle(null)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                            <Eye className="text-green-600" />
                            Vehicle Details
                        </h2>
                        <div className="space-y-2 text-sm text-gray-700">
                            <p>
                                <strong>VIN:</strong> {viewVehicle.vin}
                            </p>
                            <p>
                                <strong>Model:</strong> {viewVehicle.modelName}
                            </p>
                            <p>
                                <strong>Year:</strong> {viewVehicle.productYear}
                            </p>
                            <p>
                                <strong>Customer:</strong>{" "}
                                {viewVehicle.customerName === "N/A"
                                    ? "Not Registered"
                                    : viewVehicle.customerName}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Register Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-[550px] border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800">
                            <UserPlus className="text-blue-600" />
                            Register New Customer
                        </h2>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-300 text-red-700 rounded-md shadow-sm">
                                {error}
                            </div>
                        )}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Customer Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 0901234567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="example@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Hanoi"
                                />
                            </div>

                            {/* ✅ VIN select dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Vehicle VIN *
                                </label>
                                <select
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleChange}
                                    className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Select available VIN --</option>
                                    {vehicles
                                        .filter((v) => v.customerName === "N/A")
                                        .map((v, index) => (
                                            <option key={index} value={v.vin}>
                                                {v.vin} — {v.modelName} ({v.productYear})
                                            </option>
                                        ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2 border border-gray-400 rounded-md text-gray-600 hover:bg-gray-100 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 px-5 py-2 bg-black text-white rounded-md 
                               hover:bg-gray-900 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Register
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerRegistration;
