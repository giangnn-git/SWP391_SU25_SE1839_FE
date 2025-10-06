import LogoutButton from "../auth/LogoutButton";
import { storage } from "../../utils/storage";

const Header = () => {
  const userEmail = storage.get("userEmail");

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex justify-between items-center h-16 px-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            EV Warranty Management System
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{userEmail}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
