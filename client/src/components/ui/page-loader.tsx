import { motion } from "framer-motion";
import { TrendingUp, Zap, DollarSign, Trophy } from "lucide-react";

export function PageLoader() {
  // Floating particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2,
    x: Math.random() * 200 - 100,
    y: Math.random() * 200 - 100,
  }));

  // Orbiting icons
  const orbitIcons = [
    { Icon: TrendingUp, color: '#28C76F', delay: 0 },
    { Icon: DollarSign, color: '#E3B341', delay: 0.5 },
    { Icon: Zap, color: '#60A5FA', delay: 1 },
    { Icon: Trophy, color: '#FFD700', delay: 1.5 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #06121F 0%, #0F172A 50%, #06121F 100%)',
      }}
    >
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            background: 'radial-gradient(circle, #E3B341, transparent)',
          }}
          animate={{
            x: [particle.x, -particle.x, particle.x],
            y: [particle.y, -particle.y, particle.y],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Pulsing Background Glow */}
      <motion.div
        className="absolute w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(227, 179, 65, 0.3), transparent)' }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative flex flex-col items-center">
        {/* Outer Rotating Ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '200px',
            height: '200px',
            border: '3px solid rgba(227, 179, 65, 0.2)',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {/* Orbiting Icons */}
          {orbitIcons.map(({ Icon, color, delay }, idx) => (
            <motion.div
              key={idx}
              className="absolute"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                rotate: -360, // Counter-rotate to keep icons upright
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
                delay: delay,
              }}
            >
              <motion.div
                animate={{
                  x: [0, 0],
                  y: [0, 0],
                  rotate: [0, 360],
                }}
                transition={{
                  rotate: {
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear",
                    delay: delay,
                  },
                }}
                style={{
                  transform: `rotate(${idx * 90}deg) translateY(-100px) rotate(-${idx * 90}deg)`,
                }}
              >
                <motion.div
                  className="p-2 rounded-lg"
                  style={{
                    background: `${color}20`,
                    border: `2px solid ${color}`,
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    boxShadow: [
                      `0 0 10px ${color}40`,
                      `0 0 20px ${color}80`,
                      `0 0 10px ${color}40`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: delay,
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: color }} />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Middle Spinning Ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: '160px',
            height: '160px',
            border: '2px dashed rgba(227, 179, 65, 0.4)',
          }}
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* ORSATH Logo Container */}
        <motion.div
          className="relative z-10"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {/* Glowing Background Circle */}
          <motion.div
            className="absolute inset-0 rounded-full blur-xl"
            style={{
              background: 'radial-gradient(circle, rgba(227, 179, 65, 0.6), transparent)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Logo Circle */}
          <motion.div
            className="w-24 h-24 rounded-2xl flex items-center justify-center relative"
            style={{
              background: 'linear-gradient(135deg, #E3B341, #FFD700)',
              boxShadow: '0 0 40px rgba(227, 179, 65, 0.5), 0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
            animate={{
              boxShadow: [
                '0 0 40px rgba(227, 179, 65, 0.5), 0 8px 32px rgba(0, 0, 0, 0.4)',
                '0 0 60px rgba(227, 179, 65, 0.8), 0 12px 40px rgba(0, 0, 0, 0.5)',
                '0 0 40px rgba(227, 179, 65, 0.5), 0 8px 32px rgba(0, 0, 0, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* "O" Letter */}
            <motion.span
              className="text-5xl font-black"
              style={{ color: '#06121F' }}
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              O
            </motion.span>
          </motion.div>
        </motion.div>

        {/* Brand Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-32 text-center"
        >
          <motion.h1
            className="text-4xl font-black tracking-tight mb-3"
            style={{
              background: 'linear-gradient(135deg, #E3B341, #FFD700, #E3B341)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            ORSATH
          </motion.h1>

          {/* Loading Dots */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ background: '#E3B341' }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          {/* Loading Text */}
          <motion.p
            className="mt-4 text-sm font-semibold"
            style={{ color: '#8A93A6' }}
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Loading your trading experience...
          </motion.p>
        </motion.div>

        {/* Bottom Sparkles */}
        <div className="absolute -bottom-20 flex gap-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ background: '#E3B341' }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
