import React from 'react';
import { useAuth } from '../context/AuthContext'; // ✅ sửa import từ AuthContext, KHÔNG còn import từ App.jsx
import { Button } from './ui/button';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card border-b px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold">OEM EV Warranty Management</h1>
      <div className="flex items-center space-x-4">
        {user && (
          <>
            <span className="text-sm text-muted-foreground">
              {user.name} ({user.role})
            </span>
            <Button variant="outline" onClick={logout}>
              Đăng xuất
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
