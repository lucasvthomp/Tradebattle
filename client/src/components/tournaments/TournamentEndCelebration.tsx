import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, TrendingUp, Medal, Sparkles, DollarSign } from "lucide-react";
import confetti from "canvas-confetti";

interface TournamentEndCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: {
    id: number;
    name: string;
    prizePool: number;
  };
  results: {
    winner: {
      username: string;
      finalBalance: number;
      profit: number;
      rank: number;
    };
    topThree: Array<{
      username: string;
      finalBalance: number;
      profit: number;
      rank: number;
    }>;
    userRank?: number;
    userProfit?: number;
    totalParticipants: number;
  };
}

export function TournamentEndCelebration({
  isOpen,
  onClose,
  tournament,
  results
}: TournamentEndCelebrationProps) {
  const [phase, setPhase] = useState<'drumroll' | 'reveal' | 'summary'>('drumroll');

  useEffect(() => {
    if (!isOpen) {
      setPhase('drumroll');
      return;
    }

    // Drumroll phase (3 seconds)
    const drumrollTimer = setTimeout(() => {
      setPhase('reveal');

      // Fire confetti on reveal
      const duration = 3000;
      const end = Date.now() + duration;

      const colors = ['#E3B341', '#FFD700', '#28C76F', '#6366F1'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    }, 3000);

    // Summary phase (after 5 seconds total)
    const summaryTimer = setTimeout(() => {
      setPhase('summary');
    }, 5000);

    return () => {
      clearTimeout(drumrollTimer);
      clearTimeout(summaryTimer);
    };
  }, [isOpen]);

  const getRankMedal = (rank: number) => {
    if (rank === 1) return { icon: Crown, color: '#FFD700', label: '🥇 Champion' };
    if (rank === 2) return { icon: Medal, color: '#C0C0C0', label: '🥈 Runner-Up' };
    if (rank === 3) return { icon: Medal, color: '#CD7F32', label: '🥉 Third Place' };
    return { icon: Trophy, color: '#8A93A6', label: `#${rank}` };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl p-0 overflow-hidden"
        style={{ backgroundColor: 'transparent', borderColor: '#E3B341', border: '3px solid' }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#E3B341' }} />
            </motion.div>
          ))}
        </div>

        <div className="relative">
          <AnimatePresence mode="wait">
            {/* Phase 1: Drumroll */}
            {phase === 'drumroll' && (
              <motion.div
                key="drumroll"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-32 px-8"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Trophy className="w-32 h-32 mb-8" style={{ color: '#E3B341' }} />
                </motion.div>

                <motion.h1
                  className="text-5xl font-black text-center mb-4"
                  style={{ color: '#C9D1E2' }}
                  animate={{
                    opacity: [1, 0.5, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  🥁 Drumroll Please... 🥁
                </motion.h1>

                <p className="text-xl" style={{ color: '#8A93A6' }}>
                  Revealing the winner of {tournament.name}
                </p>

                {/* Animated dots */}
                <div className="flex gap-2 mt-8">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ background: '#E3B341' }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 1, 0.3],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Phase 2: Winner Reveal */}
            {phase === 'reveal' && (
              <motion.div
                key="reveal"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8, bounce: 0.6 }}
                className="py-16 px-8"
              >
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="inline-block relative mb-6"
                  >
                    <motion.div
                      className="absolute inset-0 blur-3xl"
                      style={{ background: 'radial-gradient(circle, rgba(255, 215, 0, 0.6), transparent)' }}
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0.9, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                    <Crown className="w-32 h-32 relative z-10" style={{ color: '#FFD700' }} />
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-6xl font-black mb-4"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700, #FFA500, #FFD700)',
                      backgroundSize: '200% 200%',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {results.winner.username}
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-3xl font-bold mb-2"
                    style={{ color: '#E3B341' }}
                  >
                    IS THE CHAMPION! 🏆
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="inline-block px-8 py-4 rounded-2xl mt-4"
                    style={{ background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.2), rgba(255, 215, 0, 0.1))' }}
                  >
                    <p className="text-sm font-semibold mb-1" style={{ color: '#8A93A6' }}>
                      Final Balance
                    </p>
                    <p className="text-4xl font-black" style={{ color: '#28C76F' }}>
                      ${results.winner.finalBalance.toLocaleString()}
                    </p>
                    <p className="text-lg font-bold mt-1" style={{ color: '#E3B341' }}>
                      +${results.winner.profit.toLocaleString()} profit
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Phase 3: Summary */}
            {phase === 'summary' && (
              <motion.div
                key="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 px-8"
              >
                <h2 className="text-3xl font-black text-center mb-6" style={{ color: '#E3B341' }}>
                  Tournament Results
                </h2>

                {/* Top 3 Podium */}
                <div className="mb-8 flex justify-center items-end gap-4">
                  {results.topThree.map((player, idx) => {
                    const medal = getRankMedal(player.rank);
                    const heights = ['h-32', 'h-40', 'h-28'];
                    const Medal = medal.icon;

                    return (
                      <motion.div
                        key={player.rank}
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.2 }}
                        className={`flex flex-col items-center justify-end ${heights[idx]} w-32`}
                      >
                        <Medal className="w-8 h-8 mb-2" style={{ color: medal.color }} />
                        <div className={`w-full ${heights[idx]} rounded-t-xl p-3 flex flex-col items-center justify-between`}
                          style={{ background: `linear-gradient(to top, ${medal.color}30, ${medal.color}10)`, border: `2px solid ${medal.color}` }}
                        >
                          <div className="text-center">
                            <p className="font-bold text-sm mb-1" style={{ color: '#C9D1E2' }}>
                              {player.username}
                            </p>
                            <p className="text-xs font-semibold" style={{ color: medal.color }}>
                              ${player.finalBalance.toLocaleString()}
                            </p>
                          </div>
                          <p className="text-2xl font-black" style={{ color: medal.color }}>
                            #{player.rank}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* User Result (if participated) */}
                {results.userRank && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))', border: '1px solid #6366F1' }}
                  >
                    <p className="text-center text-lg font-bold" style={{ color: '#C9D1E2' }}>
                      Your Result: <span style={{ color: '#6366F1' }}>#{results.userRank}</span> out of {results.totalParticipants}
                    </p>
                    {results.userProfit !== undefined && (
                      <p className="text-center mt-1" style={{ color: results.userProfit >= 0 ? '#28C76F' : '#FF4F58' }}>
                        {results.userProfit >= 0 ? '+' : ''}${results.userProfit.toLocaleString()} profit
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Close Button */}
                <Button
                  onClick={onClose}
                  className="w-full h-14 text-lg font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #E3B341, #FFD700)',
                    color: '#091525',
                  }}
                >
                  Awesome! 🎉
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
