import React, { useState, useEffect } from "react";
import { Search, Filter, Car, Eye, Loader2, Shield } from "lucide-react";
import ViewVehicleModal from "../components/vehicles/ViewVehicleModal";
import { getAllModelsApi, getVehicleDetailApi } from "../services/api.service";
import { Link } from "react-router-dom";

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehiclesWithWarranty, setVehiclesWithWarranty] = useState([]);

  // Fetch data từ API và tính toán warranty
  const fetchVehiclesWithWarranty = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllModelsApi();
      const apiData = response.data?.data || [];

      // Fetch warranty info cho từng vehicle
      const vehiclesWithWarrantyData = await Promise.all(
        apiData.map(async (vehicle) => {
          try {
            const detailResponse = await getVehicleDetailApi(vehicle.id);
            const partPolicies = detailResponse.data?.data?.partPolicies || [];
            const modelPolicyName =
              detailResponse.data?.data?.modelPolicyName || "No Policy";

            return {
              ...vehicle,
              modelPolicyName,
              partPoliciesCount: partPolicies.length,
            };
          } catch (err) {
            console.error(
              `Error fetching details for vehicle ${vehicle.id}:`,
              err
            );
            return {
              ...vehicle,
              modelPolicyName: "No Policy",
              partPoliciesCount: 0,
            };
          }
        })
      );

      setVehicles(apiData);
      setVehiclesWithWarranty(vehiclesWithWarrantyData);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      setError(
        "Failed to load vehicle data. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehiclesWithWarranty();
  }, []);

  // Filter + Search logic - sử dụng vehiclesWithWarranty
  const filteredVehicles = vehiclesWithWarranty.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(v.releaseYear).includes(searchTerm);
    const matchesStatus =
      filterStatus === ""
        ? true
        : filterStatus === "in"
          ? v.isInProduction
          : !v.isInProduction;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6">

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:underline text-blue-600">Dashboard</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Vehicle Management</span>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Car size={26} className="text-gray-800" />
          <h1 className="text-2xl font-semibold">Vehicle Management</h1>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm flex flex-wrap gap-3 items-center">
        <Filter size={18} className="text-gray-600" />

        {/* Filter by Production Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-2 text-sm focus:ring-1 focus:ring-blue-400"
        >
          <option value="">All Status</option>
          <option value="in">In Production</option>
          <option value="out">Discontinued</option>
        </select>

        {/* Search Box */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name, year, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Loading & Error */}
      {loading ? (
        <div className="flex justify-center items-center py-10 text-gray-600">
          <Loader2 size={22} className="animate-spin mr-2" />
          Loading vehicles and warranty data...
        </div>
      ) : error ? (
        <div className="text-center bg-red-50 border border-red-200 text-red-700 py-4 rounded-lg mb-4">
          {error}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
            <table className="min-w-full text-sm text-gray-700 border-separate border-spacing-y-1">
              <thead className="bg-gray-100 text-gray-900 font-semibold">
                <tr>
                  <th className="py-3 px-4 text-left">Model Name</th>
                  <th className="py-3 px-4 text-left">Release Year</th>
                  <th className="py-3 px-4 text-left">Description</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredVehicles.map((v) => (
                  <tr
                    key={v.id}
                    className="bg-white border border-gray-200 hover:shadow-sm transition"
                  >
                    <td className="py-3 px-4 font-medium">{v.name}</td>
                    <td className="py-3 px-4">{v.releaseYear}</td>
                    <td className="py-3 px-4">{v.description}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-md ${v.isInProduction
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                          }`}
                      >
                        {v.isInProduction ? "In Production" : "Discontinued"}
                      </span>
                    </td>

                    {/* View Button */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center">
                        <button
                          title="View Details"
                          className="flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 rounded-md p-2 transition shadow-sm"
                          onClick={() => {
                            setSelectedVehicle(v);
                            setShowViewModal(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredVehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="text-center py-6 text-gray-500 italic"
                    >
                      No vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View Modal */}
      {showViewModal && selectedVehicle && (
        <ViewVehicleModal
          vehicle={selectedVehicle}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </div>
  );
};

export default VehicleManagement;
