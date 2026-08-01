"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // PWA desativado por ora (cache-first prendia páginas antigas em produção).
    // Remove qualquer SW/cache que tenha ficado de antes, em qualquer ambiente.
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((reg) => reg.unregister());
    });
    if ("caches" in window) {
      caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    }
  }, []);

  return null;
}
