import React, { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      ...notification,
      timestamp: Date.now(),
    };
    setNotifications((prev) => [...prev, newNotification]);
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  // Tự động xóa thông báo sau 5 giây
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setNotifications((prev) =>
        prev.filter((notif) => now - notif.timestamp < 5000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 rounded-xl shadow-lg border transform transition-all duration-300 ${
            notification.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {notification.type === "success" ? (
                <CheckCircle size={20} className="text-green-500" />
              ) : (
                <AlertCircle size={20} className="text-red-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{notification.message}</p>
              {notification.details && (
                <p className="text-xs mt-1 opacity-80">
                  {notification.details}
                </p>
              )}
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-black/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

//  HOOK useNotification
export const useNotification = () => {
  const [notificationSystem, setNotificationSystem] = useState(null);

  useEffect(() => {
    // Cách đúng: Sử dụng React context hoặc global state
    const system = window.__NOTIFICATION_SYSTEM__; // Temporary solution
    if (system) {
      setNotificationSystem(() => system);
    }
  }, []);

  const showNotification = (type, message, details = "") => {
    if (notificationSystem) {
      notificationSystem({ type, message, details });
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`, details);
    }
  };

  return {
    success: (message, details) =>
      showNotification("success", message, details),
    error: (message, details) => showNotification("error", message, details),
  };
};

export default NotificationSystem;
