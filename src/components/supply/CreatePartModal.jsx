import React, { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle2 } from "lucide-react";

const CreatePartModal = ({
  onClose,
  onSubmit,
  editMode = false,
  part = null,
}) => {
  const [form, setForm] = useState({
    code: "",
    name: "",
    model: "",
    quantity: "",
    location: "",
  });

  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [fadeOut, setFadeOut] = useState(false);

  // Populate form if in edit mode
  useEffect(() => {
    if (editMode && part) {
      setForm({
        code: part.code || "",
        name: part.name || "",
        model: part.model || "",
        quantity: part.quantity || "",
        location: part.location || "",
      });
    }
  }, [editMode, part]);

  // Auto-hide feedback messages
  useEffect(() => {
    if (feedback.message) {
      const timer = setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          setFeedback({ type: "", message: "" });
          setFadeOut(false);
        }, 400);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  //
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  //
  const validateForm = () => {
    if (
      !form.code ||
      !form.name ||
      !form.model ||
      !form.quantity ||
      !form.location
    ) {
      setFeedback({
        type: "error",
        message: "Please fill in all fields before saving.",
      });
      return false;
    }
    if (form.quantity <= 0) {
      setFeedback({
        type: "error",
        message: "Quantity must be greater than zero.",
      });
      return false;
    }
    return true;
  };

  //
  const handleSubmit = () => {
    if (!validateForm()) return;

    const formattedPart = {
      ...form,
      quantity: Number(form.quantity),
      id: editMode && part ? part.id : Date.now(),
      status:
        form.quantity <= 3
          ? "Critical"
          : form.quantity <= 6
          ? "Low stock"
          : "Available",
    };

    onSubmit(formattedPart);
    setFeedback({
      type: "success",
      message: editMode
        ? "Part information updated successfully!"
        : "New part added successfully!",
    });

    if (!editMode) {
      setForm({
        code: "",
        name: "",
        model: "",
        quantity: "",
        location: "",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className={`bg-white rounded-xl shadow-lg w-[420px] p-6 transform transition-all duration-300 ${
          fadeOut ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {editMode ? "Edit Part Information" : "Add New Part"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition"
          >
            <X size={20} className="text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* Feedback Message */}
        {feedback.message && (
          <div
            className={`flex items-center gap-2 text-sm mb-3 px-3 py-2 rounded-md transition-opacity duration-500 ${
              feedback.type === "error"
                ? "bg-red-50 text-red-600 border border-red-200"
                : "bg-green-50 text-green-700 border border-green-200"
            } ${fadeOut ? "opacity-0" : "opacity-100"}`}
          >
            {feedback.type === "error" ? (
              <AlertCircle size={16} />
            ) : (
              <CheckCircle2 size={16} />
            )}
            {feedback.message}
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          {["code", "name", "model", "quantity", "location"].map((field) => (
            <div key={field}>
              <label className="block text-sm text-gray-700 mb-1 capitalize">
                {field === "code"
                  ? "Part Code"
                  : field === "name"
                  ? "Part Name"
                  : field === "model"
                  ? "Model"
                  : field === "quantity"
                  ? "Quantity"
                  : "Storage Location"}
              </label>
              <input
                name={field}
                type={field === "quantity" ? "number" : "text"}
                placeholder={
                  field === "code"
                    ? "Enter part code..."
                    : field === "name"
                    ? "Enter part name..."
                    : field === "model"
                    ? "Enter model..."
                    : field === "quantity"
                    ? "Enter quantity..."
                    : "Enter warehouse location..."
                }
                value={form[field]}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded-md text-white transition ${
              editMode
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-black hover:bg-gray-800"
            }`}
            onClick={handleSubmit}
          >
            {editMode ? "Save Changes" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePartModal;
