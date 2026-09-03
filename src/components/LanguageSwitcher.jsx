import { useEffect, useRef, useState } from "react";

/**
 * Real Google Translate widget (GTranslate), styled to look like a
 * simple "🌐 Bahasa ▾" pill instead of Google's default banner.
 *
 * Content on the site is authored only in Indonesian and stored that
 * way in Supabase — switching to English runs Google's live DOM
 * translation, it does not read a second copy of the content.
 *
 * Dropdown is click-based (not hover-based) — hover dropdowns break the
 * moment the cursor moves diagonally toward a menu item instead of
 * straight down, which is exactly the "susah dipilih" bug reported.
 * Click-based also works correctly on touchscreens, where hover doesn't
 * exist at all.
 */
export default function LanguageSwitcher() {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeLang, setActiveLang] = useState("id");
  const wrapperRef = useRef(null);

  useEffect(() => {
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
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      script.onerror = () => {
        // Google's widget script can be blocked by ad-blockers or regional
        // network policies — fail visibly in the console rather than
        // leaving the button silently non-functional forever.
        console.error("Gagal memuat skrip Google Translate. Coba nonaktifkan ad-blocker.");
      };
      document.body.appendChild(script);
    } else if (window.google?.translate) {
      window.googleTranslateElementInit();
    }
  }, []);

  // Tutup dropdown saat klik di luar area, atau saat tombol Escape ditekan.
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function switchTo(lang) {
    setActiveLang(lang);
    setOpen(false);

    // Coba jalur normal: drive hidden <select> milik widget Google.
    const select = document.querySelector("#google_translate_element select");
    if (select) {
      select.value = lang;
      select.dispatchEvent(new Event("change"));
      return;
    }

    // Fallback kalau widget belum/gagal siap (mis. diblokir ad-blocker):
    // set cookie googtrans langsung lalu reload, ini cara yang sama yang
    // dipakai widget Google secara internal untuk mengingat pilihan bahasa.
    const pair = lang === "id" ? "" : `/id/${lang}`;
    document.cookie = `googtrans=${pair};path=/`;
    document.cookie = `googtrans=${pair};path=/;domain=${window.location.hostname}`;
    window.location.reload();
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Google's own widget renders here, visually hidden — we drive it
          programmatically from our own styled control below. */}
      <div id="google_translate_element" className="notranslate absolute -left-[9999px] h-0 w-0 overflow-hidden" />

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={!ready}
        className="notranslate flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-60"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <TranslateIcon className="h-4 w-4 text-brand-600" />
        <span>{activeLang === "id" ? "Bahasa" : "Language"}</span>
        <ChevronIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="notranslate absolute right-0 z-50 mt-2 w-40 rounded-xl border border-slate-100 bg-white p-1 shadow-card"
        >
          <button
            role="menuitem"
            onClick={() => switchTo("id")}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50 hover:text-brand-700 ${
              activeLang === "id" ? "font-semibold text-brand-700" : "text-slate-700"
            }`}
          >
            🇮🇩 Indonesia
          </button>
          <button
            role="menuitem"
            onClick={() => switchTo("en")}
            className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm hover:bg-brand-50 hover:text-brand-700 ${
              activeLang === "en" ? "font-semibold text-brand-700" : "text-slate-700"
            }`}
          >
            🇬🇧 English
          </button>
        </div>
      )}
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
