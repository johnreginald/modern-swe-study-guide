"use client";

import { useEffect, useState } from "react";

const KEY = "aeguide.installHintDismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** Inline (non-fixed) install card. Shown on the Home page only, dismissable, never overlaps navigation. */
export default function InstallHint() {
  const [visible, setVisible] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(KEY)) return;
    } catch {
      // ignore
    }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIos(ios);
    if (ios) setVisible(true);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible) return null;

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(KEY, "1");
    } catch {
      // ignore
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    dismiss();
  }

  return (
    <div className="install-card" role="status">
      <div>
        <strong>Install as an app</strong>
        <div className="muted small">
          {isIos ? "Tap Share, then “Add to Home Screen”. Works offline afterwards." : "Add it to your home screen. Works offline afterwards."}
        </div>
      </div>
      <div className="install-actions">
        {deferred ? (
          <button type="button" className="btn btn-primary" onClick={install}>
            Install
          </button>
        ) : null}
        <button type="button" className="btn btn-ghost" onClick={dismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
