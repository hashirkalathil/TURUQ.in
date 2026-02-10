// src/components/admin/authors/EditAuthorForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { LoaderCircle, Save, X } from 'lucide-react';
import ImageUploadBox from "../ui/ImageUploadBox";

// --- MALAYALAM SLUGIFY LOGIC (Synced with AddAuthorForm) ---
const MALAYALAM_MAP = {
    'അ': 'a', 'ആ': 'aa', 'ഇ': 'i', 'ഈ': 'ee', 'ഉ': 'u', 'ഊ': 'oo',
    'ഋ': 'ru', 'എ': 'e', 'ഏ': 'e', 'ഐ': 'ai', 'ഒ': 'o', 'ഓ': 'o', 'ഔ': 'au',
    'ക': 'ka', 'ഖ': 'kha', 'ഗ': 'ga', 'ഘ': 'gha', 'ങ': 'nga',
    'ച': 'cha', 'ഛ': 'chha', 'ജ': 'ja', 'ഝ': 'jha', 'ഞ': 'nja',
    'ട': 'ta', 'ഠ': 'tha', 'ഡ': 'da', 'ഢ': 'dha', 'ണ': 'na',
    'ത': 'ta', 'ഥ': 'tha', 'ദ': 'da', 'ധ': 'dha', 'ന': 'na',
    'പ': 'pa', 'ഫ': 'pha', 'ബ': 'ba', 'ഭ': 'bha', 'മ': 'ma',
    'യ': 'ya', 'ര': 'ra', 'ല': 'la', 'വ': 'va',
    'ശ': 'sha', 'ഷ': 'sha', 'സ': 'sa', 'ഹ': 'ha',
    'ള': 'la', 'ഴ': 'zha', 'റ': 'ra',
    'ൺ': 'n', 'ൻ': 'n', 'ർ': 'r', 'ൽ': 'l', 'ൾ': 'l', 'ൿ': 'k',
    'ാ': 'aa', 'ി': 'i', 'ീ': 'ee', 'ു': 'u', 'ൂ': 'oo',
    'ൃ': 'ru', 'െ': 'e', 'േ': 'e', 'ൈ': 'ai',
    'ൊ': 'o', 'ോ': 'o', 'ൗ': 'au', 'ൌ': 'au',
    'ം': 'm', 'ഃ': 'h', '്': '',
    '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4',
    '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9'
};
const CONSONANTS = new Set(['ക', 'ഖ', 'ഗ', 'ഘ', 'ങ', 'ച', 'ഛ', 'ജ', 'ഝ', 'ഞ', 'ട', 'ഠ', 'ഡ', 'ഢ', 'ണ', 'ത', 'ഥ', 'ദ', 'ധ', 'ന', 'പ', 'ഫ', 'ബ', 'ഭ', 'മ', 'യ', 'ര', 'ല', 'വ', 'ശ', 'ഷ', 'സ', 'ഹ', 'ള', 'ഴ', 'റ']);
const VOWEL_SIGNS = new Set(['ാ', 'ി', 'ീ', 'ു', 'ൂ', 'ൃ', 'െ', 'േ', 'ൈ', 'ൊ', 'ോ', 'ൗ', 'ൌ']);
const VIRAMA = '്';

const slugify = (text) => {
    if (!text) return '';
    const normalized = text.toString().toLowerCase();
    let result = '';

    for (let i = 0; i < normalized.length; i++) {
        const char = normalized[i];
        const nextChar = normalized[i + 1];
        if (CONSONANTS.has(char)) {
            const baseConsonant = MALAYALAM_MAP[char];
            if (nextChar === VIRAMA) {
                result += baseConsonant.slice(0, -1);
                i++; continue;
            }
            if (VOWEL_SIGNS.has(nextChar)) {
                result += baseConsonant.slice(0, -1) + MALAYALAM_MAP[nextChar];
                i++; continue;
            }
            result += baseConsonant;
        } else if (MALAYALAM_MAP[char] !== undefined) {
            result += MALAYALAM_MAP[char];
        } else {
            result += char;
        }
    }
    return result.trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+|-+$/g, '');
};

export const EditAuthorForm = ({ authorId, onAuthorUpdated, onCancel }) => {
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    // 1. Fetch current author data on load
    useEffect(() => {
        if (!authorId) {
            setLoading(false);
            return;
        }

        const fetchAuthorData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch the list of authors
                const res = await fetch(`/api/admin/authors`, {
                    headers: { 'x-api-key': API_KEY_TO_SEND },
                });

                if (!res.ok) throw new Error(`Status: ${res.status}`);

                const jsonData = await res.json();

                // FIX: API returns { data: [...] }, so we extract the array
                const authorsList = jsonData.data || [];

                // Find the specific author from the list
                const author = authorsList.find(a => a._id === authorId);

                if (author) {
                    setFormData(author);
                } else {
                    setError('Author not found.');
                }

            } catch (err) {
                console.error('Fetch Author Data Error:', err.message);
                setError('Could not load author details.');
            } finally {
                setLoading(false);
            }
        };

        fetchAuthorData();
    }, [authorId, API_KEY_TO_SEND]);

    // Handle input changes
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

    // 2. Handle PUT request
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!formData || !formData.name || !formData.email || !formData.slug) {
            setError('Name, Email, and Slug are required.');
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch('/api/admin/authors', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY_TO_SEND,
                },
                body: JSON.stringify({ _id: authorId, ...formData }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || 'Failed to update author');
            }

            onAuthorUpdated(result);

        } catch (err) {
            console.error('Update Author Error:', err.message);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // UI rendering
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Author Avatar</label>
                <ImageUploadBox
                    onUpload={(url) => setFormData(prev => ({ ...prev, avatar: url }))}
                    folder="turuq/authors"
                    filename={formData?.slug}
                    existingImage={formData?.avatar}
                    label="Profile Photo"
                />
            </div>

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Author Name <span className="text-red-500">*</span>
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData?.email || ''}
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

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData?.phone || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm"
                />
            </div>

            <div>
                <label htmlFor="biography" className="block text-sm font-medium text-gray-700">Biography</label>
                <textarea
                    id="biography"
                    name="biography"
                    value={formData?.biography || ''}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 text-sm"
                />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    <X className="w-4 h-4 mr-1" /> Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                    {submitting ? <LoaderCircle className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {submitting ? 'Updating...' : 'Save Changes'}
                </button>
            </div>
        </form>
    );
}