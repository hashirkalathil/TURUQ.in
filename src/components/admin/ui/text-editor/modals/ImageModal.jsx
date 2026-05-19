// src/components/admin/ui/text-editor/modals/ImageModal.jsx
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Modal from '../../modal/Modal';

export default function ImageModal({ isOpen, onClose, onInsert, onUpload }) {
  // ... (content is mostly fine, just ensure imports match above pattern)
  // Reusing your provided code but wrapping buttons in type="button"
  const [activeTab, setActiveTab] = useState('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setImageUrl('');
      setImageFile(null);
      setError('');
      setLoading(false);
      setActiveTab('upload');
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    setError('');
    let finalUrl = imageUrl;

    if (activeTab === 'upload' && imageFile) {
      if (!onUpload) {
        setError("Upload function not provided");
        return;
      }
      setLoading(true);
      try {
        finalUrl = await onUpload(imageFile);
        if (!finalUrl) throw new Error("No URL returned from upload");
      } catch (err) {
        setError(err.message || "Upload failed");
        setLoading(false);
        return;
      }
    }

    if (finalUrl) {
      onInsert(finalUrl);
      onClose();
    } else {
      setError("Please provide an image");
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Insert Image">
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'url' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
          >
            By URL
          </button>
        </div>

        {error && (
          <div className="text-xs bg-red-100 text-red-700 p-2 rounded border border-red-300">
            {error}
          </div>
        )}

        {activeTab === 'upload' ? (
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Select File</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-2 border border-slate-300 rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {imageFile && <p className="text-xs text-slate-500 mt-1">Selected: {imageFile.name}</p>}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-700">Image URL</label>
            <input
              type="url"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:border-blue-500"
            />
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Insert
          </button>
        </div>
      </div>
    </Modal>
  );
}