import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { TrendingDown, ArrowLeft, Home, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: '#06121F' }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: i % 2 === 0 ? '#EF4444' : '#E3B341',
              opacity: 0.3,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
        {/* Stock Chart "404" */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.div
              animate={{ rotate: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <TrendingDown className="w-16 h-16" style={{ color: '#EF4444' }} />
            </motion.div>
            <h1
              className="text-9xl font-black tracking-tighter"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(239, 68, 68, 0.3)',
              }}
            >
              404
            </h1>
            <motion.div
              animate={{ rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              <TrendingDown className="w-16 h-16" style={{ color: '#EF4444' }} />
            </motion.div>
          </div>

          {/* Stock ticker style error message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full mb-6"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
              ERROR
            </span>
            <span className="text-sm" style={{ color: '#94A3B8' }}>|</span>
            <span className="text-sm font-mono" style={{ color: '#F1F5F9' }}>
              PAGE-404
            </span>
            <span className="text-sm font-bold" style={{ color: '#EF4444' }}>
              ↓ -100%
            </span>
          </motion.div>
        </motion.div>

        {/* Trading-themed messages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4 mb-10"
        >
          <h2
            className="text-3xl md:text-4xl font-bold"
            style={{ color: '#F1F5F9' }}
          >
            This Page Went to Zero
          </h2>
          <p
            className="text-lg md:text-xl"
            style={{ color: '#94A3B8' }}
          >
            Looks like this route got <span className="font-bold" style={{ color: '#EF4444' }}>liquidated</span> 📉
          </p>

          {/* Trading puns */}
          <div
            className="max-w-md mx-auto mt-6 p-4 rounded-lg"
            style={{
              backgroundColor: 'rgba(30, 45, 63, 0.5)',
              border: '1px solid rgba(227, 179, 65, 0.2)',
            }}
          >
            <BarChart3 className="w-6 h-6 mx-auto mb-2" style={{ color: '#E3B341' }} />
            <p className="text-sm italic" style={{ color: '#C9D1E2' }}>
              "The market can stay irrational longer than you can find this page."
            </p>
            <p className="text-xs mt-2" style={{ color: '#64748B' }}>
              – Every trader who clicked a bad link
            </p>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/">
            <Button
              className="px-6 py-6 text-base font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
                color: '#080C14',
                boxShadow: '0 4px 20px rgba(227, 179, 65, 0.3)',
              }}
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Hub
            </Button>
          </Link>

          <Button
            variant="ghost"
            className="px-6 py-6 text-base border-2 hover:scale-105 transition-all"
            style={{
              borderColor: 'rgba(227, 179, 65, 0.5)',
              color: '#E3B341',
            }}
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
        </motion.div>

        {/* Fun trading stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {[
            { label: 'Loss', value: '-100%', color: '#EF4444' },
            { label: 'Status', value: 'REKT', color: '#FF9F43' },
            { label: 'Recovery', value: '0%', color: '#94A3B8' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + i * 0.1 }}
              className="p-3 rounded-lg"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(31, 41, 55, 0.5)',
              }}
            >
              <div className="text-xs mb-1" style={{ color: '#64748B' }}>
                {stat.label}
              </div>
              <div
                className="text-lg font-bold font-mono"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Easter egg message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-8 text-xs"
          style={{ color: '#475569' }}
        >
          Error 404: Your stop loss triggered before you could reach this page 💸
        </motion.p>
      </div>
    </div>
  );
}
