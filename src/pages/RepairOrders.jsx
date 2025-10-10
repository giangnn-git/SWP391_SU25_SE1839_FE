import { useState } from "react";
import { PlusCircle } from "lucide-react";
import RepairOrderTable from "../components/repairOrders/RepairOrderTable";
import RepairOrderModal from "../components/repairOrders/RepairOrderModal";


const RepairOrders = () => {
    const [orders, setOrders] = useState([
        { orderId: 1, claim: "CLAIM-001", technician: "John Doe", parts: ["Brake Pad", "Oil Filter"], status: "Pending" },
        { orderId: 2, claim: "CLAIM-002", technician: "Jane Smith", parts: ["Air Filter"], status: "Completed" },
        { orderId: 3, claim: "CLAIM-003", technician: "Mike Johnson", parts: ["Spark Plug", "Brake Fluid"], status: "In Progress" },
        { orderId: 4, claim: "CLAIM-004", technician: "Alice Brown", parts: ["Coolant", "Battery"], status: "Pending" },
        { orderId: 5, claim: "CLAIM-005", technician: "Tom Wilson", parts: ["Timing Belt"], status: "In Progress" },
        { orderId: 6, claim: "CLAIM-006", technician: "Emma Davis", parts: ["Brake Disc"], status: "Completed" },
        { orderId: 7, claim: "CLAIM-007", technician: "Chris Lee", parts: ["Fuel Pump"], status: "Pending" },
        { orderId: 8, claim: "CLAIM-008", technician: "Sophia Turner", parts: ["Oil Pan", "Air Filter"], status: "In Progress" },
        { orderId: 9, claim: "CLAIM-009", technician: "Daniel Harris", parts: ["Shock Absorber"], status: "Completed" },
        { orderId: 10, claim: "CLAIM-010", technician: "Olivia Martin", parts: ["Clutch Kit"], status: "Pending" },
        { orderId: 11, claim: "CLAIM-011", technician: "Ethan Clark", parts: ["Brake Caliper"], status: "Completed" },
        { orderId: 12, claim: "CLAIM-012", technician: "Mia Lewis", parts: ["Radiator"], status: "In Progress" },
        { orderId: 13, claim: "CLAIM-013", technician: "Liam Scott", parts: ["Alternator"], status: "Pending" },
        { orderId: 14, claim: "CLAIM-014", technician: "Ava Young", parts: ["Battery", "Brake Fluid"], status: "In Progress" },
        { orderId: 15, claim: "CLAIM-015", technician: "Noah King", parts: ["Suspension Kit"], status: "Completed" },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    const handleCreate = (newOrder) => {
        setOrders([newOrder, ...orders]);
    };

    const handleUpdate = (updatedOrder) => {
        setOrders(
            orders.map((o) => (o.orderId === updatedOrder.orderId ? updatedOrder : o))
        );
    };

    const handleDelete = (orderId) => {
        if (window.confirm("Are you sure you want to delete this order?")) {
            setOrders(orders.filter((o) => o.orderId !== orderId));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">🛠 Repair Orders Management</h2>
                <button
                    className="flex items-center bg-black text-white hover:bg-gray-800 px-4 py-2 rounded-md transition"
                    onClick={() => {
                        setEditingOrder(null);
                        setShowModal(true);
                    }}
                >
                    <PlusCircle size={18} className="mr-2" />
                    Add Repair Order
                </button>
            </div>

            <RepairOrderTable
                orders={orders}
                onEdit={(order) => {
                    setEditingOrder(order);
                    setShowModal(true);
                }}
                onDelete={handleDelete}
            />

            {showModal && (
                <RepairOrderModal
                    order={editingOrder}
                    onClose={() => setShowModal(false)}
                    onCreate={handleCreate}
                    onUpdate={handleUpdate}
                />
            )}
        </div>
    );
};

export default RepairOrders;
