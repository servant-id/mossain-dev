import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const AUTO_PLAY_MS = 5000;

/**
 * Hero slider dengan 3 cara navigasi: swipe touch (mobile), drag mouse
 * (desktop), dan tombol panah/dot — plus auto-play yang berhenti saat
 * pengguna sedang berinteraksi (hover atau menahan slide) supaya tidak
 * "kabur" saat sedang dibaca.
 */
export default function HeroSlider({ slides }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef(null);
  const dragState = useRef({ startX: 0, dragging: false, delta: 0 });

  const count = slides.length;

  const goTo = useCallback((i) => {
    setIndex(((i % count) + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);

  // Auto-play
  useEffect(() => {
    if (count <= 1 || paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [count, paused]);

  // Drag/swipe handlers — bekerja untuk mouse maupun touch lewat Pointer Events,
  // jadi tidak perlu logic terpisah untuk desktop vs mobile.
  function handlePointerDown(e) {
    dragState.current = { startX: e.clientX, dragging: true, delta: 0 };
    setPaused(true);
    trackRef.current?.setPointerCapture?.(e.pointerId);
  }
  function handlePointerMove(e) {
    if (!dragState.current.dragging) return;
    dragState.current.delta = e.clientX - dragState.current.startX;
  }
  function handlePointerUp() {
    if (!dragState.current.dragging) return;
    const { delta } = dragState.current;
    const threshold = 50; // px minimal geser sebelum dianggap swipe
    if (delta > threshold) prev();
    else if (delta < -threshold) next();
    dragState.current.dragging = false;
    setPaused(false);
  }

  if (count === 0) return null;

  return (
    <div
      className="relative select-none overflow-hidden rounded-3xl border-4 border-white/20 shadow-floaty"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        ref={trackRef}
        className="flex aspect-[3/4] cursor-grab touch-pan-y transition-transform duration-500 ease-out active:cursor-grabbing sm:aspect-[4/3]"
        style={{ transform: `translateX(-${index * 100}%)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {slides.map((slide) => (
          <div key={slide.id} className="relative w-full shrink-0">
            <img
              src={slide.image_url}
              alt={slide.title}
              draggable={false}
              className="h-full w-full object-cover"
            />
            {(slide.eyebrow || slide.title || slide.description) && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-2.5 pt-8 text-white sm:p-5 sm:pt-14">
                {slide.eyebrow && (
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-400 sm:text-xs">{slide.eyebrow}</p>
                )}
                {slide.title && <p className="mt-0.5 text-xs font-bold sm:mt-1 sm:text-lg">{slide.title}</p>}
                {slide.description && <p className="mt-0.5 hidden text-sm text-white/85 sm:mt-1 sm:block">{slide.description}</p>}
                {slide.cta_text && slide.cta_url && (
                  <Link to={slide.cta_url} className="mt-1 hidden text-sm font-semibold text-accent-400 hover:underline sm:mt-2 sm:inline-block">
                    {slide.cta_text} →
                  </Link>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Slide sebelumnya"
            className="absolute left-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-card transition hover:bg-white sm:left-3 sm:h-9 sm:w-9"
          >
            <ChevronLeft className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Slide berikutnya"
            className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-card transition hover:bg-white sm:right-3 sm:h-9 sm:w-9"
          >
            <ChevronRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </button>

          <div className="absolute bottom-1.5 left-1/2 flex -translate-x-1/2 gap-1 sm:bottom-3 sm:gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ke slide ${i + 1}`}
                className={`h-1 rounded-full transition-all sm:h-1.5 ${
                  i === index ? "w-4 bg-white sm:w-6" : "w-1 bg-white/50 sm:w-1.5"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
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
