"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

const KEY = "aeguide.lang";

/** Sets <html lang>, remembers the chosen language, and sends returning Burmese readers from "/" to "/my". */
export default function LangEffect({ burmeseAvailable }: { burmeseAvailable: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const isMy = pathname === "/my" || pathname.startsWith("/my/");

  useEffect(() => {
    document.documentElement.lang = isMy ? "my" : "en";
    try {
      if (isMy) window.localStorage.setItem(KEY, "my");
      else if (pathname !== "/") window.localStorage.setItem(KEY, "en");
      else if (burmeseAvailable && window.localStorage.getItem(KEY) === "my" && !window.location.hash) {
        router.replace("/my");
      }
    } catch {
      // storage unavailable
    }
  }, [isMy, pathname, burmeseAvailable, router]);

  return null;
}

export function rememberLang(lang: "en" | "my") {
  try {
    window.localStorage.setItem(KEY, lang);
  } catch {
    // ignore
  }
}
