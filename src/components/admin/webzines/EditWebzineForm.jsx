// src/components/admin/webzines/EditWebzineForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { LoaderCircle, Save, X, Upload, Image as ImageIcon } from 'lucide-react';
import { slugify } from '@/utils/slugify';

export const EditWebzineForm = ({ webzineId, onWebzineUpdated, onCancel }) => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [error, setError] = useState('');

    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    useEffect(() => {
        if (!webzineId) {
            setLoading(false);
            return;
        }

        const fetchWebzineData = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/admin/webzines`, {
                    headers: { 'x-api-key': API_KEY_TO_SEND },
                });

                if (!res.ok) throw new Error(`Status: ${res.status}`);

                const jsonData = await res.json();
                const list = Array.isArray(jsonData) ? jsonData : (jsonData.data || []);
                const item = list.find(a => a._id === webzineId);

                if (item) {
                    const formattedDate = item.published_at
                        ? new Date(item.published_at).toISOString().split('T')[0]
                        : '';

                    setFormData({
                        ...item,
                        published_at: formattedDate
                    });
                } else {
                    setError('Webzine not found.');
                }

            } catch (err) {
                console.error('Fetch Webzine Data Error:', err.message);
                setError('Could not load webzine details.');
            } finally {
                setLoading(false);
            }
        };

        fetchWebzineData();
    }, [webzineId, API_KEY_TO_SEND]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newState = { ...prev, [name]: value };
            if (name === 'name') {
                newState.slug = slugify(value);
            }
            return newState;
        });
        setError('');
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("File size too large. Please upload an image under 5MB.");
            return;
        }

        setUploadingImage(true);
        setError("");

        const formDataUpload = new FormData();
        formDataUpload.append("file", file);

        try {
            const res = await fetch("/api/admin/posts/imageUpload", {
                method: "POST",
                headers: {
                    "x-api-key": API_KEY_TO_SEND,
                },
                body: formDataUpload,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Image upload failed");
            }

            setFormData((prev) => ({ ...prev, cover_image: data.imageUrl }));
        } catch (err) {
            console.error("Upload Error:", err);
            setError("Failed to upload image. Please try again.");
        } finally {
            setUploadingImage(false);
            e.target.value = null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!formData || !formData.name || !formData.slug) {
            setError('Name and Slug are required.');
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/admin/webzines', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY_TO_SEND,
                },
                body: JSON.stringify({ id: webzineId, ...formData }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Failed to update webzine');
            }

            onWebzineUpdated(result);

        } catch (err) {
            console.error('Update Webzine Error:', err.message);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center text-gray-500">
                <LoaderCircle className="w-6 h-6 animate-spin mr-2" /> Loading details...
            </div>
        );
    }

    if (error && !formData) {
        return <div className="p-8 text-sm text-red-700">Error: {error}</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
                    {error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Issue Name / Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData?.name || ''}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm"
                />
            </div>

            <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData?.slug || ''}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm bg-gray-50"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={formData?.status || 'draft'}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm"
                    >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="published_at" className="block text-sm font-medium text-gray-700">Published Date</label>
                    <input
                        type="date"
                        id="published_at"
                        name="published_at"
                        value={formData?.published_at || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm"
                    />
                </div>
            </div>

            {/* --- IMAGE UPLOAD SECTION --- */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>

                <div className="flex items-start space-x-4">
                    <div className="w-24 h-32 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center overflow-hidden relative flex-shrink-0">
                        {formData.cover_image ? (
                            <Image
                                unoptimized={true}
                                src={formData.cover_image}
                                alt="Preview"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                        {uploadingImage && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <LoaderCircle className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150">
                                <Upload className="w-4 h-4 mr-2" />
                                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={uploadingImage}
                                />
                            </label>

                            {formData.cover_image && (
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, cover_image: '' }))}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Recommended size: 600x800px. Max size: 5MB. Formats: JPG, PNG, WebP.
                        </p>
                        <input
                            type="text"
                            name="cover_image"
                            value={formData.cover_image || ''}
                            onChange={handleChange}
                            placeholder="Or paste image URL..."
                            className="mt-2 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-xs text-gray-600"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    id="description"
                    name="description"
                    value={formData?.description || ''}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm"
                />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting || uploadingImage}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    <X className="w-4 h-4 mr-1" /> Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting || uploadingImage}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {submitting ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {submitting ? 'Updating...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}