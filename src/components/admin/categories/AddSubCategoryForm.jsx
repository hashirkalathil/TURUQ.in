// src/components/admin/categories/AddSubCategoryForm.jsx

import { useState, useMemo } from 'react';
import { useNotification } from '@/components/ui/notification/NotificationProvider';

const slugify = (text) => {
  return text.toString().toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export default function AddSubCategoryForm({ categories, onSubCategoryAdded, onClose }) {
  const { addNotification } = useNotification();
  const [parentCategory, setParentCategory] = useState('');
  const [subCategoryName, setSubCategoryName] = useState('');
  const [subCategorySlug, setSubCategorySlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const autoSlug = useMemo(() => slugify(subCategoryName), [subCategoryName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!parentCategory) {
      addNotification('error', 'Please select a Parent Category.');
      setIsSubmitting(false);
      return;
    }
    if (!subCategoryName.trim()) {
      addNotification('error', 'Sub-Category Name is required.');
      setIsSubmitting(false);
      return;
    }

    const payload = {
      name: subCategoryName,
      slug: (subCategorySlug || autoSlug) || undefined,
      description: description || undefined,
      parent_id: parentCategory,
    };

    try {
      const res = await fetch('/api/admin/subcategories', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create sub-category');
      }

      const created = await res.json();
      addNotification('success', `Sub-Category '${created.name}' created successfully!`);
      onSubCategoryAdded(created); // Call the callback to update parent state
      onClose(); // Close the modal
    } catch (err) {
      console.error(err);
      addNotification('error', err.message || 'Error creating sub-category');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <select
        name="parent_id"
        value={parentCategory}
        onChange={(e) => setParentCategory(e.target.value)}
        required
        className="border border-red-300 rounded-lg px-4 py-2 text-sm focus:ring-red-500 focus:border-red-500 transition"
      >
        <option value="">Select Parent Category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        name="name"
        placeholder="Sub-Category Name"
        value={subCategoryName}
        onChange={(e) => {
          setSubCategoryName(e.target.value);
          if (subCategorySlug === slugify(subCategoryName)) {
            setSubCategorySlug('');
          }
        }}
        required
        className="border border-red-300 rounded-lg px-4 py-2 text-sm placeholder:text-gray-400 focus:ring-red-500 focus:border-red-500 transition"
      />

      <input
        name="slug"
        placeholder={`Slug (Auto: ${autoSlug || 'sub-category-name'})`}
        value={subCategorySlug || autoSlug}
        onChange={(e) => {
          setSubCategorySlug(slugify(e.target.value));
        }}
        className="border border-red-300 rounded-lg px-4 py-2 text-sm focus:ring-red-500 focus:border-red-500 transition"
      />

      <textarea
        name="description"
        placeholder="Description (optional)"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border border-red-300 rounded-lg px-4 py-2 text-sm placeholder:text-gray-400 resize-y focus:ring-red-500 focus:border-red-500 transition"
      />

      <button
        type="submit"
        disabled={!subCategoryName.trim() || !parentCategory || isSubmitting}
        className={`rounded-lg py-2 mt-2 font-semibold transition-colors duration-200 shadow-md
            ${!subCategoryName.trim() || !parentCategory || isSubmitting
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
          }`}
      >
        {isSubmitting ? 'Adding...' : 'Add Sub Category'}
      </button>
    </form>
  );
}