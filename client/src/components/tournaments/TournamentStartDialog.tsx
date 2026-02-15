import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Zap, TrendingUp, Clock, DollarSign, Users } from "lucide-react";

interface TournamentStartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: {
    id: number;
    name: string;
    buyIn: number;
    prizePool: number;
    startingBalance: number;
    endsAt: string;
    participantCount: number;
  };
}

export function TournamentStartDialog({ isOpen, onClose, tournament }: TournamentStartDialogProps) {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 24) {
      return `${Math.floor(diffHours / 24)} days`;
    } else if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m`;
    } else {
      return `${diffMins} minutes`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden" style={{ backgroundColor: '#06121F', borderColor: '#E3B341', border: '2px solid' }}>
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 6 + 2,
                height: Math.random() * 6 + 2,
                left: `${Math.random() * 100}%`,
                background: 'radial-gradient(circle, #E3B341, transparent)',
              }}
              animate={{
                y: ['-10%', '110%'],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                delay: Math.random() * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </div>

        <div className="relative">
          {/* Header with Trophy Animation */}
          <div className="relative px-8 pt-8 pb-6 text-center">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
              className="inline-block mb-4"
            >
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{ background: 'radial-gradient(circle, rgba(227, 179, 65, 0.6), transparent)' }}
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
                <Trophy className="w-20 h-20 relative z-10" style={{ color: '#E3B341' }} />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black mb-2"
              style={{
                background: 'linear-gradient(135deg, #E3B341, #FFD700, #E3B341)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Tournament Started! 🎉
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl font-bold"
              style={{ color: '#C9D1E2' }}
            >
              {tournament.name}
            </motion.p>
          </div>

          {/* Tournament Details Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="px-8 pb-6"
          >
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(227, 179, 65, 0.1), rgba(227, 179, 65, 0.05))' }}>
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5" style={{ color: '#E3B341' }} />
                  <span className="text-sm font-semibold" style={{ color: '#8A93A6' }}>Starting Balance</span>
                </div>
                <p className="text-2xl font-black" style={{ color: '#E3B341' }}>
                  ${tournament.startingBalance.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(40, 199, 111, 0.1), rgba(40, 199, 111, 0.05))' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5" style={{ color: '#28C76F' }} />
                  <span className="text-sm font-semibold" style={{ color: '#8A93A6' }}>Prize Pool</span>
                </div>
                <p className="text-2xl font-black" style={{ color: '#28C76F' }}>
                  ${tournament.prizePool.toLocaleString()}
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05))' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5" style={{ color: '#6366F1' }} />
                  <span className="text-sm font-semibold" style={{ color: '#8A93A6' }}>Time Remaining</span>
                </div>
                <p className="text-2xl font-black" style={{ color: '#6366F1' }}>
                  {formatTime(tournament.endsAt)}
                </p>
              </div>

              <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(255, 79, 88, 0.1), rgba(255, 79, 88, 0.05))' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5" style={{ color: '#FF4F58' }} />
                  <span className="text-sm font-semibold" style={{ color: '#8A93A6' }}>Competitors</span>
                </div>
                <p className="text-2xl font-black" style={{ color: '#FF4F58' }}>
                  {tournament.participantCount}
                </p>
              </div>
            </div>

            {/* Guidelines */}
            <div className="p-6 rounded-xl mb-6" style={{ backgroundColor: '#0F172A', border: '1px solid #1F2937' }}>
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5" style={{ color: '#E3B341' }} />
                <h3 className="text-lg font-bold" style={{ color: '#E3B341' }}>Quick Guidelines</h3>
              </div>
              <ul className="space-y-3 text-sm" style={{ color: '#C9D1E2' }}>
                <li className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#28C76F' }} />
                  <span>Trade stocks to grow your portfolio above your starting balance</span>
                </li>
                <li className="flex items-start gap-2">
                  <Trophy className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#E3B341' }} />
                  <span>The trader with the highest portfolio value at the end wins</span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#6366F1' }} />
                  <span>All trades must be completed before the tournament ends</span>
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#E3B341' }} />
                  <span>Your tournament balance is separate from your main account</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <Button
              onClick={onClose}
              className="w-full h-14 text-lg font-bold"
              style={{
                background: 'linear-gradient(135deg, #E3B341, #FFD700)',
                color: '#06121F',
              }}
            >
              Let's Trade! 🚀
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
