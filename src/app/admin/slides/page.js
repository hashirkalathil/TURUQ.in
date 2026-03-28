"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  XCircle,
  PlusCircle,
  RefreshCw,
  Search,
  CheckCircle2
} from "lucide-react";

import Table from "@/components/admin/ui/Table";
import Modal from "@/components/admin/ui/modal/Modal";
import EditPostForm from "@/components/admin/posts/EditPostForm";
import { useNotification } from "@/components/ui/notification/NotificationProvider";

const fetchSlidePosts = async (page = 1) => {
  try {
    const res = await fetch(`/api/admin/posts?is_slide=true&page=${page}&limit=20`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Failed to fetch slides: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch slides error:", error);
    return { data: [], pagination: { total: 0, page: 1, pages: 1 } };
  }
};

const SLIDES_COLUMNS = [
  {
    key: "title",
    header: "Title",
    className: "font-bold max-w-xs truncate",
    render: (p) => p.title || "Untitled",
  },
  {
    key: "author_id",
    header: "Author",
    render: (p) => p.author_id?.name || "Unknown",
  },
  {
    key: "created_at",
    header: "Date",
    className: "text-gray-600",
    render: (p) =>
      p.created_at ? new Date(p.created_at).toLocaleDateString() : "-",
  },
  {
    key: "status",
    header: "Status",
    render: (p) => (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold border ${p.status === "published"
          ? "bg-green-100 text-green-800 border-green-300"
          : "bg-yellow-100 text-yellow-800 border-yellow-300"
          }`}
      >
        {p.status}
      </span>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (post, { handleEdit, handleRemoveFromSlides }) => (
      <div className="flex gap-2">
        <button
          className="p-1 rounded-full hover:bg-yellow-100 transition-colors"
          title="Edit Post"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(post._id);
          }}
        >
          <Edit className="w-4 h-4 text-yellow-600" />
        </button>
        <Link
          href={`/${post.slug}`}
          target="_blank"
          title="View Live"
          className="p-1 rounded-full hover:bg-blue-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          <Eye className="w-4 h-4 text-blue-600" />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveFromSlides(post);
          }}
          title="Remove from Slides"
          className="p-1 rounded-full hover:bg-red-100 transition-colors"
        >
          <XCircle className="w-4 h-4 text-red-600" />
        </button>
      </div>
    ),
  },
];

export default function SlidesPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  // New state for Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const { addNotification } = useNotification();

  const loadData = useCallback(async (pageToLoad) => {
    setLoading(true);
    try {
      const pRes = await fetchSlidePosts(pageToLoad);

      setPosts(Array.isArray(pRes.data) ? pRes.data : []);

      if (pRes.pagination) {
        setCurrentPage(pRes.pagination.page);
        setTotalPages(pRes.pagination.pages);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(currentPage);
  }, [currentPage, loadData]);

  const handleRemoveFromSlides = async (post) => {
    if (!window.confirm(`Remove "${post.title}" from slides?`)) return;
    
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          _id: post._id,
          permissions: {
            ...post.permissions,
            is_slide_article: false
          } 
        }),
      });

      if (!res.ok) throw new Error("Update failed");
      addNotification("success", "Removed from slides");
      loadData(currentPage);
    } catch (error) {
      addNotification("error", "Error removing post from slides");
    }
  };

  const fetchCandidates = async (page = 1) => {
    setCandidatesLoading(true);
    try {
      const res = await fetch(`/api/admin/posts?not_slide=true&page=${page}&limit=50`);
      if (res.ok) {
        const json = await res.json();
        setCandidates(json.data);
      }
    } catch (error) {
      console.error("Fetch candidates error:", error);
    } finally {
      setCandidatesLoading(false);
    }
  };

  const handleAddToSlides = async (post) => {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: post._id,
          permissions: {
            ...post.permissions,
            is_slide_article: true
          }
        })
      });

      if (res.ok) {
        addNotification("success", `"${post.title}" added to slides`);
        // Remove from candidates list locally for immediate feedback
        setCandidates(prev => prev.filter(p => p._id !== post._id));
        loadData(currentPage);
      } else {
        addNotification("error", "Failed to add post to slides");
      }
    } catch (error) {
      addNotification("error", "Network error while adding to slides");
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
    fetchCandidates();
  };

  const handleEdit = (id) => {
    setEditingPostId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingPostId(null), 300);
  };

  const refreshList = () => {
    loadData(currentPage);
    closeModal();
  };

  return (
    <div className="container mx-auto px-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 uppercase">Slides Management</h1>
        <div className="flex gap-2">
            <button
                onClick={() => loadData(currentPage)}
                className="flex items-center text-sm px-4 py-2 bg-background text-gray-700 rounded-md cursor-pointer transition-colors border border-gray-300"
            >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
                onClick={openAddModal}
                className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
            >
                <PlusCircle className="w-5 h-5 mr-2" /> Add More Slides
            </button>
        </div>
      </div>

      <div className="bg-blue-50 border-l-4 border-gray-400 p-4 mb-6">
        <p className="text-sm text-gray-600 font-medium">
            The articles listed below are currently appearing in the homepage carousel. You can remove them or edit their details here.
        </p>
      </div>

      <Table
        data={posts}
        columns={SLIDES_COLUMNS}
        loading={loading}
        searchable
        searchKeys={["title"]}
        handlers={{ handleEdit, handleRemoveFromSlides }}
        emptyMessage="No slide articles found. Add some from the Posts page."
      />

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4 border-t pt-4">
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Edit Slide Article"
        className="max-w-full"
        closeOnOutsideClick={false}
      >
        {editingPostId && (
          <EditPostForm
            postId={editingPostId}
            onPostUpdated={refreshList}
            onCancel={closeModal}
          />
        )}
      </Modal>

      {/* ADD SLIDES MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Select Posts to Add to Slides"
        className="max-w-4xl"
      >
        <div className="space-y-4">
          <Table
            data={candidates}
            loading={candidatesLoading}
            columns={[
              {
                key: "title",
                header: "Post Title",
                className: "font-semibold max-w-sm truncate",
                render: (p) => p.title
              },
              {
                key: "author_id",
                header: "Author",
                render: (p) => p.author_id?.name || "Unknown"
              },
              {
                key: "actions",
                header: "Action",
                render: (p) => (
                  <button
                    onClick={() => handleAddToSlides(p)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs font-bold hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Add
                  </button>
                )
              }
            ]}
            searchable
            searchKeys={["title"]}
            emptyMessage="No more candidates found. Make sure articles are published."
          />
        </div>
      </Modal>
    </div>
  );
}
