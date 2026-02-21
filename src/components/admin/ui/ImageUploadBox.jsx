import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';

export default function ImageUploadBox({
    onUpload,
    folder = 'turuq/uploads',
    filename = null,
    existingImage = null,
    label = "Upload Image",
}) {
    const [image, setImage] = useState(existingImage);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (JPG, PNG, WEBP).');
            return;
        }

        // specific check for filename dependency if provided
        if (filename === null && folder.includes('authors')) {
            // if we are uploading for an author but don't have a slug yet, standard warning?
            // Actually user logic might differ, but generally we need a filename if strict naming is required.
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);
        if (filename) formData.append('public_id', filename);

        const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

        try {
            const res = await fetch('/api/admin/posts/imageUpload', {
                method: 'POST',
                headers: {
                    'x-api-key': API_KEY,
                },
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setImage(data.imageUrl);
            onUpload(data.imageUrl);
        } catch (err) {
            console.error(err);
            setError(err.message || 'Error uploading image');
        } finally {
            setUploading(false);
            // Reset input value so same file can be selected again if needed
            e.target.value = '';
        }
    };

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setImage(null);
        onUpload(null);
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">{label}</label>

            <div className="relative group">
                {image ? (
                    <div className="relative w-full h-48 bg-gray-50 border-2 border-dashed border-green-300 rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                            unoptimized={true}
                            src={image}
                            alt="Uploaded preview"
                            fill
                            className="object-contain"
                        />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="cursor-pointer p-2 bg-white/90 rounded-full hover:bg-white text-gray-700 transition-transform hover:scale-105">
                                <Upload className="w-5 h-5" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                            <button
                                onClick={handleRemove}
                                className="p-2 bg-red-500/90 rounded-full hover:bg-red-600 text-white transition-transform hover:scale-105"
                                type="button"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white z-10">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <span className="text-xs font-medium">Updating...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <label className={`
            flex flex-col items-center justify-center w-full h-32 
            border-2 border-dashed rounded-lg cursor-pointer 
            transition-colors duration-200
            ${uploading ? 'bg-gray-50 border-gray-300' : 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-red-400'}
          `}>
                        {uploading ? (
                            <>
                                <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-2" />
                                <span className="text-xs text-gray-500">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-red-50 rounded-full mb-2 group-hover:bg-red-100 transition-colors">
                                    <ImageIcon className="w-6 h-6 text-red-500" />
                                </div>
                                <p className="text-sm text-gray-500 font-medium">Click to upload</p>
                                <p className="text-xs text-gray-400 mt-1">SVG, PNG, JPG or WEBP</p>
                            </>
                        )}
                        <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={uploading}
                        />
                    </label>
                )}
            </div>

            {error && (
                <p className="text-xs text-red-500 flex items-center mt-1">
                    <X className="w-3 h-3 mr-1" />
                    {error}
                </p>
            )}

            {filename && (
                <p className="text-[10px] text-gray-400 text-right">
                    Will be saved as: <span className="font-mono">{filename}</span>
                </p>
            )}
        </div>
    );
}
