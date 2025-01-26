"use client";

import { useEffect } from "react";

export function useParallaxScroll() {
  useEffect(() => {
    const updateScroll = () => {
      document.documentElement.style.setProperty(
        "--scroll-offset",
        `${window.scrollY}`
      );
    };

    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();

    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
}
