// src/components/ui/ToggleSwitch.jsx
import React from 'react';

const ToggleSwitch = ({ label, name, checked, onChange }) => (
  <label className="inline-flex items-center cursor-pointer group p-2 rounded-lg hover:bg-background hover:shadow-sm transition-all border border-transparent hover:border-gray-200">
    <input
      type="checkbox"
      name={name}
      className="sr-only peer"
      checked={checked}
      onChange={onChange}
    />
    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
    <span className="ms-3 text-sm font-medium text-gray-700 group-hover:text-gray-900 select-none">
      {label}
    </span>
  </label>
);

export default ToggleSwitch;