import { Search, Filter } from "lucide-react";

const ClaimFilterBar = ({ search, setSearch, status, setStatus }) => (
    <div className="bg-white shadow-sm rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
            <Search size={18} className="text-gray-500" />
            <input
                type="text"
                placeholder="Search by claim number, VIN, customer, or service center..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border-none outline-none text-sm bg-transparent"
            />
        </div>

        <div className="flex items-center gap-2 border-l pl-4">
            <Filter size={16} className="text-gray-500" />
            <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm"
            >
                <option>All</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
            </select>
        </div>
    </div>
);

export default ClaimFilterBar;
