import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";

/**
 * Paged slider: shows `perViewDesktop` cards per page on lg+ screens and
 * `perViewMobile` below that, exactly like the old PHP initSliderPV(), but
 * driven by React state + ResizeObserver instead of manual pixel math, so
 * there's nothing left to desync on resize/orientation change.
 */
export default function ProductSlider({ title, items, perViewDesktop = 2, perViewMobile = 1, showTitle = true }) {
  const containerRef = useRef(null);
  const [perView, setPerView] = useState(perViewMobile);
  const [page, setPage] = useState(0);

  useEffect(() => {
    function update() {
      setPerView(window.innerWidth >= 1024 ? perViewDesktop : perViewMobile);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [perViewDesktop, perViewMobile]);

  const totalPages = Math.max(1, Math.ceil(items.length / perView));

  useEffect(() => {
    if (page >= totalPages) setPage(totalPages - 1);
  }, [totalPages, page]);

  if (!items.length) {
    return (
      <div>
        {showTitle && <h4 className="mb-4 text-center text-xl font-semibold text-slate-700">{title}</h4>}
        <p className="text-center text-slate-500">Belum ada gambar untuk sub-kategori ini.</p>
      </div>
    );
  }

  const showNav = items.length > perView;

  return (
    <div>
      {showTitle && <h4 className="mb-4 text-center text-xl font-semibold text-slate-700">{title}</h4>}
      <div className="relative overflow-hidden" ref={containerRef}>
        {showNav && (
          <>
            <button
              aria-label="Sebelumnya"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-700 shadow-card transition hover:bg-brand-600 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Berikutnya"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-brand-700 shadow-card transition hover:bg-brand-600 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${page * 100}%)` }}
        >
          {chunk(items, perView).map((group, i) => (
            <div
              key={i}
              className="grid w-full shrink-0 gap-4 px-1"
              style={{ gridTemplateColumns: `repeat(${perView}, minmax(0,1fr))` }}
            >
              {group.map((item) => (
                <ProductCard key={item.slug + item.img} {...item} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function ChevronLeft(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
    </svg>
  );
}
function ChevronRight(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  );
}
