import { useState } from "react";
import { Loader, AlertCircle, Wrench, UserCog } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axios.customize";

const RepairOrderTable = ({
  orders,
  loading,
  error,
  technicians = [],
  fetchOrders,
  setOrders,
}) => {
  const [assigning, setAssigning] = useState(null);
  const [selectedTechs, setSelectedTechs] = useState({}); // lưu theo orderId
  const navigate = useNavigate();

  const getProgressColor = (progress) => {
    if (progress >= 80) return "bg-green-100";
    if (progress >= 50) return "bg-blue-100";
    if (progress >= 25) return "bg-yellow-100";
    return "bg-gray-100";
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 80) return "text-green-700";
    if (progress >= 50) return "text-blue-700";
    if (progress >= 25) return "text-yellow-700";
    return "text-gray-700";
  };

  const handleAssign = async (orderId) => {
    const tech = selectedTechs[orderId];
    if (!tech) return toast.error("Please select a technician for this order.");

    try {
      setAssigning(orderId);
      const res = await axios.put(`/api/api/repairOrders/${orderId}`, {
        technicalName: tech,
      });
      toast.success("Technician assigned successfully!");

      setOrders((prev) =>
        prev.map((o) =>
          o.repairOrderId === orderId ? { ...o, techinal: tech } : o
        )
      );

      if (fetchOrders) await fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign technician.");
    } finally {
      setAssigning(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 bg-white rounded-lg border border-gray-200">
        <Loader className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-3" />
        <p className="text-gray-600 font-medium">Loading repair orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
        <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
        <div>
          <h3 className="font-semibold text-red-900">Error Loading Data</h3>
          <p className="text-red-700 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Wrench size={20} className="text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Repair Orders</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {orders.length} {orders.length === 1 ? "order" : "orders"} in progress
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Model
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                VIN
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                Technician
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Progress
              </th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr
                  key={order.repairOrderId}
                  className="hover:bg-blue-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    RO-{String(order.repairOrderId).padStart(3, "0")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                    {order.modelName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded">
                    {order.vin}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.prodcutYear}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {order.techinal || "–"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(
                            order.percentInProcess
                          )}`}
                          style={{ width: `${order.percentInProcess}%` }}
                        />
                      </div>
                      <span
                        className={`text-sm font-semibold ${getProgressTextColor(
                          order.percentInProcess
                        )}`}
                      >
                        {order.percentInProcess}%
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() =>
                        navigate(`/repair-orders/${order.repairOrderId}`)
                      }
                      className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      View Detail
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Wrench className="text-gray-300" size={32} />
                    <p className="text-gray-500 font-medium">
                      No repair orders found
                    </p>
                    <p className="text-gray-400 text-sm">
                      There are currently no repair orders to display
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RepairOrderTable;
