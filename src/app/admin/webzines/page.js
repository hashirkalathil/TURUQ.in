// src/app/admin/webzines/page.js
'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Added for navigation
import {
  PlusCircle,
  Trash2,
  Edit,
  BookOpen,
  LoaderCircle,
  Calendar,
  LayoutGrid
} from 'lucide-react';
import Modal from '@/components/admin/ui/modal/Modal';
import { useNotification } from '@/components/ui/notification/NotificationProvider';
import { AddWebzineForm } from '@/components/admin/webzines/AddWebzineForm';
import { EditWebzineForm } from '@/components/admin/webzines/EditWebzineForm';

// --- API FETCH FUNCTION ---
const fetchWebzines = async (addNotification) => {
  const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

  if (!API_KEY_TO_SEND) {
    const msg = 'API Key is missing. Check your .env.local file.';
    console.error(msg);
    if (addNotification) addNotification('error', msg);
    return [];
  }

  try {
    const res = await fetch('/api/admin/webzines', {
      method: 'GET',
      headers: {
        'x-api-key': API_KEY_TO_SEND,
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Failed to fetch webzines: ${res.status}`);
    }

    const jsonData = await res.json();

    if (Array.isArray(jsonData)) return jsonData;
    return Array.isArray(jsonData.data) ? jsonData.data : [];

  } catch (error) {
    console.error("Fetch webzines error:", error);
    if (addNotification) {
      addNotification('error', error.message || 'Error loading webzines.');
    }
    return [];
  }
}

export default function WebzinesPage() {
  const router = useRouter();
  const { addNotification } = useNotification();
  const [webzines, setWebzines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [itemToEditId, setItemToEditId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState({ id: null, name: '' });

  const loadWebzines = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchWebzines(addNotification);
      setWebzines(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadWebzines();
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => setSettings(j.data))
      .catch(() => {});
  }, [loadWebzines]);

  /* ------------- Handlers ------------- */

  const handleCardClick = (webzine) => {
    const params = new URLSearchParams({
      id: webzine._id,
      title: webzine.name
    });
    router.push(`/admin/webzines/arrange?${params.toString()}`);
  };

  const handleWebzineAdded = (newItem) => {
    setWebzines((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);
    addNotification('success', 'Webzine added successfully!');
  };

  const handleWebzineUpdated = (updatedItem) => {
    setWebzines((prev) =>
      prev.map(item => item._id === updatedItem._id ? updatedItem : item)
    );
    setIsEditModalOpen(false);
    addNotification('success', `Webzine "${updatedItem.name}" updated successfully!`);
  };

  const handleEdit = (e, id) => {
    e.stopPropagation();
    setItemToEditId(id);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (e, id, name) => {
    e.stopPropagation();
    setItemToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    const id = itemToDelete.id;
    if (!id) return;

    setIsDeleteModalOpen(false);
    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    try {
      const res = await fetch('/api/admin/webzines', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY_TO_SEND,
        },
        body: JSON.stringify({ id }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || `Failed to delete webzine`);
      }

      setWebzines((prev) => prev.filter((a) => a._id !== id));
      addNotification('success', result.message || `Webzine deleted successfully.`);
    } catch (error) {
      console.error('Delete Error:', error.message);
      addNotification('error', error.message || 'An error occurred during deletion.');
    } finally {
      setItemToDelete({ id: null, name: '' });
    }
  };

  /* ------------- Render ------------- */
  if (loading && webzines.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoaderCircle className="w-10 h-10 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 pb-6 shadow-md rounded-xl">
      <div className="flex justify-between items-center mb-8 pt-4">
        <h1 className="text-2xl font-bold text-gray-800 uppercase flex items-center gap-2">
          <LayoutGrid className="w-6 h-6 text-background" />
          Webzines Management
        </h1>
        {!settings?.permissions?.disable_create_webzines && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Webzine
          </button>
        )}
      </div>

      {/* Grid Layout for Webzines */}
      <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {webzines.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 bg-background rounded-lg border-2 border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No webzines found. Create your first issue!</p>
          </div>
        ) : (
          webzines.map((webzine) => {
            // Determine status color
            let statusColor = "bg-background text-gray-600";
            if (webzine.status === 'published') statusColor = "bg-green-100 text-green-700 border-green-200";
            if (webzine.status === 'archived') statusColor = "bg-yellow-100 text-yellow-700 border-yellow-200";

            return (
              <div
                key={webzine._id}
                onClick={() => handleCardClick(webzine)}
                className="group relative bg-background  rounded-xl overflow-hidden shadow-amber-500/50 shadow-sm transition-all duration-300 cursor-pointer hover:-translate-y-0.5 flex flex-col"
              >
                {/* Cover Image Area */}
                <div className="relative h-48 w-full bg-gray-100 border-b border-gray-100">
                  {webzine.cover_image ? (
                    <Image
                      unoptimized={true}
                      src={webzine.cover_image}
                      alt={webzine.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <BookOpen className="w-16 h-16" />
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border shadow-sm ${statusColor}`}>
                      {webzine.status}
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-900 capitalize mb-1 group-hover:text-amber-500 transition-colors">
                    {webzine.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                    {webzine.description || "No description provided."}
                  </p>

                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {webzine.published_at
                        ? new Date(webzine.published_at).toLocaleDateString()
                        : 'Draft'}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {!settings?.permissions?.disable_edit_webzines && (
                        <button
                          onClick={(e) => handleEdit(e, webzine._id)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Settings"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {!settings?.permissions?.disable_delete_webzines && (
                        <button
                          onClick={(e) => openDeleteModal(e, webzine._id, webzine.name)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Webzine"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* Add Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Issue"
      >
        <AddWebzineForm
          onWebzineAdded={handleWebzineAdded}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Issue"
      >
        {isEditModalOpen && itemToEditId && (
          <EditWebzineForm
            webzineId={itemToEditId}
            onWebzineUpdated={handleWebzineUpdated}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <span className="font-bold text-red-600">&quot;{itemToDelete.name}&quot;</span>?
            This will also unlink any posts associated with this issue.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}