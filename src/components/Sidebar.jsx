import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Car,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  Package,
  Settings,
  Shield,
  Truck,
  Users,
  Wrench
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { cn } from './ui/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Bảng điều khiển', roles: ['sc-staff', 'sc-technician', 'evm-staff', 'admin'] },
  { href: '/vehicles', icon: Car, label: 'Quản lý xe', roles: ['sc-staff', 'sc-technician'] },
  { href: '/warranty-claims', icon: Shield, label: 'Yêu cầu bảo hành', roles: ['sc-staff', 'sc-technician', 'evm-staff', 'admin'] },
  { href: '/repair-execution', icon: Wrench, label: 'Sửa chữa & Thực hiện', roles: ['sc-staff', 'sc-technician'] },
  { href: '/service-campaigns', icon: ClipboardList, label: 'Chiến dịch dịch vụ', roles: ['sc-staff', 'sc-technician'] },
  { href: '/product-management', icon: Package, label: 'Quản lý sản phẩm', roles: ['evm-staff', 'admin'] },
  { href: '/claim-approval', icon: FileText, label: 'Phê duyệt yêu cầu', roles: ['evm-staff', 'admin'] },
  { href: '/supply-chain', icon: Truck, label: 'Chuỗi cung ứng', roles: ['evm-staff', 'admin'] },
  { href: '/analytics', icon: BarChart3, label: 'Phân tích báo cáo', roles: ['sc-staff', 'evm-staff', 'admin'] },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const filteredNavItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <aside
      className={cn(
        "bg-card border-r border-border flex flex-col transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-lg font-semibold">Bảo hành EV</h1>
              <p className="text-sm text-muted-foreground">Hệ thống quản lý</p>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredNavItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                    isCollapsed && "justify-center"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {!isCollapsed && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <div>
              <p className="font-medium">
                {user?.role
                  ?.replace('-', ' ')
                  ?.replace(/\b\w/g, (l) => l.toUpperCase())}
              </p>
              <p className="text-xs">{user?.organization}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
