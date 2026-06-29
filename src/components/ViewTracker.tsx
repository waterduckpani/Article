"use client";
import { useEffect, useRef } from "react";

// Records one view per article per browser-tab session, so a refresh or a
// back-and-forth within the same session doesn't inflate the count.
export function ViewTracker({ articleId }: { articleId: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return; // guard React strict-mode double-invoke
    fired.current = true;

    const key = `article:viewed:${articleId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage unavailable — still count the view.
    }

    fetch(`/api/articles/${articleId}/view`, {
      method: "POST",
      keepalive: true,
    }).catch(() => {});
  }, [articleId]);

  return null;
}
