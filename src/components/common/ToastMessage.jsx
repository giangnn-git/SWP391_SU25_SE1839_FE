import React, { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ToastMessage = ({ type, message, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      bg: "bg-green-50 border-green-200",
      text: "text-green-800",
      icon: <CheckCircle2 size={20} className="text-green-600" />,
      title: "Success",
    },
    error: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: <XCircle size={20} className="text-red-600" />,
      title: "Error",
    },
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      text: "text-yellow-800",
      icon: <AlertTriangle size={20} className="text-yellow-600" />,
      title: "Warning",
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-800",
      icon: <Info size={20} className="text-blue-600" />,
      title: "Info",
    },
  };

  const { bg, text, icon, title } = config[type] || config.info;

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-6 right-6 ${bg} border ${text} rounded-xl shadow-lg p-4 min-w-80 max-w-md animate-slideInRight z-[1000]`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm mb-1">{title}</h4>
          <p className="text-sm">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ToastMessage;
