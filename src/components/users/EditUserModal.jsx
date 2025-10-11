import { useState, useEffect } from "react";
import { useServiceCenters } from "../../hooks/useServiceCenters";

const EditUserModal = ({ user, isOpen, onClose, onSave, loading }) => {
  const { serviceCenters, loading: scLoading } = useServiceCenters();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phoneNumber: "",
    role: "",
    serviceCenterId: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        role: user.role || "",
        serviceCenterId: user.serviceCenterId || "",
        status: user.status || "ACTIVE",
      });
    }
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Role</option>
                <option value="STAFF">TECHNICIAN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SC_STAFF">SC_STAFF</option>
                <option value="EVM_STAFF">EVM_STAFF</option>
              </select>
            </div>

            {/* Service Center */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Center *
              </label>
              <select
                value={formData.serviceCenterId || ""}
                onChange={(e) =>
                  handleChange("serviceCenterId", parseInt(e.target.value))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={scLoading}
                required
              >
                <option value="">Select Service Center</option>
                {serviceCenters.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.address}
                  </option>
                ))}
              </select>
              {scLoading && (
                <p className="mt-1 text-sm text-gray-500">
                  Loading service centers...
                </p>
              )}
            </div>

            {/* Status */}
            <div className="hidden">
              <input type="hidden" value={formData.status} readOnly />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
