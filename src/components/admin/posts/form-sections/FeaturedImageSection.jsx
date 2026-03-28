// src/components/admin/posts/form-sections/FeaturedImageSection.jsx
import { Upload, X, Loader2 } from "lucide-react";
import Image from "next/image";

export default function FeaturedImageSection({
  featuredImage,
  selectedFile,
  imageUploadLoading,
  imageError,
  onFileChange,
  onUrlChange,
  onRemoveImage,
}) {
  const imagePreviewUrl = featuredImage
    ? featuredImage
    : selectedFile
    ? URL.createObjectURL(selectedFile)
    : null;

  return (
    <div className="border p-4 rounded-lg bg-background space-y-3">
      <label className="text-sm font-bold text-gray-700 mb-1 flex items-center">
        <Upload className="w-4 h-4 mr-2" /> Featured Image
      </label>

      {imageError && (
        <div className="text-xs bg-red-100 text-red-700 p-2 rounded border border-red-300">
          {imageError}
        </div>
      )}

      {imagePreviewUrl && (
        <div className="relative w-full max-w-sm h-40 overflow-hidden rounded-lg shadow-md border bg-background">
          <Image
            src={imagePreviewUrl}
            alt="Featured Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition z-10"
            aria-label="Remove Image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <input
        type="file"
        onChange={onFileChange}
        accept="image/*"
        disabled={imageUploadLoading || !!featuredImage}
        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
      />

      {imageUploadLoading && (
        <div className="flex items-center text-red-600 text-sm mt-1">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading to Cloudinary...
        </div>
      )}

      <input
        name="featured_image"
        value={featuredImage}
        onChange={onUrlChange}
        placeholder="Or enter image URL..."
        disabled={imageUploadLoading || !!selectedFile}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
      />
    </div>
  );
}