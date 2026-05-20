// src/components/admin/ui/text-editor/modals/FootnoteModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../../modal/Modal';

export default function FootnoteModal({ isOpen, onClose, onInsert, editingNode }) {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingNode) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setText(editingNode.getAttribute('data-note') || '');
      } else {
        setText('');
      }
    }
  }, [isOpen, editingNode]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onInsert(text.trim());
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={editingNode ? "Edit Footnote / Reference" : "Add Footnote / Reference"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2 text-slate-700">
            Footnote Text / Citation *
          </label>
          <textarea
            placeholder="Type or paste your reference, citation, or descriptive note here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full p-3 border border-slate-300 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all font-sans text-sm resize-none"
            autoFocus
            required
          />
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            This footnote will be placed at the current cursor position as a sequential superscript number, and the citation text will display at the bottom of the article.
          </p>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition duration-150 ease-in-out cursor-pointer"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-200 hover:shadow-lg transition duration-150 ease-in-out cursor-pointer"
          >
            {editingNode ? "Update Reference" : "Insert Footnote"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
