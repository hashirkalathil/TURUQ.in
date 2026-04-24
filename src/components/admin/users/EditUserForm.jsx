// src/components/admin/users/EditUserForm.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { LoaderCircle, Save, X } from 'lucide-react';

export const EditUserForm = ({ userId, onUserUpdated, onCancel }) => {
    // Initial state set to null to indicate data hasn't been fetched yet
    const [formData, setFormData] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const API_KEY_TO_SEND = process.env.NEXT_PUBLIC_API_KEY;

    // 1. Fetch current user data on load
    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchUserData = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await fetch(`/api/admin/users?id=${userId}`, {
                    headers: { 'x-api-key': API_KEY_TO_SEND },
                });

                if (!res.ok) {
                    throw new Error(`Failed to fetch user data (Status: ${res.status})`);
                }

                const json = await res.json();

                // Extract data from the wrapped 'data' field
                const userData = json.data || json; 

                // If userData is an array, take the first element
                const finalUserData = Array.isArray(userData) ? userData[0] : userData;

                if (!finalUserData) {
                    throw new Error("User data not found in response.");
                }

                setFormData({
                    ...finalUserData,
                    password: '', 
                });

            } catch (err) {
                console.error('Fetch User Data Error:', err.message);
                setError(err.message || 'Could not load user details.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [userId, API_KEY_TO_SEND]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    // 2. Handle PUT request for update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (!formData || !formData.name || !formData.username || !formData.email) {
            setError('Name, Username, and Email are required.');
            setSubmitting(false);
            return;
        }

        // Prepare data: only send the password field if it was actually changed/entered
        const dataToSend = { ...formData };
        if (dataToSend.password === '') {
            delete dataToSend.password;
        }

        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY_TO_SEND,
                },
                body: JSON.stringify({ _id: userId, ...dataToSend }),
            });

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || `Failed to update user (Status: ${res.status})`);
            }

            // Success! Call the parent handler to update the table data and close the modal
            // We pass the result, but manually clear the password field before updating state
            onUserUpdated({ ...result, password: '' }); 

        } catch (err) {
            console.error('Update User Error:', err.message);
            setError(err.message || 'An unknown error occurred during submission.');
        } finally {
            setSubmitting(false);
        }
    };

    // UI rendering based on state
    if (loading) {
        return (
            <div className="p-8 flex justify-center items-center text-gray-500">
                <LoaderCircle className="w-6 h-6 animate-spin mr-2" /> Loading details...
            </div>
        );
    }

    if (error && !formData) {
        return (
            <div className="p-8 text-sm text-red-700">
                Error: {error}
            </div>
        );
    }

    // Main form render
    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Display error message */}
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
                    value={formData?.name || ''}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-green-500 focus:ring-green-500 text-sm"
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
                    value={formData?.username || ''}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-green-500 focus:ring-green-500 text-sm"
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
                    value={formData?.email || ''}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-green-500 focus:ring-green-500 text-sm"
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
                    value={formData?.role || 'user'}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-green-500 focus:ring-green-500 text-sm bg-background"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>

            {/* Password (Optional update) */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password (Leave blank to keep existing)
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData?.password || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-green-500 focus:ring-green-500 text-sm"
                    placeholder="Enter new password to reset"
                />
            </div>
            
            {/* Phone */}
            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData?.phone || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-green-500 focus:ring-green-500 text-sm"
                />
            </div>

            {/* Bio */}
            <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                    id="bio"
                    name="bio"
                    value={formData?.bio || ''}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-green-500 focus:ring-green-500 text-sm"
                />
            </div>
            
            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={submitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md shadow-sm hover:bg-gray-300 transition-colors"
                >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {submitting ? (
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {submitting ? 'Updating...' : 'Save Changes'}
                    
                </button>
            </div>
        </form>
    );
}