import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.18,
            ease: "easeOut",
          }}
        >
          {children}
        </motion.div>
    </AnimatePresence>
  );
}
