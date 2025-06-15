
import { useEffect } from "react";
import { logFirebaseEvent } from "@/lib/firebase";

/**
 * useAnalytics hook
 *
 * - Tracks page views on route change
 * - Tracks delegated click events on <button>, <a>, and [role=button]
 * - Exposes a logEvent utility for custom event logging
 */
export function useAnalytics({ pageTitle }: { pageTitle?: string } = {}) {
  // Page view tracking
  useEffect(() => {
    logFirebaseEvent("page_view", {
      page_path: window?.location?.pathname,
      page_title: pageTitle ?? document.title,
    });
  }, [pageTitle, window?.location?.pathname]);

  // Global click event tracking
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Find closest button, role=button, or anchor
      const btn = target.closest("button, [role=button], a") as HTMLElement | null;
      if (btn) {
        const label =
          btn.getAttribute("aria-label") ||
          btn.textContent?.trim() ||
          btn.getAttribute("href") ||
          "unknown";
        const eventType = btn.tagName === "A" ? "link_click" : "button_click";
        logFirebaseEvent(eventType, {
          label,
          pathname: window.location.pathname,
        });
      }
    };
    window.addEventListener("click", handleClick, true);
    return () => window.removeEventListener("click", handleClick, true);
  }, []);

  // Utility for custom analytics events
  return {
    logEvent: logFirebaseEvent,
  };
}
