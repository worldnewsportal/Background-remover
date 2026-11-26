import { useCallback, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';
import { clampSplitPercent } from '../utils/canvasMath';

interface BeforeAfterCurtainProps {
  originalUrl: string;
  editedCanvasUrl: string;
  width: number;
  height: number;
  beforeLabel: string;
  afterLabel: string;
  isRtl: boolean;
}

export function BeforeAfterCurtain({
  originalUrl,
  editedCanvasUrl,
  width,
  height,
  beforeLabel,
  afterLabel,
  isRtl,
}: BeforeAfterCurtainProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [splitPct, setSplitPct] = useState(50);
  const [dragging, setDragging] = useState(false);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const rawPct = ((clientX - rect.left) / rect.width) * 100;
    setSplitPct(clampSplitPercent(rawPct));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromClientX(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    updateFromClientX(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      setDragging(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSplitPct((p) => clampSplitPercent(p - 4));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSplitPct((p) => clampSplitPercent(p + 4));
    }
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={`${beforeLabel} / ${afterLabel}`}
      aria-valuemin={2}
      aria-valuemax={98}
      aria-valuenow={Math.round(splitPct)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      style={{
        aspectRatio: `${width} / ${height}`,
        height: height >= width ? 'min(520px, 72vw)' : 'auto',
        width: width > height ? 'min(100%, 760px)' : 'auto',
      }}
      className="relative mx-auto max-h-[520px] max-w-full select-none touch-none overflow-hidden rounded-xl border border-[#E5E7EB] checkerboard-bg cursor-ew-resize focus-visible:outline-2 focus-visible:outline-[#0D9488]"
    >
      {/* After (Cutout / Edited) full base layer */}
      <img
        src={editedCanvasUrl}
        alt={afterLabel}
        referrerPolicy="no-referrer"
        draggable={false}
        className="pointer-events-none h-full w-full object-contain"
      />

      {/* Before (Original) clipped from left edge using explicit LTR geometry */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - splitPct}% 0 0)` }}
      >
        <img
          src={originalUrl}
          alt={beforeLabel}
          referrerPolicy="no-referrer"
          draggable={false}
          className="h-full w-full object-contain bg-[#F3F4F6]"
        />
      </div>

      {/* Labels aligned strictly with left (Before) and right (After) clip halves */}
      <span className="pointer-events-none absolute top-3 left-3 rounded-md bg-[#111827]/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-md bg-white/90 border border-[#E5E7EB] px-2.5 py-1 text-[11px] font-semibold text-[#111827]">
        {afterLabel}
      </span>

      {/* Divider Line & Tactile Handle */}
      <div
        className="pointer-events-none absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(17,24,39,0.35)]"
        style={{ left: `${splitPct}%`, transform: 'translateX(-50%)' }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#111827] shadow-md">
          <MoveHorizontal className="h-4 w-4 text-[#0D9488]" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
