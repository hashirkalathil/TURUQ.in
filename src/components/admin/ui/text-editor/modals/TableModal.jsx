// src/components/admin/ui/text-editor/modals/TableModal.jsx
import React, { useState } from 'react';
import Modal from '../../modal/Modal';

export default function TableModal({ isOpen, onClose, onInsert }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  const handleSubmit = (e) => {
    e.preventDefault();
    onInsert(rows, cols);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insert Table">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Rows</label>
            <input
              type="number"
              min="1"
              max="20"
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value) || 1)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Columns</label>
            <input
              type="number"
              min="1"
              max="10"
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value) || 1)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Insert Table
          </button>
        </div>
      </form>
    </Modal>
  );
}