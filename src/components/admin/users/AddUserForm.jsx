// src/components/admin/users/AddUserForm.jsx

'use client';

import React, { useState } from 'react';
import { LoaderCircle, Save, X } from 'lucide-react';

export const AddUserForm = ({ onUserAdded, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        phone: '',
        role: 'user',
        status: 'active',
        bio: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error on change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation for required fields based on User.js model
        if (!formData.name || !formData.username || !formData.email || !formData.password) {
            setError('Name, Username, Email, and Password are required.');
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Pass the API key for authentication
                    'x-api-key': API_KEY_TO_SEND,
                },
                body: JSON.stringify(formData),
            });

            const result = await res.json();

            if (!res.ok) {
                // Handle API error messages (e.g., 409 Conflict, 400 Validation)
                throw new Error(result.message || `Failed to add user (Status: ${res.status})`);
            }

            // Success! Call the parent handler to update the table data
            onUserAdded(result);

        } catch (err) {
            console.error('Add User Error:', err.message);
            setError(err.message || 'An unknown error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {error && (
                <div className="p-3 text-sm text-red-700 bg-red-100 border border-red-300 rounded">
                    {error}
                </div>
            )}

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>

            {/* Username */}
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>

            {/* Phone (Optional) */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                </label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>

            {/* Role selection */}
            <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role <span className="text-red-500">*</span>
                </label>
                <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm bg-background"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Biography/Bio (Optional) */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                </label>
                <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="2"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-red-500 focus:ring-red-500 text-sm"
                />
            </div>


            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md shadow-sm hover:bg-gray-300 transition-colors"
                >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {loading ? (
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {loading ? 'Adding User...' : 'Add User'}
                </button>
            </div>
        </form>
    );
}