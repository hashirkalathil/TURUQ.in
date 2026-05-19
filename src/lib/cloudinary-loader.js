// lib/cloudinary-loader.js (Optimized)
export default function cloudinaryLoader({ src, width, quality }) {
  // src is already a full cloudinary url
  const parts = src.split("/upload/");

  // 1. Add f_auto (format auto) and q_auto (quality auto) for best performance
  const defaultTransforms = ["f_auto", "q_auto:best"];

  // 2. Add width transformation provided by Next.js
  const widthTransform = `w_${width}`;

  // 3. Optional: Use Next.js quality if specified, otherwise rely on q_auto:best
  // We keep q_auto:best as the primary optimization

  const transforms = [
    ...defaultTransforms,
    widthTransform,
    "c_limit", // ensure image is resized without cropping aggressively
  ].join(",");

  // The transformations go between /upload/ and the image version/public ID
  return `${parts[0]}/upload/${transforms}/${parts[1]}`;
}
