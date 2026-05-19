// src/components/article/ViewCounter.jsx
"use client";

import { useEffect } from "react";

export default function ViewCounter({ slug }) {
  useEffect(() => {
    const viewKey = `viewed_${slug}`;
    const hasViewed = sessionStorage.getItem(viewKey);

    if (!hasViewed) {
      fetch("/api/articles/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then(() => {
            sessionStorage.setItem(viewKey, "true");
        })
        .catch((err) => console.error("View count error:", err));
    }
  }, [slug]);

  return null;
}