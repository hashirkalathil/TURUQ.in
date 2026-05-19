// src/components/admin/categories/AddCategoryForm.jsx


import { useState, useMemo } from 'react';
import { useNotification } from '@/components/ui/notification/NotificationProvider';

const slugify = (text) => {
    return text.toString().toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
};

export default function AddCategoryForm({ onCategoryAdded, onClose }) {
    const { addNotification } = useNotification();
    const [categoryName, setCategoryName] = useState('');
    const [categorySlug, setCategorySlug] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const autoSlug = useMemo(() => slugify(categoryName), [categoryName]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        if (!categoryName.trim()) {
            addNotification('error', 'Category Name is required.');
            setIsSubmitting(false);
            return;
        }

        const payload = {
            name: categoryName,
            slug: (categorySlug || autoSlug) || undefined,
            description: description || undefined,
        };

        try {
            const res = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: {
                    'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to create category');
            }

            const created = await res.json();
            addNotification('success', `Category '${created.name}' created successfully!`);
            onCategoryAdded(created); // Call the callback to update parent state
            if (typeof onClose === 'function') {
                onClose(); // Close the modal
            }
        } catch (err) {
            console.error(err);
            addNotification('error', err.message || 'Error creating category');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
                name="name"
                placeholder="Category Name"
                value={categoryName}
                onChange={(e) => {
                    setCategoryName(e.target.value);
                    if (categorySlug === slugify(categoryName)) {
                        setCategorySlug('');
                    }
                }}
                required
                className="border border-red-300 rounded-lg px-4 py-2 text-sm placeholder:text-gray-400 focus:ring-red-600 focus:border-red-600 transition-all"
            />

            <input
                name="slug"
                placeholder={`Slug (Auto: ${autoSlug || 'category-name'})`}
                value={categorySlug || autoSlug}
                onChange={(e) => {
                    setCategorySlug(slugify(e.target.value));
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
                disabled={!categoryName.trim() || isSubmitting}
                className={`rounded-lg py-2 mt-2 font-semibold transition-colors duration-200 shadow-md cursor-pointer
            ${!categoryName.trim() || isSubmitting
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
                    }`}
            >
                {isSubmitting ? 'Adding...' : 'Add Category'}
            </button>
        </form>
    );
}