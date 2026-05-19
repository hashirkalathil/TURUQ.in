// src/components/ui/button/Button.jsx
"use client";
import React, { useState, useRef } from 'react';

const Button = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false, 
  variant = 'primary',
  size = 'medium',
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);
  const timeoutRef = useRef(null);

  const createRipple = (event) => {
    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const newRipple = {
      x,
      y,
      size,
      id: Date.now()
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  const handleClick = (event) => {
    if (disabled) return;

    // Create ripple effect
    createRipple(event);

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Execute the onClick function after 2 seconds
    if (onClick) {
        onClick(event);
    }
  };

  // Base button styles
  const baseStyles = 'relative overflow-hidden cursor-pointer select-none font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:transform active:scale-95';
  
  // Size variants
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg'
  };

  // Color variants
  const variantStyles = {
    primary: disabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
      : 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-500',
    secondary: disabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
      : 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    success: disabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
      : 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500',
    danger: disabled 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
      : 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500',
    outline: disabled 
      ? 'border border-gray-300 text-gray-500 cursor-not-allowed' 
      : 'border border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500'
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <button
      ref={buttonRef}
      className={combinedClassName}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {/* Button content */}
      <span className="relative z-10">{children}</span>
      
      {/* Ripple effects */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-background opacity-30 animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            animationDuration: '600ms',
            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            transform: 'scale(0)',
            animation: 'ripple 600ms cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      ))}

      {/* Custom ripple animation */}
      <style jsx>{`
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};

export default Button;