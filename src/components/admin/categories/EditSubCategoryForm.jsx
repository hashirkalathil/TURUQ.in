// src/components/admin/categories/EditSubCategoryForm.jsx

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

export default function EditSubCategoryForm({ subCategory, categories, onSubCategoryUpdated, onCancel }) {
    const { addNotification } = useNotification();
    
    // Initialize state
    const [parentCategory, setParentCategory] = useState(subCategory?.parent_id || '');
    const [subCategoryName, setSubCategoryName] = useState(subCategory?.name || '');
    const [subCategorySlug, setSubCategorySlug] = useState(subCategory?.slug || '');
    const [description, setDescription] = useState(subCategory?.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Update form fields if the passed subCategory prop changes
    useEffect(() => {
        if (subCategory) {
            setParentCategory(subCategory.parent_id || '');
            setSubCategoryName(subCategory.name || '');
            setSubCategorySlug(subCategory.slug || '');
            setDescription(subCategory.description || '');
        }
    }, [subCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!parentCategory) {
            addNotification('error', 'Parent Category is required.');
            setIsSubmitting(false);
            return;
        }

        if (!subCategoryName.trim()) {
            addNotification('error', 'Sub-Category Name is required.');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            id: subCategory._id, // Essential for identifying which doc to update
            parent_id: parentCategory,
            name: subCategoryName,
            slug: subCategorySlug || slugify(subCategoryName),
            description: description || undefined,
        };

        try {
            const res = await fetch('/api/admin/subcategories', {
                method: 'PUT',
                headers: {
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update sub-category');
            }

            const updated = await res.json();
            addNotification('success', `Sub-Category '${updated.name}' updated successfully!`);
            
            if (onSubCategoryUpdated) {
                onSubCategoryUpdated(updated);
            }
            if (onCancel) {
                onCancel();
            }

        } catch (err) {
            console.error(err);
            addNotification('error', err.message || 'Error updating sub-category');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Parent Category</label>
                <select
                    name="parent_id"
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                    required
                    className="w-full border border-red-300 rounded-lg px-4 py-2 text-sm focus:ring-red-500 focus:border-red-500 transition bg-background"
                >
                    <option value="">Select Parent Category</option>
                    {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase">Name</label>
                <input
                    name="name"
                    placeholder="Sub-Category Name"
                    value={subCategoryName}
                    onChange={(e) => {
                        const newName = e.target.value;
                        setSubCategoryName(newName);
                        // Auto-update slug if it matches the generated version of the OLD name
                        if (subCategorySlug === slugify(subCategory?.name) || subCategorySlug === '') {
                            setSubCategorySlug(slugify(newName));
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
                    value={subCategorySlug}
                    onChange={(e) => setSubCategorySlug(slugify(e.target.value))}
                    className="w-full border border-red-300 rounded-lg px-4 py-2 text-sm focus:ring-red-500 focus:border-red-500 transition"
                />
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
                    disabled={!subCategoryName.trim() || !parentCategory || isSubmitting}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors duration-200 shadow-md cursor-pointer
                ${!subCategoryName.trim() || !parentCategory || isSubmitting
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