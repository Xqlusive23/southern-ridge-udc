"use client";

import { useEffect } from "react";

type SmartsuppFn = ((...args: unknown[]) => void) & { _: unknown[] };

declare global {
  interface Window {
    _smartsupp?: { key?: string };
    smartsupp?: SmartsuppFn;
  }
}

export function SmartsuppChat({
  chatKey,
  name,
  email,
}: {
  chatKey: string;
  name?: string;
  email?: string;
}) {
  useEffect(() => {
    if (!chatKey) return;

    window._smartsupp = window._smartsupp || {};
    window._smartsupp.key = chatKey;

    if (!window.smartsupp) {
      const queue: unknown[] = [];
      const api = ((...args: unknown[]) => {
        queue.push(args);
      }) as SmartsuppFn;
      api._ = queue;
      window.smartsupp = api;
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.async = true;
      script.charset = "utf-8";
      script.src = "https://www.smartsuppchat.com/loader.js?";
      const first = document.getElementsByTagName("script")[0];
      first?.parentNode?.insertBefore(script, first);
    }

    if (name) window.smartsupp?.("name", name);
    if (email) window.smartsupp?.("email", email);
  }, [chatKey, name, email]);

  return null;
}
