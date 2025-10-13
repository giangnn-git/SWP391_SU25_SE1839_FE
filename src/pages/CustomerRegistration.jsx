import React, { useState } from "react";
import {
    UserPlus,
    Car,
    Save,
    Eye,
    FilePlus2,
    X,
} from "lucide-react";

const CustomerRegistration = () => {
    const [registeredVehicles, setRegisteredVehicles] = useState([
        {
            id: 1,
            customerName: "Nguyễn Văn A",
            phone: "0901234567",
            email: "vana@example.com",
            model: "VF8",
            vin: "VF8-123456789",
            licensePlate: "51H-123.45",
            color: "Trắng",
            purchaseDate: "2024-08-10",
        },
        {
            id: 2,
            customerName: "Trần Thị B",
            phone: "0919876543",
            email: "thib@example.com",
            model: "VF6",
            vin: "VF6-987654321",
            licensePlate: "60A-888.99",
            color: "Đỏ",
            purchaseDate: "2024-05-22",
        },
    ]);

    const [showForm, setShowForm] = useState(false);
    const [viewVehicle, setViewVehicle] = useState(null);
    const [formData, setFormData] = useState({
        customerName: "",
        phone: "",
        email: "",
        address: "",
        vehicleVIN: "",
        model: "",
        licensePlate: "",
        color: "",
        purchaseDate: "",
    });

    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.customerName || !formData.vehicleVIN || !formData.model) {
            setError("⚠️ Please fill all required fields before submitting.");
            setSuccess("");
            return;
        }

        const newRecord = {
            id: registeredVehicles.length + 1,
            customerName: formData.customerName,
            phone: formData.phone,
            email: formData.email,
            model: formData.model,
            vin: formData.vehicleVIN,
            licensePlate: formData.licensePlate,
            color: formData.color,
            purchaseDate: formData.purchaseDate,
        };

        setRegisteredVehicles([...registeredVehicles, newRecord]);
        setShowForm(false);
        setSuccess("✅ Customer and Vehicle registered successfully!");
        setError("");
        setFormData({
            customerName: "",
            phone: "",
            email: "",
            address: "",
            vehicleVIN: "",
            model: "",
            licensePlate: "",
            color: "",
            purchaseDate: "",
        });
    };

    return (
        <div className="p-8 max-w-6xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-semibold flex items-center gap-2">
                        <Car className="text-blue-600" size={24} />
                        Customer & Vehicle Registration
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage registered customers and their vehicles for warranty tracking.
                    </p>
                </div>

                {/* ✅ Nút Register (viền đen, chữ trắng, nền trong suốt) */}
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

            {/* Success message */}
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-300 text-green-700 rounded-md shadow-sm">
                    {success}
                </div>
            )}

            {/* Table danh sách xe */}
            <div className="overflow-x-auto border rounded-lg shadow-sm">
                <table className="min-w-full text-sm text-gray-700">
                    <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-left">Phone</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Model</th>
                            <th className="px-4 py-3 text-left">VIN</th>
                            <th className="px-4 py-3 text-left">License Plate</th>
                            <th className="px-4 py-3 text-left">Color</th>
                            <th className="px-4 py-3 text-left">Purchase Date</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registeredVehicles.map((v) => (
                            <tr
                                key={v.id}
                                className="border-b hover:bg-blue-50 transition-colors"
                            >
                                <td className="px-4 py-3 font-medium">{v.customerName}</td>
                                <td className="px-4 py-3">{v.phone}</td>
                                <td className="px-4 py-3">{v.email}</td>
                                <td className="px-4 py-3">{v.model}</td>
                                <td className="px-4 py-3">{v.vin}</td>
                                <td className="px-4 py-3">{v.licensePlate}</td>
                                <td className="px-4 py-3">{v.color}</td>
                                <td className="px-4 py-3">{v.purchaseDate}</td>
                                <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                                    {/* 🔹 View */}
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                        title="View Details"
                                        onClick={() => setViewVehicle(v)}
                                    >
                                        <Eye size={16} />
                                    </button>

                                    {/* 🔹 Create Claim */}
                                    <button
                                        className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
                                        title="Create Claim"
                                        onClick={() =>
                                            alert(`🚗 Create Claim for vehicle VIN: ${v.vin}`)
                                        }
                                    >
                                        <FilePlus2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {registeredVehicles.length === 0 && (
                    <div className="text-center text-gray-500 py-6">
                        No vehicles registered yet.
                    </div>
                )}
            </div>

            {/* 🔹 Modal xem chi tiết xe */}
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
                            <p><strong>Customer:</strong> {viewVehicle.customerName}</p>
                            <p><strong>Phone:</strong> {viewVehicle.phone}</p>
                            <p><strong>Email:</strong> {viewVehicle.email}</p>
                            <p><strong>Model:</strong> {viewVehicle.model}</p>
                            <p><strong>VIN:</strong> {viewVehicle.vin}</p>
                            <p><strong>License Plate:</strong> {viewVehicle.licensePlate}</p>
                            <p><strong>Color:</strong> {viewVehicle.color}</p>
                            <p><strong>Purchase Date:</strong> {viewVehicle.purchaseDate}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* 🔹 Modal Form đăng ký mới */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-8 w-[600px] max-h-[90vh] overflow-y-auto border border-gray-200">
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
                                    name="customerName"
                                    value={formData.customerName}
                                    onChange={handleChange}
                                    className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter full name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
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
                                    Vehicle VIN *
                                </label>
                                <input
                                    type="text"
                                    name="vehicleVIN"
                                    value={formData.vehicleVIN}
                                    onChange={handleChange}
                                    className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    placeholder="VIN number"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Model *
                                    </label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. VF8, VF9"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        License Plate
                                    </label>
                                    <input
                                        type="text"
                                        name="licensePlate"
                                        value={formData.licensePlate}
                                        onChange={handleChange}
                                        className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. 51H-123.45"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. Red"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        name="purchaseDate"
                                        value={formData.purchaseDate}
                                        onChange={handleChange}
                                        className="w-full mt-1 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
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
