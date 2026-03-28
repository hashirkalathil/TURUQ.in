// src/app/loading.js

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-9999">
      <h1 className="text-6xl text-red-700 font-bold font-oswald animate-pulse">
        TURUQ
      </h1>
    </div>
  );
}