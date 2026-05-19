// src/components/admin/ui/text-editor/modals/LinkModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../modal/Modal';

export default function LinkModal({ isOpen, onClose, onInsert }) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setUrl('');
        setText(window.getSelection().toString()); // Try to grab current selection
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault(); // allow Enter key
    if (url) onInsert(url, text);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insert Link">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Link URL *</label>
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            autoFocus
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-slate-700">Link Text (optional)</label>
          <input
            type="text"
            placeholder="Click here"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Insert Link
          </button>
        </div>
      </form>
    </Modal>
  );
}