import { useEffect, useRef, useState } from "react";

/**
 * Real Google Translate widget (GTranslate), styled to look like a
 * simple "🌐 Indonesia ▾" pill instead of Google's default banner.
 *
 * Content on the site is authored only in Indonesian and stored that
 * way in Supabase — switching to English runs Google's live DOM
 * translation, it does not read a second copy of the content.
 */
export default function LanguageSwitcher() {
  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // google_translate_element is the DOM node Google's script looks for.
    window.googleTranslateElementInit = () => {
      // eslint-disable-next-line no-undef
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "id",
          includedLanguages: "id,en",
          autoDisplay: false,
          layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
      setReady(true);
    };

    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      window.googleTranslateElementInit();
    }
  }, []);

  function switchTo(lang) {
    // GTranslate stores the active language pair in a cookie the widget's
    // hidden <select> reads on load; the reliable public way to trigger it
    // is to drive that hidden select directly.
    const select = document.querySelector("#google_translate_element select");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
    }
  }

  return (
    <div className="relative">
      {/* Google's own widget renders here, visually hidden — we drive it
          programmatically from our own styled control below. */}
      <div id="google_translate_element" className="notranslate absolute -left-[9999px] h-0 w-0 overflow-hidden" />

      <div ref={containerRef} className="group relative">
        <button
          type="button"
          disabled={!ready}
          className="notranslate flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
          aria-haspopup="menu"
        >
          <TranslateIcon className="h-4 w-4 text-brand-600" />
          <span>Bahasa</span>
          <ChevronIcon className="h-3.5 w-3.5" />
        </button>

        <div
          role="menu"
          className="invisible absolute right-0 z-50 mt-2 w-40 origin-top-right scale-95 rounded-xl border border-slate-100 bg-white p-1 opacity-0 shadow-card transition group-hover:visible group-hover:scale-100 group-hover:opacity-100 group-focus-within:visible group-focus-within:scale-100 group-focus-within:opacity-100"
        >
          <button
            role="menuitem"
            onClick={() => switchTo("id")}
            className="notranslate flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
          >
            🇮🇩 Indonesia
          </button>
          <button
            role="menuitem"
            onClick={() => switchTo("en")}
            className="notranslate flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-brand-50 hover:text-brand-700"
          >
            🇬🇧 English
          </button>
        </div>
      </div>
    </div>
  );
}

function TranslateIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h7M9 3v2M11 5c-.6 3.2-2.1 5.8-4.5 7.8M6 9.5c1.3 1.7 3 3 5 3.7M13 21l4-9 4 9M14.5 18h5" />
    </svg>
  );
}
function ChevronIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}
