import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#06121F' }}
    >
      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background: 'linear-gradient(135deg, #E3B341, #F59E0B)',
          boxShadow: '0 8px 32px rgba(227, 179, 65, 0.3)',
        }}
      >
        <span style={{ fontSize: '28px', fontWeight: '900', color: '#06121F' }}>T</span>
      </motion.div>

      {/* Brand name */}
      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        style={{ fontSize: '18px', fontWeight: '700', color: '#C9D1E2', marginBottom: '24px' }}
      >
        Tradebattle
      </motion.p>

      {/* Progress bar */}
      <div style={{ width: '120px', height: '3px', background: '#1E2D3F', borderRadius: '999px', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: '#E3B341', borderRadius: '999px' }}
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}
