const Dashboard = () => {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">
          Welcome to EV Warranty Management System
        </p>
      </div>

      {/* Dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Total Vehicles</h3>
          <p className="text-3xl font-bold text-primary-600">1,248</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Active Warranties</h3>
          <p className="text-3xl font-bold text-green-600">892</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-2">Pending Claims</h3>
          <p className="text-3xl font-bold text-yellow-600">23</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
