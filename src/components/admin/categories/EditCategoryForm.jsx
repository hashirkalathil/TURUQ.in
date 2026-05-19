// src/components/admin/categories/EditCategoryForm.jsx

import { useState, useEffect } from 'react';
import { useNotification } from '@/components/ui/notification/NotificationProvider';

const slugify = (text) => {
    if (!text) return '';
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export default function EditCategoryForm({ category, onCategoryUpdated, onCancel }) {
    const { addNotification } = useNotification();
    
    // Initialize state. We use useEffect below to update if the 'category' prop changes
    const [categoryName, setCategoryName] = useState(category?.name || '');
    const [categorySlug, setCategorySlug] = useState(category?.slug || '');
    const [description, setDescription] = useState(category?.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form fields when the passed category changes
    useEffect(() => {
        if (category) {
            setCategoryName(category.name || '');
            setCategorySlug(category.slug || '');
            setDescription(category.description || '');
        }
    }, [category]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!categoryName.trim()) {
            addNotification('error', 'Category Name is required.');
            setIsSubmitting(false);
            return;
        }

        // Payload includes the ID to identify which document to update
        const payload = {
            id: category._id, 
            name: categoryName,
            slug: categorySlug || slugify(categoryName),
            description: description || undefined,
        };

        try {
            // Note: This assumes you will add a PUT handler to your route.js
            const res = await fetch('/api/admin/categories', {
                method: 'PUT',
                headers: {
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update category');
            }

            const updatedCategory = await res.json();
            
            addNotification('success', `Category '${updatedCategory.name}' updated successfully!`);
            
            // Callback to update parent state (Table)
            if (onCategoryUpdated) {
                onCategoryUpdated(updatedCategory);
            }
            
            // Close modal
            if (typeof onCancel === 'function') {
                onCancel();
            }

        } catch (err) {
            console.error(err);
            addNotification('error', err.message || 'Error updating category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Name</label>
                <input
                    name="name"
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(e) => {
                        const newName = e.target.value;
                        setCategoryName(newName);
                        
                        // Optional: Auto-update slug if the user hasn't manually customized it drastically
                        // Or simply leave it alone to preserve SEO. 
                        // Here we only update slug if the current slug looks like a slugified version of the OLD name
                        if (categorySlug === slugify(category?.name) || categorySlug === '') {
                             setCategorySlug(slugify(newName));
                        }
                    }}
                    required
                    className="w-full border border-red-300 rounded-lg px-4 py-2 text-sm placeholder:text-gray-400 focus:ring-red-600 focus:border-red-600 transition-all"
                />
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Slug</label>
                <input
                    name="slug"
                    placeholder="slug-goes-here"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(slugify(e.target.value))}
                    className="w-full border border-red-300 rounded-lg px-4 py-2 text-sm focus:ring-red-500 focus:border-red-500 transition"
                />
                <p className="text-xs text-gray-400 mt-1">Changing the slug may affect SEO links.</p>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Description</label>
                <textarea
                    name="description"
                    placeholder="Description (optional)"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-red-300 rounded-lg px-4 py-2 text-sm placeholder:text-gray-400 resize-y focus:ring-red-500 focus:border-red-500 transition"
                />
            </div>

            <div className="flex gap-3 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="flex-1 rounded-lg py-2 text-sm font-semibold text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={!categoryName.trim() || isSubmitting}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-200 shadow-md cursor-pointer
                    ${!categoryName.trim() || isSubmitting
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                    }`}
                >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}