// src/components/admin/posts/EditPostForm.jsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Save, X, Loader2, RotateCw, Plus } from "lucide-react";
import Select from "@/components/ui/select/Select";
import RichTextEditor from "../ui/text-editor/TextEditor";
import Modal from "@/components/admin/ui/modal/Modal";
import { AddAuthorForm } from "../authors/AddAuthorForm";

// Utils
import { slugify } from "@/utils/slugify";

// Sub-Components
import FeaturedImageSection from "./form-sections/FeaturedImageSection";
import ClassificationSection from "./form-sections/ClassificationSection";
import PermissionsSection from "./form-sections/PermissionsSection";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY;
const API_HEADERS = { "x-api-key": API_KEY };

const MAX_FILE_SIZE = 4 * 1024 * 1024;

const fetchPost = async (postId) => {
  const res = await fetch(`/api/admin/posts?id=${postId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to fetch post");
  }
  return res.json();
};

export default function EditPostForm({ postId, onPostUpdated, onCancel }) {
  // --- STATE MANAGEMENT ---
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [initialPostData, setInitialPostData] = useState(null);
  const [originalTitle, setOriginalTitle] = useState("");

  const [values, setValues] = useState({
    _id: postId,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author_id: "",
    category_ids: [],
    subcategory_ids: [],
    tags: "",
    status: "draft",
    featured_image: "",
    comments_enabled: true,
  });

  const [permissions, setPermissions] = useState({
    is_featured: false,
    is_premium: false,
    is_slide_article: false,
  });

  const [classificationMode, setClassificationMode] = useState("category");
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageError, setImageError] = useState("");

  // Data State (Raw Data)
  const [authors, setAuthors] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  // Form Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- DATA LOADING ---
  useEffect(() => {
    const loadData = async () => {
      setIsInitialLoading(true);
      try {
        // Fetch Post + All Dropdown Data
        const [postRes, authorsRes, catsRes, subcatsRes] = await Promise.all([
          fetchPost(postId),
          fetch("/api/admin/authors", { headers: API_HEADERS }),
          fetch("/api/admin/categories", { headers: API_HEADERS }),
          fetch("/api/admin/subcategories", { headers: API_HEADERS }),
        ]);

        const post = postRes.data;
        const authorsData = await authorsRes.json();
        const catsData = await catsRes.json();
        const subCatsData = await subcatsRes.json();

        // 1. Set Raw Data
        setAuthors(Array.isArray(authorsData.data) ? authorsData.data : []);
        setCategories(Array.isArray(catsData) ? catsData : []);
        setSubCategories(Array.isArray(subCatsData) ? subCatsData : []);

        // 2. Process Post Data for Form
        const authorId = post.author_id ? (post.author_id._id || post.author_id) : "";
        const catIds = Array.isArray(post.category_ids)
          ? post.category_ids.map(id => id._id || id)
          : [];
        const subcatIds = Array.isArray(post.subcategory_ids)
          ? post.subcategory_ids.map(id => id._id || id)
          : [];
        const formattedTags = Array.isArray(post.tags) ? post.tags.join(", ") : "";

        // 3. Determine Classification Mode based on existing data
        if (catIds.length > 0 && subcatIds.length > 0) {
          setClassificationMode('both');
        } else if (subcatIds.length > 0) {
          setClassificationMode('subcategory');
        } else {
          setClassificationMode('category'); // Default
        }

        // 4. Set Values
        setValues({
          _id: post._id,
          title: post.title || "",
          slug: post.slug || "",
          excerpt: post.excerpt || "",
          content: post.content || "",
          author_id: authorId,
          category_ids: catIds,
          subcategory_ids: subcatIds,
          tags: formattedTags,
          status: post.status || "draft",
          featured_image: post.featured_image || "",
          comments_enabled: post.comments_enabled ?? true,
        });

        // 5. Set Permissions
        if (post.permissions) {
          setPermissions({
            is_featured: post.permissions.is_featured || false,
            is_premium: post.permissions.is_premium || false,
            is_slide_article: post.permissions.is_slide_article || false,
          });
        }

        setOriginalTitle(post.title);
        setInitialPostData(post);

      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Failed to load post and form data");
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadData();
  }, [postId]);

  // --- DERIVED OPTIONS (Updated Logic) ---

  // 1. Identify Parent Category IDs (Categories that have subcategories)
  const parentCategoryIds = useMemo(() => {
    return new Set(subCategories.map((sub) => sub.parent_id));
  }, [subCategories]);

  // 2. Create Option List with ALL categories
  const allCategoryOptions = useMemo(() =>
    categories.map((c) => ({ label: c.name, value: c._id })),
    [categories]
  );

  // 3. Create Option List with ONLY Leaf categories (No parents)
  const leafCategoryOptions = useMemo(() =>
    categories
      .filter((c) => !parentCategoryIds.has(c._id))
      .map((c) => ({ label: c.name, value: c._id })),
    [categories, parentCategoryIds]
  );

  const subCategoryOptions = useMemo(() =>
    subCategories.map((s) => ({ label: s.name, value: s._id })),
    [subCategories]
  );

  const authorOptions = useMemo(() =>
    authors.map((a) => ({ label: a.name, value: a._id })),
    [authors]
  );

  useEffect(() => {
    const isSlugManuallyEdited = values.slug !== slugify(originalTitle);
    if (values.title && !isSlugManuallyEdited && values.title !== originalTitle) {
      setValues((s) => ({ ...s, slug: slugify(values.title) }));
    }
  }, [values.title, originalTitle, values.slug]);

  const handleRegenerateSlug = () => {
    if (values.title) {
      setValues((s) => ({ ...s, slug: slugify(values.title) }));
    }
  };

  const handleChange = (e) => {
    if (typeof e === "string") {
      setValues((s) => ({ ...s, content: e }));
      setError("");
      return;
    }
    const { name, value, type, checked } = e.target;
    setError("");

    if (name === 'slug') {
      setValues((s) => ({ ...s, [name]: slugify(value) }));
    } else {
      setValues((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setPermissions((prev) => ({ ...prev, [name]: checked }));
  };

  const handleModeChange = (mode) => {
    setClassificationMode(mode);
    setValues((prev) => ({
      ...prev,
      // If switching to subcategory only, clear categories
      category_ids: mode === "subcategory" ? [] : prev.category_ids,
      // If switching to category only, clear subcategories
      subcategory_ids: mode === "category" ? [] : prev.subcategory_ids,
    }));
  };

  // Image Handlers
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageError("");
      setValues((s) => ({ ...s, featured_image: "" }));
    } else {
      setSelectedFile(null);
    }
  };

  const uploadImage = useCallback(async (file) => {
    if (file.size > MAX_FILE_SIZE) {
      setImageError("File is too large. Max size is 4MB.");
      setValues((s) => ({ ...s, featured_image: initialPostData?.featured_image || "" }));
      return null;
    }

    setImageUploadLoading(true);
    setImageError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "turuq/posts");
      const res = await fetch("/api/admin/posts/imageUpload", {
        method: "POST",
        headers: API_HEADERS,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      return json.imageUrl;
    } catch (err) {
      setImageError(err.message);
      setValues((s) => ({ ...s, featured_image: initialPostData?.featured_image || "" }));
      return null;
    } finally {
      setImageUploadLoading(false);
    }
  }, [initialPostData]);

  const uploadInlineImage = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "turuq/posts");
      const res = await fetch("/api/admin/posts/inlineImageUpload", {
        method: "POST",
        headers: API_HEADERS,
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Inline upload failed");
      return json.imageUrl;
    } catch (err) {
      console.error(err);
      throw new Error(err.message || "Failed to upload inline image.");
    }
  }, []);

  // Select Handlers
  const handleSingleSelectChange = (name, newValue) => {
    setValues((s) => ({ ...s, [name]: newValue ? newValue.value : "" }));
  };

  const handleMultiSelectChange = (name, newValue) => {
    setValues((s) => ({ ...s, [name]: newValue.map((item) => item.value) }));
  };



  const handleAuthorAdded = (newAuthor) => {
    setAuthors((prev) => [...prev, newAuthor]);
    setValues((prev) => ({ ...prev, author_id: newAuthor._id }));
    setIsAuthorModalOpen(false);
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setImageError("");

    // Validation
    if (!values.title || !values.slug || !values.content || !values.author_id) {
      setError("Title, slug, Content, and Author are required.");
      setLoading(false);
      return;
    }

    if (classificationMode === "category" && values.category_ids.length === 0) {
      setError("Please select at least one Category.");
      setLoading(false);
      return;
    }
    if (classificationMode === "subcategory" && values.subcategory_ids.length === 0) {
      setError("Please select at least one Subcategory.");
      setLoading(false);
      return;
    }
    if (classificationMode === "both") {
      if (values.category_ids.length === 0 || values.subcategory_ids.length === 0) {
        setError("Both Category and Subcategory selections are required.");
        setLoading(false);
        return;
      }
    }

    const hasContent = values.content.replace(/<[^>]*>/g, "").trim().length > 0;
    if (!hasContent) {
      setError("Content must contain actual text.");
      setLoading(false);
      return;
    }

    // Image Upload
    let finalImageUrl = values.featured_image;
    if (selectedFile) {
      if (imageUploadLoading) {
        setLoading(false);
        return;
      }
      const url = await uploadImage(selectedFile);
      if (!url) {
        setLoading(false);
        return;
      }
      finalImageUrl = url;
    }

    const payload = {
      ...values,
      featured_image: finalImageUrl,
      author_id: values.author_id === "" ? null : values.author_id,
      tags: values.tags.split(",").map((t) => t.trim()).filter(Boolean),
      permissions: permissions,
      _id: postId, // Ensure ID is sent
    };

    try {
      const res = await fetch("/api/admin/posts", {
        method: "PUT",
        headers: { 
          ...API_HEADERS,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Update failed");

      onPostUpdated(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER HELPERS ---
  const currentAuthorValue = authorOptions.find((opt) => opt.value === values.author_id) || null;

  const statusOptions = [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Archived", value: "archived" },
  ];
  const currentStatusValue = statusOptions.find((opt) => opt.value === values.status) || null;

  const activeCategoryOptions = classificationMode === "category" ? leafCategoryOptions : allCategoryOptions;


  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-40 text-blue-600">
        <Loader2 className="w-6 h-6 mr-2 animate-spin" />
        Loading post data...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-sm bg-red-100 text-red-700 p-3 rounded border border-red-300">
          {error}
        </div>
      )}

      {/* 1. Featured Image */}
      <FeaturedImageSection
        featuredImage={values.featured_image}
        selectedFile={selectedFile}
        imageUploadLoading={imageUploadLoading}
        imageError={imageError}
        onFileChange={handleFileChange}
        onUrlChange={handleChange}
        onRemoveImage={() => {
          setSelectedFile(null);
          setValues((s) => ({ ...s, featured_image: "" }));
          setImageError("");
        }}
      />

      {/* 2. Basic Info (Title/Slug) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <input
            name="title"
            value={values.title}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug *</label>
          <div className="flex gap-2">
            <input
              name="slug"
              value={values.slug}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <button
              type="button"
              onClick={handleRegenerateSlug}
              title="Regenerate slug from current title"
              className="px-3 py-2 text-sm border rounded-md bg-gray-100 hover:bg-gray-200 transition flex items-center"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Excerpt */}
      <div>
        <label className="block text-sm font-medium mb-1">Excerpt</label>
        <textarea
          name="excerpt"
          value={values.excerpt}
          onChange={handleChange}
          rows={2}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* 4. Content */}
      <div>
        <label className="block text-sm font-medium mb-1">Content *</label>
        <RichTextEditor
          value={values.content}
          onChange={handleChange}
          onImageUpload={uploadInlineImage}
          plainTextOnly={true}
        />
      </div>

      {/* 5. Classification */}
      <ClassificationSection
        mode={classificationMode}
        onModeChange={handleModeChange}
        categoryOptions={activeCategoryOptions}
        subCategoryOptions={subCategoryOptions}
        selectedCategoryIds={values.category_ids}
        selectedSubCategoryIds={values.subcategory_ids}
        onCategoryChange={(val) => handleMultiSelectChange("category_ids", val)}
        onSubCategoryChange={(val) => handleMultiSelectChange("subcategory_ids", val)}
      />

      {/* 6. Author & Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Author *</label>
          <div className="flex gap-2">
            <div className="flex-grow">
              <Select
                options={authorOptions}
                value={currentAuthorValue}
                onChange={(val) => handleSingleSelectChange("author_id", val)}
                placeholder="Select an Author"
                isSearchable={true}
                isClearable={false}
              />
            </div>
            <button
              type="button"
              onClick={() => setIsAuthorModalOpen(true)}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 flex-shrink-0"
              title="Add New Author"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <Select
            options={statusOptions}
            value={currentStatusValue}
            onChange={(val) => handleSingleSelectChange("status", val)}
            placeholder="Select Status"
            isClearable={false}
          />
        </div>
      </div>

      {/* 7. Tags */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Tags (comma separated)
        </label>
        <input
          name="tags"
          value={values.tags}
          onChange={handleChange}
          placeholder="travel, food, morocco"
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        />
      </div>

      {/* 8. Permissions */}
      <div className="mb-20">
        <PermissionsSection
          permissions={permissions}
          commentsEnabled={values.comments_enabled}
          onPermissionChange={handlePermissionChange}
          onCommentsChange={handleChange}
        />
      </div>

      {/* 9. Action Buttons */}
      <div className="fixed bg-white right-12 left-5 bottom-14 flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || imageUploadLoading}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
        >
          <X className="inline w-4 h-4 mr-1" /> Cancel
        </button>

        <button
          type="submit"
          disabled={loading || imageUploadLoading}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-60 transition"
        >
          {loading ? (
            <>
              <Loader2 className="inline w-4 h-4 mr-1 animate-spin" /> Updating...
            </>
          ) : (
            <>
              <Save className="inline w-4 h-4 mr-1" /> Update Post
            </>
          )}
        </button>
      </div>

      {/* Add Author Modal */}
      <Modal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        title="Add New Author"
        className="max-w-2xl"
        closeOnOutsideClick={false}
      >
        <AddAuthorForm
          onAuthorAdded={handleAuthorAdded}
          onCancel={() => setIsAuthorModalOpen(false)}
        />
      </Modal>
    </form>
  );
}