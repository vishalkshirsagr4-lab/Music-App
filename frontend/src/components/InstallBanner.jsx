import { useState, useEffect } from "react";

export default function InstallBanner() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);

    setIsIOS(isIOSDevice);

    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true
    ) {
      setIsInstalled(true);
      return;
    }

    // Check dismiss time
    const dismissed = localStorage.getItem("install-banner-dismissed");
    if (dismissed) {
      const diff =
        (new Date() - new Date(dismissed)) / (1000 * 60 * 60 * 24);
      if (diff < 7) return;
    }

    let promptEvent = null;

    const beforeInstallHandler = (e) => {
      e.preventDefault();
      promptEvent = e;
      setInstallPrompt(e);

      // Show after delay (better UX)
      setTimeout(() => setIsVisible(true), 3000);
    };

    const appInstalledHandler = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("appinstalled", appInstalledHandler);

    // If the install prompt was captured before the banner mounted,
    // use the saved deferred prompt and show the banner.
    if (window.deferredInstallPrompt) {
      setInstallPrompt(window.deferredInstallPrompt);
      setTimeout(() => setIsVisible(true), 3000);
    }

    // iOS fallback (no beforeinstallprompt support)
    if (isIOSDevice && !window.navigator.standalone) {
      setTimeout(() => setIsVisible(true), 3000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === "accepted") {
      setIsVisible(false);
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(
      "install-banner-dismissed",
      new Date().toISOString()
    );
  };

  if (isInstalled || !isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-gradient-to-r from-[#1db954] to-[#1ed760] text-black shadow-lg animate-slideDown">
      <div className="max-w-full sm:max-w-4xl md:max-w-6xl lg:max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-black/10 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>

          <div className="min-w-0">
            <p className="font-bold text-sm sm:text-base truncate">
              Install Music App
            </p>

            {/* Dynamic text */}
            <p className="text-xs sm:text-sm text-black/70 truncate">
              {isIOS
                ? "Tap Share → Add to Home Screen"
                : installPrompt
                ? "Add to home screen for best experience"
                : "Install this app when the prompt appears"}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && (
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-black text-white text-sm font-bold rounded-full hover:bg-black/80 transition"
            >
              Install
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-black/10 rounded-full transition"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}