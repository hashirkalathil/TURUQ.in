import Link from "next/link";

const CategoryTag = ({ link, children, className = "", linkClassName = "" }) => {
  // Ensure we always have a valid href
  const href = link && typeof link === 'string' ? link : '#';
  
  return (
    <span className={`tag flex cursor-pointer select-none rounded-md border px-3 py-0.5 border-black font-medium leading-relaxed tracking-normal text-black transition-colors hover:bg-red-600 hover:text-white ${className}`}>
      <Link className={`${linkClassName} text-[11px] font-poppins`} href={href}>
        {children}
      </Link>
    </span>
  );
};

export default CategoryTag;