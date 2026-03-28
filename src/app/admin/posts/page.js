// src/app/admin/posts/page.js
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Copy,
  Check,
  Zap,
  Star,
  Lock,
  PlusCircle,
  ChevronLeft,
  Edit,
  Eye,
  Trash2
} from "lucide-react";

import Table from "@/components/admin/ui/Table";
import Modal from "@/components/admin/ui/modal/Modal";
import AddPostForm from "@/components/admin/posts/AddPostForm";
import EditPostForm from "@/components/admin/posts/EditPostForm";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import { useNotification } from "@/components/ui/notification/NotificationProvider";

const fetchPosts = async (page = 1) => {
  try {
    const res = await fetch(`/api/admin/posts?page=${page}&limit=20`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error("Fetch posts error:", error);
    return { data: [], pagination: { total: 0, page: 1, pages: 1 } };
  }
};

const POSTS_COLUMNS = [
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
    render: (p, { handleToggleStatus }) => (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <ToggleSwitch
          checked={p.status === "published"}
          onChange={() => handleToggleStatus(p)}
          label={p.status === "published" ? "Live" : "Draft"}
        />
      </div>
    ),
  },
  {
    key: "actions",
    header: "Actions",
    render: (post, { handleEdit, handleDelete, handleCopyLink }) => (
      <div className="flex gap-2">
        <button
          className="p-1 rounded-full hover:bg-yellow-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(post._id);
          }}
          title="Edit Post"
        >
          <Edit className="w-4 h-4 text-yellow-600" />
        </button>
        <button
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleCopyLink(post);
          }}
          title="Copy Link"
        >
          <Copy className="w-4 h-4 text-gray-600" />
        </button>
        <Link
          href={`/${post.slug}`}
          target="_blank"
          className="p-1 rounded-full hover:bg-blue-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
          title="View Live"
        >
          <Eye className="w-4 h-4 text-blue-600" />
        </Link>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(post._id);
          }}
          className="p-1 rounded-full hover:bg-red-100 transition-colors"
          title="Delete Post"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>
    ),
  },
];

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const { addNotification } = useNotification();

  const loadData = useCallback(async (pageToLoad) => {
    setLoading(true);
    try {
      const pRes = await fetchPosts(pageToLoad);

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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch("/api/admin/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      addNotification("success", "Post deleted successfully");
      loadData(currentPage);
    } catch (error) {
      addNotification("error", "Error deleting post");
    }
  };

  const updatePostProperty = async (post, update) => {
    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: post._id, ...update }),
      });
      if (!res.ok) throw new Error("Update failed");
      addNotification("success", "Post updated");
      loadData(currentPage);
    } catch (error) {
      addNotification("error", "Failed to update post");
    }
  };

  const handleToggleStatus = (post) => {
    const newStatus = post.status === "published" ? "draft" : "published";
    updatePostProperty(post, { status: newStatus });
  };

  const handleToggleFeatured = (post) => {
    updatePostProperty(post, { 
      permissions: { ...post.permissions, is_featured: !post.permissions?.is_featured } 
    });
  };

  const handleTogglePremium = (post) => {
    updatePostProperty(post, { 
      permissions: { ...post.permissions, is_premium: !post.permissions?.is_premium } 
    });
  };

  const handleCopyLink = (post) => {
    const url = `${window.location.origin}/${post.slug}`;
    navigator.clipboard.writeText(url);
    addNotification("success", "Link copied to clipboard");
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
    loadData(1);
    closeModal();
  };

  return (
    <div className="container mx-auto px-6 pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 uppercase">Posts</h1>
        <button
          onClick={() => {
            setEditingPostId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center text-sm px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> New Post
        </button>
      </div>

      <Table
        data={posts}
        columns={POSTS_COLUMNS}
        loading={loading}
        searchable
        searchKeys={["title"]}
        handlers={{ 
          handleEdit, 
          handleDelete, 
          handleToggleStatus, 
          handleToggleFeatured, 
          handleTogglePremium,
          handleCopyLink
        }}
        onReload={() => loadData(currentPage)}
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
        title={editingPostId ? "Edit Post" : "Add New Post"}
        className="max-w-full"
        closeOnOutsideClick={false}
      >
        {editingPostId ? (
          <EditPostForm
            postId={editingPostId}
            onPostUpdated={refreshList}
            onCancel={closeModal}
          />
        ) : (
          <AddPostForm onPostAdded={refreshList} onCancel={closeModal} />
        )}
      </Modal>
    </div>
  );
}