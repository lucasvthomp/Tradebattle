import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
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
  const response = await fetch("/api/tutorial/complete", {
    method: "POST",
    credentials: "include", // Important: include session cookie
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error("Failed to mark tutorial complete");
  }
  return response.json();
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isCompletingRef = useRef(false);

  const completeTour = useCallback(async () => {
    // Prevent multiple simultaneous completions
    if (isCompletingRef.current) {
      return;
    }

    isCompletingRef.current = true;
    setIsTourActive(false);
    setCurrentStep(0);

    try {
      await markTutorialComplete();
      // Wait for the user data to be refetched before showing toast
      await queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/user"] });
      toast({
        title: "You're all set!",
        description: "Explore the platform and start trading.",
      });
    } catch (error) {
      console.error("Failed to complete tutorial:", error);
      // Still show the toast even if the API call fails
      toast({
        title: "You're all set!",
        description: "Explore the platform and start trading.",
      });
    } finally {
      isCompletingRef.current = false;
    }
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
