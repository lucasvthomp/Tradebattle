import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { tourSteps } from "@/components/tour/tourSteps";

interface TourContextType {
  isTourActive: boolean;
  currentStep: number;
  startTour: () => void;
  nextStep: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType | null>(null);

async function markTutorialComplete() {
  await fetch("/api/tutorial/complete", { method: "POST" });
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const completeTour = useCallback(async () => {
    setIsTourActive(false);
    setCurrentStep(0);
    try {
      await markTutorialComplete();
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    } catch {
      // Silently handle — user can still use the app
    }
    toast({
      title: "You're all set!",
      description: "Explore the platform and start trading.",
    });
  }, [queryClient, toast]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsTourActive(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep >= tourSteps.length - 1) {
      completeTour();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, completeTour]);

  const skipTour = useCallback(() => {
    completeTour();
  }, [completeTour]);

  return (
    <TourContext.Provider
      value={{ isTourActive, currentStep, startTour, nextStep, skipTour }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
}
