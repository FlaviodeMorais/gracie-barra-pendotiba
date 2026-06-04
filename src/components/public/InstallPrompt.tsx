"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Already dismissed this session
    if (sessionStorage.getItem("pwa-prompt-dismissed")) return;

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // iOS detection
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const safari = /safari/i.test(ua) && !/chrome/i.test(ua);
    if (ios && safari) {
      setIsIOS(true);
      // Show iOS instructions after a short delay
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Desktop — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setShow(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
  };

  if (!show || isInstalled || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 shadow-2xl shadow-black/50">
        <div className="flex items-start gap-3 mb-3">
          <Image
            src="/icons/icon-72x72.png"
            alt="GB Pendotiba"
            width={48}
            height={48}
            className="rounded-xl border border-gray-700 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm leading-tight">GB Pendotiba</p>
            <p className="text-gray-400 text-xs leading-snug mt-0.5">
              Instale o app para acesso rápido, horários e eventos offline
            </p>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-gray-600 hover:text-gray-400 p-1 flex-shrink-0"
            aria-label="Fechar"
          >
            <svg width="16" height="16" className="block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isIOS ? (
          <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-300 space-y-2">
            <p className="font-semibold text-white">Para instalar no iPhone/iPad:</p>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 rounded px-1.5 py-0.5 text-white text-xs font-bold">1</span>
              <span>Toque no ícone de compartilhar</span>
              <svg width="16" height="16" className="block text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 rounded px-1.5 py-0.5 text-white text-xs font-bold">2</span>
              <span>Selecione <strong className="text-white">&quot;Adicionar à Tela Inicial&quot;</strong></span>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleInstall}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" className="block" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Instalar App
          </button>
        )}
      </div>
    </div>
  );
}
