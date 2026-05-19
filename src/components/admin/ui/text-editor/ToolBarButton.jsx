// src/components/admin/ui/text-editor/ToolBarButton.jsx
import React from 'react';

const ToolbarButton = ({ 
  onClick, 
  icon: Icon, 
  title, 
  commandName, 
  activeCommands = {} 
}) => {
  const isActive = commandName ? activeCommands[commandName] : false;

  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
      }}
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={`
        p-[8px] bg-none border border-transparent rounded-lg cursor-pointer flex items-center justify-center text-slate-700 transition-all duration-200 ease-out
        hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 hover:-translate-y-[1px]
        ${
          isActive
            ? "bg-blue-100 border-blue-400 text-blue-700 shadow-inner"
            : "bg-transparent"
        }
      `}
    >
      <Icon size={18} />
    </button>
  );
};

export default ToolbarButton;