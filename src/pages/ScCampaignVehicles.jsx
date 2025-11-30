import React, { useEffect, useMemo, useState } from "react";
import { Search, Filter, CarFront } from "lucide-react";
import { getVehiclesInCampaignsByScApi } from "../services/api.service";
import { Link } from "react-router-dom";

// format [yyyy, m, d] -> dd/mm/yyyy
const formatDate = (arr) => {
  if (!Array.isArray(arr) || arr.length !== 3) return "N/A";
  const [y, m, d] = arr;
  return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
};

// Trạng thái lọc
const STATUSES = ["ALL", "NOTIFIED", "COMPLETED"];

const ScCampaignVehicles = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // phân trang (fix cứng 10 dòng / trang)
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await getVehiclesInCampaignsByScApi();
      const data = res?.data?.data ?? [];

      const mapped = data.map((x) => ({
        ...x,
        formattedStartDate: formatDate(x.startDate),
        formattedEndDate: formatDate(x.endDate),
      }));

      setRows(mapped);
    } catch (e) {
      console.error(e);

      const errorResponse = e?.response?.data;
      const errorMessage =
        errorResponse?.errorCode ||
        errorResponse?.message ||
        e.message ||
        "Failed to load vehicles.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterStatus, searchTerm]);

  const filteredRows = useMemo(() => {
    let data = [...rows];
    if (filterStatus !== "ALL") {
      data = data.filter((r) => r.status === filterStatus);
    }
    if (searchTerm.trim()) {
      const k = searchTerm.trim().toLowerCase();
      data = data.filter((r) =>
        [
          r.campaignName,
          r.vin,
          r.customerName,
          r.email,
          r.phoneNumber,
          r.address,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(k))
      );
    }
    return data;
  }, [rows, filterStatus, searchTerm]);

  // pagination logic
  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const pageRows = filteredRows.slice(startIdx, endIdx);

  const pageNumbers = (() => {
    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - windowSize + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  return (
    <div className="p-6 bg-gradient-to-b from-white via-blue-50/50 to-white min-h-screen">

      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-2">
        <Link to="/" className="hover:underline text-blue-600">Dashboard</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Campaign Recall Vehicles</span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl">
            <CarFront size={26} className="text-blue-700" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              Campaign Recall Vehicles
            </h1>
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="bg-white border border-gray-200 rounded-xl p-3 md:p-4 mb-6 shadow-md">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 border border-gray-300 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[260px]">
            <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search VIN / customer / email / phone / address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full pl-10 pr-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl shadow-md">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Campaign</th>
              <th className="px-4 py-3 text-left font-semibold">VIN</th>
              <th className="px-4 py-3 text-left font-semibold">Customer</th>
              <th className="px-4 py-3 text-left font-semibold">Contact</th>
              <th className="px-4 py-3 text-left font-semibold">Address</th>
              <th className="px-4 py-3 text-left font-semibold">Start</th>
              <th className="px-4 py-3 text-left font-semibold">End</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-gray-500 animate-pulse"
                >
                  Loading vehicles...
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-500">
                  No vehicles found.
                </td>
              </tr>
            ) : (
              pageRows.map((r, i) => (
                <tr
                  key={`${r.vin}-${i}`}
                  className="hover:bg-blue-50/50 transition-all"
                >
                  <td className="px-4 py-3 font-medium">{r.campaignName}</td>
                  <td className="px-4 py-3 font-mono text-blue-700">{r.vin}</td>
                  <td className="px-4 py-3">{r.customerName}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span>{r.email}</span>
                      <span className="text-gray-500">{r.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{r.address}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {r.formattedStartDate}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {r.formattedEndDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${r.status === "NOTIFIED"
                        ? "bg-yellow-100 text-yellow-800"
                        : r.status === "COMPLETED"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col md:flex-row items-center gap-3 justify-between text-sm text-gray-700">
        <div>
          {total === 0 ? (
            "0 results"
          ) : (
            <>
              Showing <span className="font-medium">{startIdx + 1}</span>–
              <span className="font-medium">{endIdx}</span> of{" "}
              <span className="font-medium">{total}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded-lg border ${currentPage === 1
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "hover:bg-gray-50 border-gray-300"
              }`}
          >
            Prev
          </button>

          {pageNumbers.map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-3 py-1.5 rounded-lg border ${n === currentPage
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-300 hover:bg-gray-50"
                }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded-lg border ${currentPage === totalPages
              ? "text-gray-400 border-gray-200 cursor-not-allowed"
              : "hover:bg-gray-50 border-gray-300"
              }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScCampaignVehicles;
