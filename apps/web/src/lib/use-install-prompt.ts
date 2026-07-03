"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function detectIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches ||
    // iOS Safari's own flag, not part of the standard matchMedia API.
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Chrome/Edge/Android fire `beforeinstallprompt` when the PWA is installable and
 * let us trigger it programmatically later (the sidebar's "Instalar app" button).
 * iOS Safari never fires this event — there's no programmatic install there, only
 * the manual "Compartilhar > Adicionar à Tela de Início" flow, so callers should
 * show `isIos` as an instructional state instead of a clickable button.
 */
export function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsIos(detectIos());
    setIsStandalone(detectStandalone());

    function onPrompt(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }
    function onInstalled() {
      setDeferred(null);
      setIsStandalone(true);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }

  return {
    canInstall: !!deferred,
    promptInstall,
    isIos: isIos && !isStandalone,
    isStandalone,
  };
}
