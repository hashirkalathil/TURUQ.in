// src/components/ui/notification/NotificationPopup.jsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const NotificationPopup = ({
  message = "Notification message",
  type = "info",
  duration = 5000,
  onClose = () => {},
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconColor: "text-green-500",
      progressColor: "bg-green-500",
    },
    error: {
      icon: AlertCircle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      iconColor: "text-red-500",
      progressColor: "bg-red-500",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
      iconColor: "text-yellow-500",
      progressColor: "bg-yellow-500",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconColor: "text-blue-500",
      progressColor: "bg-blue-500",
    },
  };

  const config = typeConfig[type] || typeConfig["info"];
  const IconComponent = config.icon;

  const handleClose = useCallback(() => {
    setIsVisible(false);
    
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  useEffect(() => {
    const entryTimer = setTimeout(() => setIsVisible(true), 10);
    
    const startTime = Date.now();
    const endTime = startTime + duration;

    const progressInterval = setInterval(() => {
      const now = Date.now();
      const remaining = endTime - now;
      const percentage = 100 - (remaining / duration) * 100;
      
      if (percentage >= 100) {
        setProgress(100);
        clearInterval(progressInterval);
        handleClose();
      } else {
        setProgress(percentage);
      }
    }, 50);

    return () => {
      clearTimeout(entryTimer);
      clearInterval(progressInterval);
    };
  }, [duration, handleClose]);



  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-out pointer-events-auto
        ${config.bgColor} ${config.borderColor}
        ${isVisible 
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0"} 
        min-w-[320px] max-w-md w-full mb-3
      `}
      role="alert"
    >
      {/* Main content */}
      <div className="p-4 pr-12">
        <div className="flex items-start space-x-3">
          <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
          <p className="text-sm text-gray-800 leading-relaxed font-medium">
            {message}
          </p>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 transition-colors duration-200"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200/50">
        <div
          className={`h-full transition-all duration-75 ease-linear ${config.progressColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default NotificationPopup;