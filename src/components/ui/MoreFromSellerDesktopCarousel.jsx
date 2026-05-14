import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import ProductCard from "./ProductCard";

/**
 * Desktop-only horizontal carousel for "More from this seller".
 * Uses native scrolling with arrow buttons (prev/next).
 */
const MoreFromSellerDesktopCarousel = ({ moreFromSeller = [] }) => {
  const rowRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const cardsCount = moreFromSeller.length;
  const safeCards = useMemo(() => Array.isArray(moreFromSeller) ? moreFromSeller : [], [moreFromSeller]);

  const updateButtons = () => {
    const el = rowRef.current;
    if (!el) return;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const left = el.scrollLeft;
    setCanPrev(left > 2);
    setCanNext(left < maxScrollLeft - 2);
  };

  const scrollByPage = (dir) => {
    const el = rowRef.current;
    if (!el) return;

    // Scroll by roughly one "page" of visible cards.
    // Cards are ~180px on mobile / ~220px on sm+.
    const cardW = el.clientWidth >= 640 ? 220 : 180;
    const cardsPerPage = Math.max(1, Math.floor(el.clientWidth / cardW));
    const delta = dir * cardW * cardsPerPage;

    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    updateButtons();
    const el = rowRef.current;
    if (!el) return;

    const onScroll = () => updateButtons();
    const onResize = () => updateButtons();

    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardsCount]);

  if (!safeCards.length) return null;

  return (
    <div className="relative">
      {/* Prev */}
      <button
        type="button"
        aria-label="Previous"
        onClick={() => scrollByPage(-1)}
        disabled={!canPrev}
        className={`hidden md:flex items-center justify-center absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 shadow-sm transition
          ${canPrev ? "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700" : "opacity-40 cursor-not-allowed"}`}
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      {/* Next */}
      <button
        type="button"
        aria-label="Next"
        onClick={() => scrollByPage(1)}
        disabled={!canNext}
        className={`hidden md:flex items-center justify-center absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full border border-gray-200 dark:border-slate-700 bg-white/90 dark:bg-slate-800/90 shadow-sm transition
          ${canNext ? "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700" : "opacity-40 cursor-not-allowed"}`}
      >
        <ChevronRightIcon className="h-5 w-5" />
      </button>

      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-0 md:px-2"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {safeCards.map((p, idx) => (
          <div
            key={p.slug_en || p.id}
            className="w-[180px] sm:w-[220px] flex-shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <ProductCard product={p} imagePriority={idx < 3} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoreFromSellerDesktopCarousel;

