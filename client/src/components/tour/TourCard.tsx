import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tourSteps } from "./tourSteps";

interface TourCardProps {
  currentStep: number;
  onNext: () => void;
  onSkip: () => void;
}

export function TourCard({ currentStep, onNext, onSkip }: TourCardProps) {
  const step = tourSteps[currentStep];
  const total = tourSteps.length;
  const isLast = currentStep === total - 1;
  const progress = ((currentStep + 1) / total) * 100;

  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const updatePosition = useCallback(() => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    if (mobile || step.cardPosition === "center") {
      setPos(null);
      return;
    }

    const el = document.querySelector(step.targetSelector);
    if (!el) {
      setPos(null);
      return;
    }

    const r = el.getBoundingClientRect();
    const cardW = 380;
    const cardH = 240;
    const gap = 16;
    let top = 0;
    let left = 0;

    switch (step.cardPosition) {
      case "bottom":
        top = r.bottom + gap;
        left = r.left + r.width / 2 - cardW / 2;
        break;
      case "top":
        top = r.top - cardH - gap;
        left = r.left + r.width / 2 - cardW / 2;
        break;
      case "right":
        top = r.top + r.height / 2 - cardH / 2;
        left = r.right + gap;
        break;
      case "left":
        top = r.top + r.height / 2 - cardH / 2;
        left = r.left - cardW - gap;
        break;
    }

    // Clamp to viewport
    top = Math.max(16, Math.min(top, window.innerHeight - cardH - 16));
    left = Math.max(16, Math.min(left, window.innerWidth - cardW - 16));

    setPos({ top, left });
  }, [step]);

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  const cardStyle: React.CSSProperties =
    isMobile || !pos
      ? {
          position: "fixed",
          bottom: 24,
          left: 16,
          right: 16,
          maxWidth: isMobile ? "none" : 380,
          margin: isMobile ? 0 : "0 auto",
          zIndex: 9999,
        }
      : {
          position: "fixed",
          top: pos.top,
          left: pos.left,
          maxWidth: 380,
          width: 380,
          zIndex: 9999,
        };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{
          ...cardStyle,
          background: 'transparent',
          border: "2px solid #00A3FF",
          boxShadow: "0 8px 32px rgba(0,163,255,0.12)",
          borderRadius: 16,
          padding: "24px",
        }}
      >
        {/* Step counter */}
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "#94A3B8",
            marginBottom: 8,
          }}
        >
          Step {currentStep + 1} of {total}
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#F1F5F9",
            marginBottom: 8,
          }}
        >
          {step.title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 14,
            color: "#94A3B8",
            lineHeight: 1.6,
            marginBottom: 20,
          }}
        >
          {step.description}
        </div>

        {/* Progress bar */}
        <div
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: "#0E2040",
            marginBottom: 20,
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              height: "100%",
              borderRadius: 2,
              background: "linear-gradient(90deg, #00A3FF, #10B981)",
            }}
          />
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onSkip}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #0E2040",
              background: "transparent",
              color: "#94A3B8",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Skip Tour
          </button>
          <button
            onClick={onNext}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              border: "none",
              background: "linear-gradient(135deg, #00A3FF, #0090E0)",
              color: "#091525",
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {isLast ? "Got It!" : "Next"}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
