"use client";

import { useEffect } from "react";

/**
 * Scrubs ?token= query parameter from browser address bar and history
 * immediately upon successful receipt verification.
 * 
 * Protects against token exposure through:
 * 1. Browser navigation history and bookmarks
 * 2. Shoulder surfing / screen sharing
 * 3. Copy-pasting / link sharing
 * 4. HTTP Referer headers when clicking external outbound links
 * 5. Third-party client-side analytics capturing location.search or href
 */
export default function OrderReceiptUrlScrubber() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.search.includes("token=")) {
      // Retain the clean pathname while scrubbing sensitive query tokens
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, []);

  return null;
}
