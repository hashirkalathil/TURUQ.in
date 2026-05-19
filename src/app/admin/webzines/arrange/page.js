// src/app/admin/webzines/arrange/page.js
'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  Minus,
  Search,
  Loader2,
  FileText
} from 'lucide-react';
import { useNotification } from '@/components/ui/notification/NotificationProvider';

// --- API HELPER FUNCTIONS ---

// Fetch all posts (Removed search param since we filter on client)
const fetchAllPosts = async () => {
  try {
    // We request a higher limit to ensure we get a good pool of recent posts
    const res = await fetch(`/api/admin/posts?limit=100`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch posts");
    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

// Update a specific post's webzine_id
const updatePostWebzine = async (postId, webzineId) => {
  const res = await fetch('/api/admin/posts', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      _id: postId,
      webzine_id: webzineId
    }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to update post");
  }
  return await res.json();
};

// --- MAIN CONTENT COMPONENT ---

function ArrangeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addNotification } = useNotification();

  // Get Webzine details from URL
  const webzineId = searchParams.get('id');
  const webzineTitle = searchParams.get('title');

  // State
  const [availablePosts, setAvailablePosts] = useState([]);
  const [assignedPosts, setAssignedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load Data
  const loadPosts = useCallback(async () => {
    if (!webzineId) return;
    setLoading(true);

    // Fetch posts (load once, filter locally)
    const allPosts = await fetchAllPosts();

    const assigned = [];
    const available = [];

    allPosts.forEach(post => {
      // Check if post belongs to THIS webzine
      // Handles both populated object or direct ID string
      const pWebzineId = post.webzine_id?._id || post.webzine_id;

      // If the post belongs to THIS webzine, add to assigned
      if (pWebzineId === webzineId) {
        assigned.push(post);
      }
      // If the post has NO webzine assigned, add to available
      else if (!pWebzineId) {
        available.push(post);
      }
      // If post has a DIFFERENT webzine assigned, we ignore it (it's not available)
    });

    setAssignedPosts(assigned);
    setAvailablePosts(available);
    setLoading(false);
  }, [webzineId]); // Removed searchTerm dependency

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // --- Handlers ---

  const handleAssign = async (post) => {
    setProcessingId(post._id);
    try {
      await updatePostWebzine(post._id, webzineId);

      setAvailablePosts(prev => prev.filter(p => p._id !== post._id));
      setAssignedPosts(prev => [{ ...post, webzine_id: webzineId }, ...prev]);

      addNotification('success', 'Post added to webzine');
    } catch (error) {
      addNotification('error', 'Failed to add post');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemove = async (post) => {
    setProcessingId(post._id);
    try {
      await updatePostWebzine(post._id, null);

      setAssignedPosts(prev => prev.filter(p => p._id !== post._id));
      setAvailablePosts(prev => [{ ...post, webzine_id: null }, ...prev]);

      addNotification('success', 'Post removed from webzine');
    } catch (error) {
      addNotification('error', 'Failed to remove post');
    } finally {
      setProcessingId(null);
    }
  };

  // --- Filter Logic ---
  // We filter the available posts based on the search term here
  const filteredAvailablePosts = availablePosts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!webzineId) return <div className="p-6 text-red-500">Missing Webzine ID</div>;

  return (
    <div className="container mx-auto px-6 pb-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 uppercase">
              Manage Content
            </h1>
            <p className="text-sm text-gray-500">
              Assigning posts to: <span className="font-bold text-red-600">{webzineTitle || 'Unknown Webzine'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">

        {/* Left Column: Available Posts */}
        <div className="flex flex-col bg-background border border-gray-300 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-300 bg-background">
            <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Available Posts
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-background">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : filteredAvailablePosts.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-10">
                {searchTerm ? "No matching posts found." : "No available posts found."}
              </p>
            ) : (
              filteredAvailablePosts.map(post => (
                <div
                  key={post._id}
                  className="group flex items-center justify-between p-3 bg-background border border-gray-300 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate pr-4">{post.title}</p>
                    <p className="text-xs text-gray-500">
                      {post.author_id?.name || 'Unknown Author'} • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAssign(post)}
                    disabled={processingId === post._id}
                    className="flex-shrink-0 p-2 bg-red-500 hover:bg-red-700 text-white rounded-full transition-colors"
                  >
                    {processingId === post._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Assigned Posts */}
        <div className="flex flex-col bg-background border-2 border-gray-300 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-300 bg-background">
            <h2 className="font-bold text-red-700 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4" /> In this Issue
            </h2>
            <p className="text-xs text-red-600/70">
              Posts appearing here are linked to this webzine.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-background">
            {loading ? (
              <div className="flex justify-center py-10"><Loader2 className="animate-spin text-red-200" /></div>
            ) : assignedPosts.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-lg">
                <p className="text-sm text-gray-400">No posts assigned yet.</p>
                <p className="text-xs text-gray-300 mt-1">Add posts from the left.</p>
              </div>
            ) : (
              assignedPosts.map(post => (
                <div
                  key={post._id}
                  className="flex items-center justify-between p-3 bg-red-50/10 border border-gray-300 rounded-lg hover:border-red-200 transition-all"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate pr-4">{post.title}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800">
                      {post.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(post)}
                    disabled={processingId === post._id}
                    className="flex-shrink-0 p-2 bg-amber-500 hover:bg-amber-700 text-white border border-gray-300 rounded-full transition-colors"
                  >
                    {processingId === post._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Minus className="w-4 h-4" />}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function WebzineArrangePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
      <ArrangeContent />
    </Suspense>
  );
}