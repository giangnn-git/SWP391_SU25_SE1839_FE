import React, { useState, useEffect } from "react";
import { X, Save, Calendar } from "lucide-react";
import { updateCampaignApi } from "../../services/api.service";

const EditCampaignModal = ({ isOpen, onClose, campaign, onCampaignUpdated }) => {
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        produceDateFrom: "",
        produceDateTo: "",
        affectedModels: "",
        status: "UPCOMING",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    //  Load dữ liệu khi mở modal
    useEffect(() => {
        if (isOpen && campaign) {
            setFormData({
                code: campaign.code || "",
                name: campaign.name || "",
                description: campaign.description || "",
                startDate: campaign.formattedStartDate || "",
                endDate: campaign.formattedEndDate || "",
                produceDateFrom: campaign.formattedProduceFrom || "",
                produceDateTo: campaign.formattedProduceTo || "",
                affectedModels: campaign.affectedModels
                    ? campaign.affectedModels.join(", ")
                    : "",
                status: campaign.status ? campaign.status.toUpperCase() : "UPCOMING",
            });
        } else if (!isOpen) {
            setFormData({
                code: "",
                name: "",
                description: "",
                startDate: "",
                endDate: "",
                produceDateFrom: "",
                produceDateTo: "",
                affectedModels: "",
                status: "UPCOMING",
            });
        }
    }, [isOpen, campaign]);

    //  Chuyển chuỗi dd/mm/yyyy -> [yyyy, mm, dd]
    const parseDateArray = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split("/").map(Number);
        return [year, month, day];
    };

    //  Bắt sự kiện nhập form
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    //  Submit cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const updatedData = {
                code: formData.code.trim(),
                name: formData.name.trim(),
                description: formData.description,
                startDate: parseDateArray(formData.startDate),
                endDate: parseDateArray(formData.endDate),
                produceDateFrom: parseDateArray(formData.produceDateFrom),
                produceDateTo: parseDateArray(formData.produceDateTo),
                affectedModels: formData.affectedModels
                    ? formData.affectedModels.split(",").map((m) => m.trim())
                    : [],
                status: formData.status.toUpperCase(),
            };

            const res = await updateCampaignApi(campaign.id, updatedData);
            setSuccess("Campaign updated successfully!");
            if (onCampaignUpdated) onCampaignUpdated(res.data);
            setTimeout(() => onClose(), 1200);
        } catch (err) {
            setError("Failed to update campaign. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-lg w-[520px] p-6 relative border border-gray-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar size={20} className="text-orange-600" />
                        Edit Campaign
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campaign Code
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Campaign Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="3"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none resize-none"
                        ></textarea>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date (dd/mm/yyyy)
                            </label>
                            <input
                                type="text"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                placeholder="dd/mm/yyyy"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date (dd/mm/yyyy)
                            </label>
                            <input
                                type="text"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                placeholder="dd/mm/yyyy"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Produce From (dd/mm/yyyy)
                            </label>
                            <input
                                type="text"
                                name="produceDateFrom"
                                value={formData.produceDateFrom}
                                onChange={handleChange}
                                placeholder="dd/mm/yyyy"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Produce To (dd/mm/yyyy)
                            </label>
                            <input
                                type="text"
                                name="produceDateTo"
                                value={formData.produceDateTo}
                                onChange={handleChange}
                                placeholder="dd/mm/yyyy"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                    </div>

                    {/* Models */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Affected Models (comma separated)
                        </label>
                        <input
                            type="text"
                            name="affectedModels"
                            value={formData.affectedModels}
                            onChange={handleChange}
                            placeholder="e.g., VF8, VF9"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="UPCOMING">Upcoming</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Notifications */}
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                            {success}
                        </p>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg shadow-sm transition disabled:opacity-60"
                        >
                            <Save size={16} />
                            {loading ? "Saving..." : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCampaignModal;
