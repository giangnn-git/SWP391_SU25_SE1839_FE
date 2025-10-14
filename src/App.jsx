import { Outlet } from "react-router-dom";
import Sidebar from "./components/layout/SideBar";
import Header from "./components/layout/Header";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        {/* Message Content */}
        <Toaster position="top-right" reverseOrder={false} containerStyle={{ top: '70px', zIndex: 99999, }} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default App;
