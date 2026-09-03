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
        className="flex aspect-[4/3] cursor-grab touch-pan-y transition-transform duration-500 ease-out active:cursor-grabbing"
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
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-5 pt-14 text-white">
                {slide.eyebrow && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent-400">{slide.eyebrow}</p>
                )}
                {slide.title && <p className="mt-1 text-lg font-bold">{slide.title}</p>}
                {slide.description && <p className="mt-1 text-sm text-white/85">{slide.description}</p>}
                {slide.cta_text && slide.cta_url && (
                  <Link to={slide.cta_url} className="mt-2 inline-block text-sm font-semibold text-accent-400 hover:underline">
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
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-card transition hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Slide berikutnya"
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-card transition hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Ke slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"
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
