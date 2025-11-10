import { motion } from "framer-motion";

export default function Shop() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {/* Traffic Cone with Animation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: [0, -2, 2, -2, 0]
          }}
          transition={{
            opacity: { duration: 0.5 },
            y: { duration: 0.5 },
            rotate: {
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          className="mb-12 flex justify-center"
        >
          <svg
            width="140"
            height="160"
            viewBox="0 0 140 160"
            className="drop-shadow-2xl"
          >
            {/* Shadow */}
            <ellipse
              cx="70"
              cy="148"
              rx="50"
              ry="6"
              fill="hsl(240, 10%, 8%)"
              opacity="0.5"
            />

            {/* Cone body - darker charcoal */}
            <path
              d="M 70 20 L 25 130 L 115 130 Z"
              fill="hsl(240, 6%, 18%)"
            />

            {/* Left side shadow for 3D depth */}
            <path
              d="M 70 20 L 25 130 L 70 130 Z"
              fill="hsl(240, 6%, 14%)"
              opacity="0.4"
            />

            {/* Green stripe 1 - subdued green */}
            <path
              d="M 59 50 L 54 70 L 86 70 L 81 50 Z"
              fill="hsl(142, 50%, 35%)"
            />

            {/* Green stripe 2 */}
            <path
              d="M 48 88 L 43 108 L 97 108 L 92 88 Z"
              fill="hsl(142, 50%, 35%)"
            />

            {/* Base/rim */}
            <rect
              x="25"
              y="130"
              width="90"
              height="10"
              rx="2"
              fill="hsl(240, 6%, 16%)"
            />

            {/* Base shadow */}
            <rect
              x="25"
              y="135"
              width="90"
              height="5"
              rx="1"
              fill="hsl(240, 6%, 12%)"
              opacity="0.6"
            />
          </svg>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-4xl font-bold text-foreground mb-3"
        >
          Under Construction
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-muted-foreground text-lg mb-8"
        >
          This page is currently being built. Check back soon!
        </motion.p>

        {/* Pulsing dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/40"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.8, 0.4],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
