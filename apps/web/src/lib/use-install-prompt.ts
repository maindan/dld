"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Chrome/Edge/Android fire `beforeinstallprompt` when the PWA is installable and
 * let us trigger it programmatically later (the sidebar's "Instalar app" button).
 * iOS Safari never fires this event — there's no programmatic install there, only
 * the manual "Share > Add to Home Screen" flow, which is a documented limitation.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function promptInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return { canInstall: !!deferred, promptInstall };
}
