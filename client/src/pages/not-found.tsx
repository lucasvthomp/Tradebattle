import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, ArrowLeft, TrendingDown } from "lucide-react";

const chartPoints = [
  { x: 0, y: 20 }, { x: 8, y: 18 }, { x: 16, y: 22 }, { x: 24, y: 15 },
  { x: 32, y: 19 }, { x: 40, y: 12 }, { x: 48, y: 16 }, { x: 56, y: 10 },
  { x: 64, y: 14 }, { x: 72, y: 8 }, { x: 80, y: 30 }, { x: 86, y: 48 },
  { x: 90, y: 62 }, { x: 94, y: 74 }, { x: 98, y: 86 }, { x: 100, y: 95 },
];

const toSvgPath = (pts: { x: number; y: number }[]) =>
  pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

const pathD = toSvgPath(chartPoints);
const areaD = `${pathD} L 100 100 L 0 100 Z`;

const ticker = [
  { sym: "ROUTE", val: "404", chg: "-100%", up: false },
  { sym: "PAGE", val: "NULL", chg: "CRASHED", up: false },
  { sym: "LINK", val: "DEAD", chg: "-∞", up: false },
  { sym: "USER", val: "LOST", chg: "?", up: false },
  { sym: "BTBT", val: "$22.41", chg: "+3.2%", up: true },
  { sym: "AAPL", val: "$192.68", chg: "+1.1%", up: true },
];

export default function NotFound() {
  return (
    <div
      className="arena-page-shell min-h-[calc(100dvh-4rem)] w-full flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: 'transparent' }}
    >
      {/* Ticker tape */}
      <div
        className="w-full overflow-hidden mb-12"
        style={{
          borderTop: "1px solid #0E2040",
          borderBottom: "1px solid #0E2040",
          backgroundColor: "#0B1626",
          padding: "8px 0",
        }}
      >
        <motion.div
          className="flex gap-10 whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ width: "max-content" }}
        >
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-xs font-mono">
              <span style={{ color: "#8A93A6" }}>{t.sym}</span>
              <span style={{ color: "#C9D1E2", fontWeight: 600 }}>{t.val}</span>
              <span style={{ color: t.up ? "#28C76F" : "#FF4F58", fontWeight: 700 }}>
                {t.chg}
              </span>
              <span style={{ color: "#0E2040" }}>│</span>
            </span>
          ))}
        </motion.div>
      </div>

      <div className="max-w-xl w-full">
        {/* Chart crashing to zero */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8 relative"
          style={{
            backgroundColor: "#0B1626",
            borderRadius: "12px",
            border: "1px solid #0E2040",
            padding: "20px 20px 12px",
          }}
        >
          {/* Chart header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: "#C9D1E2" }}>
                PAGE/USD
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded font-semibold"
                style={{ backgroundColor: "rgba(255,79,88,0.15)", color: "#FF4F58" }}
              >
                ▼ -100%
              </span>
            </div>
            <span className="text-xs font-mono" style={{ color: "#FF4F58" }}>
              $0.00
            </span>
          </div>

          {/* SVG Chart */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full"
            style={{ height: "80px" }}
          >
            {/* Area fill */}
            <motion.path
              d={areaD}
              fill="rgba(255,79,88,0.08)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
            {/* Line */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="#FF4F58"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
            />
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between mt-1">
            {["Open", "", "", "", "", "Now"].map((l, i) => (
              <span key={i} className="text-xs" style={{ color: "#4B5563" }}>
                {l}
              </span>
            ))}
          </div>
        </motion.div>

        {/* 404 heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <TrendingDown className="w-7 h-7" style={{ color: "#FF4F58" }} />
            <h1
              className="text-7xl font-black font-mono tracking-tight"
              style={{ color: "#FF4F58" }}
            >
              404
            </h1>
            <TrendingDown className="w-7 h-7" style={{ color: "#FF4F58" }} />
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: "#C9D1E2" }}>
            This page got liquidated
          </h2>
          <p className="text-sm" style={{ color: "#8A93A6" }}>
            The route you requested doesn't exist — or got delisted.
          </p>
        </motion.div>

        {/* Quote card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="rounded-xl px-5 py-4 mb-8 text-center"
          style={{ backgroundColor: "#0C1829", border: "1px solid #0E2040" }}
        >
          <p className="text-sm italic mb-1" style={{ color: "#C9D1E2" }}>
            "The market can stay irrational longer than you can find this page."
          </p>
          <p className="text-xs" style={{ color: "#4B5563" }}>
            — Every trader who clicked a bad link
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="flex gap-3 justify-center"
        >
          <Link href="/">
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, #00A3FF, #0090E0)",
                color: "#FFFFFF",
              }}
            >
              <Home className="w-4 h-4" />
              Back to Hub
            </button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all"
            style={{
              backgroundColor: "#0C1829",
              border: "1px solid #0E2040",
              color: "#C9D1E2",
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </motion.div>
      </div>
    </div>
  );
}
