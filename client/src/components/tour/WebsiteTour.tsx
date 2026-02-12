import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTour } from "@/hooks/useTour";
import { tourSteps } from "./tourSteps";
import { TourSpotlight } from "./TourSpotlight";
import { TourCard } from "./TourCard";

export function WebsiteTour() {
  const { isTourActive, currentStep, nextStep, skipTour } = useTour();
  const [, navigate] = useLocation();
  const [ready, setReady] = useState(false);

  const step = tourSteps[currentStep];

  // Handle route navigation and target element readiness
  useEffect(() => {
    if (!isTourActive || !step) return;

    setReady(false);

    // Navigate if step requires a different route
    if (step.route) {
      navigate(step.route);
    }

    // Wait for DOM to settle after navigation/render
    const timer = setTimeout(() => {
      // Scroll target into view if it exists
      const el = document.querySelector(step.targetSelector);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      setReady(true);
    }, 400);

    return () => clearTimeout(timer);
  }, [isTourActive, currentStep, step, navigate]);

  // Keyboard handlers
  useEffect(() => {
    if (!isTourActive) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        skipTour();
      } else if (e.key === "Enter") {
        nextStep();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isTourActive, nextStep, skipTour]);

  if (!isTourActive || !step || !ready) return null;

  const isCenter = step.cardPosition === "center";

  return (
    <>
      <TourSpotlight
        targetSelector={step.targetSelector}
        isCenter={isCenter}
      />
      <TourCard
        currentStep={currentStep}
        onNext={nextStep}
        onSkip={skipTour}
      />
    </>
  );
}
