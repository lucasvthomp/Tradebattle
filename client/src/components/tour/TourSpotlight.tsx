import { useEffect, useState, useCallback } from "react";

interface TourSpotlightProps {
  targetSelector: string;
  isCenter: boolean;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourSpotlight({ targetSelector, isCenter }: TourSpotlightProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  const updateRect = useCallback(() => {
    if (isCenter) {
      setRect(null);
      return;
    }
    const el = document.querySelector(targetSelector);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    const padding = 8;
    setRect({
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
    });
  }, [targetSelector, isCenter]);

  useEffect(() => {
    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [updateRect]);

  // Full dark overlay only (no cutout) for center steps
  if (isCenter || !rect) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          backgroundColor: "rgba(0,0,0,0.75)",
          transition: "all 0.3s ease",
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none",
      }}
    >
      {/* Cutout div with box-shadow overlay */}
      <div
        style={{
          position: "absolute",
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: 12,
          border: "2px solid #E3B341",
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.75)",
          transition: "all 0.3s ease",
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}
