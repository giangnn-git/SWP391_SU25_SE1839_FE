import React, { useState, useEffect } from "react";
import { Car, Eye, Plus, Loader2 } from "lucide-react";
import { getVehiclesByCustomerIdApi } from "../../services/api.service";

const CustomerVehiclesPreview = ({ customer, onViewVehicle, onAddVehicle }) => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getVehiclesByCustomerIdApi(customer.id);
        const list = res?.data?.data ?? res?.data ?? [];
        setVehicles(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        setError("Failed to load vehicles");
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [customer.id]);

  const formatDateTuple = (arr) =>
    Array.isArray(arr) && arr.length >= 3
      ? `${arr[2]}/${arr[1]}/${arr[0]}`
      : "-";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 size={20} className="animate-spin text-blue-600 mr-2" />
        <span className="text-gray-600">Loading vehicles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600 bg-red-50 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <Car size={16} />
          Registered Vehicles ({vehicles.length})
        </h4>
        <button
          onClick={() => onAddVehicle?.(customer)}
          className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={14} />
          Add Vehicle
        </button>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <Car size={32} className="text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">No vehicles registered</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {vehicles.slice(0, 3).map((vehicle, index) => (
            <div
              key={vehicle?.id ?? vehicle?.vin ?? index}
              className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {vehicle?.vin ?? "-"}
                  </code>
                  <span className="font-medium text-gray-900">
                    {vehicle?.modelName ?? "-"}
                  </span>
                  {vehicle?.licensePlate && (
                    <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                      {vehicle.licensePlate}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Purchase: {formatDateTuple(vehicle?.purchaseDate)} •
                  Campaigns:{" "}
                  {Array.isArray(vehicle?.campaignNames)
                    ? vehicle.campaignNames.length
                    : 0}
                </div>
              </div>
              <button
                onClick={() => onViewVehicle?.(vehicle)}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <Eye size={14} />
                View Details
              </button>
            </div>
          ))}

          {vehicles.length > 3 && (
            <div className="text-center text-sm text-gray-500 py-2">
              + {vehicles.length - 3} more vehicles
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerVehiclesPreview;
