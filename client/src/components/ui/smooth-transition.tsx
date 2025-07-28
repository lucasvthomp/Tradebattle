import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";

interface SmoothTransitionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
}

export function SmoothTransition({ 
  children, 
  className = "",
  delay = 0,
  duration = 0.3,
  direction = "up"
}: SmoothTransitionProps) {
  const variants = {
    up: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 }
    },
    down: {
      initial: { opacity: 0, y: -20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: 20 }
    },
    left: {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 }
    },
    right: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 20 }
    },
    fade: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 }
    }
  };

  return (
    <motion.div
      className={className}
      variants={variants[direction]}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1]
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggeredChildrenProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  childDelay?: number;
}

export function StaggeredChildren({ 
  children, 
  className = "",
  staggerDelay = 0.1,
  childDelay = 0.3
}: StaggeredChildrenProps) {
  return (
    <div className={className}>
      <AnimatePresence>
        {children.map((child, index) => (
          <SmoothTransition 
            key={index}
            delay={index * staggerDelay}
            duration={childDelay}
          >
            {child}
          </SmoothTransition>
        ))}
      </AnimatePresence>
    </div>
  );
}