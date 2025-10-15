import React, { useState, useEffect } from "react";

const UpdateWarrantyPolicyModal = ({
  showModal,
  policy,
  actionLoading,
  onClose,
  onUpdated,
  updatePolicyApi,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    durationPeriod: "",
    mileageLimit: "",
  });

  //  Load dữ liệu từ policy
  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name || "",
        description: policy.description || "",
        durationPeriod:
          typeof policy.durationPeriod === "string"
            ? policy.durationPeriod.replace(" months", "")
            : policy.durationPeriod?.toString() || "",
        mileageLimit:
          typeof policy.mileageLimit === "string"
            ? policy.mileageLimit.replace(" km", "").replace(/,/g, "")
            : policy.mileageLimit?.toString() || "",
      });
    }
  }, [policy]);

  const handleFormDataChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  //  Kiểm tra xem form có thay đổi gì không
  const isChanged =
    formData.name !== (policy?.name || "") ||
    formData.description !== (policy?.description || "") ||
    formData.durationPeriod !==
    (policy?.durationPeriod?.toString().replace(" months", "") || "") ||
    formData.mileageLimit !==
    (policy?.mileageLimit?.toString().replace(" km", "").replace(/,/g, "") ||
      "");

  //  Gửi request update
  const handleSubmit = async () => {
    if (!policy?.id) {
      console.error("Invalid policy ID.");
      return;
    }

    if (
      !formData.name ||
      !formData.description ||
      !formData.durationPeriod ||
      !formData.mileageLimit
    ) {
      console.error("Please fill in all fields before saving.");
      return;
    }

    try {
      const apiData = {
        name: formData.name.trim(),
        durationPeriod: parseInt(formData.durationPeriod),
        mileageLimit: parseInt(formData.mileageLimit),
        description: formData.description.trim(),
      };

      await updatePolicyApi(policy.id, apiData);

      //  Gọi callback để hiển thị thông báo ở UI cha
      if (onUpdated) onUpdated();
      onClose();
    } catch (error) {
      console.error(
        "Update failed:",
        error.response?.data?.message ||
        "Failed to update policy. Please try again."
      );
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-[460px] p-6 animate-fadeIn">
        <h2 className="text-lg font-semibold mb-4">Edit Warranty Policy</h2>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Policy Name"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => handleFormDataChange("name", e.target.value)}
            disabled={actionLoading}
          />

          <textarea
            placeholder="Description"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={(e) =>
              handleFormDataChange("description", e.target.value)
            }
            disabled={actionLoading}
            rows={3}
          />

          <input
            type="number"
            placeholder="Duration Period (months)"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.durationPeriod}
            onChange={(e) =>
              handleFormDataChange("durationPeriod", e.target.value)
            }
            disabled={actionLoading}
          />

          <input
            type="number"
            placeholder="Mileage Limit (km)"
            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.mileageLimit}
            onChange={(e) =>
              handleFormDataChange("mileageLimit", e.target.value)
            }
            disabled={actionLoading}
          />
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
            disabled={actionLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-md text-white transition ${!isChanged
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
              }`}
            disabled={actionLoading || !isChanged}
          >
            {actionLoading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateWarrantyPolicyModal;
