import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartyPopper, Megaphone, AlertCircle, Gift, Trophy, Sparkles, X } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'celebration' | 'urgent';
  effect: 'none' | 'confetti' | 'poop' | 'snow' | 'fireworks' | 'sparkles';
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

interface AnnouncementModalProps {
  announcements: Announcement[];
  onDismiss: (id: number) => void;
}

export function AnnouncementModal({ announcements, onDismiss }: AnnouncementModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [effectTriggered, setEffectTriggered] = useState(false);

  const activeAnnouncements = announcements.filter(a => a.isActive);
  const currentAnnouncement = activeAnnouncements[currentIndex];

  useEffect(() => {
    if (activeAnnouncements.length > 0) {
      setOpen(true);
    }
  }, [activeAnnouncements.length]);

  useEffect(() => {
    if (currentAnnouncement && !effectTriggered) {
      triggerEffect(currentAnnouncement.effect);
      setEffectTriggered(true);
    }
  }, [currentAnnouncement, effectTriggered]);

  const triggerEffect = (effect: string) => {
    switch (effect) {
      case 'confetti':
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 200);
        break;

      case 'poop':
        // Poop emoji rain
        const poopCount = 30;
        const poopEmoji = '💩';
        for (let i = 0; i < poopCount; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 1,
              startVelocity: 0,
              ticks: 200,
              origin: {
                x: Math.random(),
                y: 0
              },
              shapes: ['circle'],
              scalar: 3,
              gravity: 0.5,
              colors: ['#8B4513', '#654321']
            });
          }, i * 50);
        }
        break;

      case 'snow':
        // Snowflake effect
        const duration = 5000;
        const animationEnd = Date.now() + duration;
        const snowInterval = setInterval(() => {
          const timeLeft = animationEnd - Date.now();
          if (timeLeft <= 0) {
            clearInterval(snowInterval);
            return;
          }
          confetti({
            particleCount: 2,
            startVelocity: 0,
            ticks: 200,
            origin: {
              x: Math.random(),
              y: -0.1
            },
            colors: ['#ffffff', '#e0f2fe', '#bae6fd'],
            shapes: ['circle'],
            gravity: 0.3,
            scalar: 0.8,
            drift: Math.random() - 0.5
          });
        }, 50);
        break;

      case 'fireworks':
        const fireworksCount = 5;
        for (let i = 0; i < fireworksCount; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 100,
              spread: 360,
              startVelocity: 30,
              origin: {
                x: Math.random(),
                y: Math.random() * 0.5
              },
              colors: ['#FF6B35', '#F7931E', '#FDC830', '#E3B341', '#28C76F', '#06B6D4', '#8B5CF6']
            });
          }, i * 400);
        }
        break;

      case 'sparkles':
        // Golden sparkles
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            confetti({
              particleCount: 5,
              angle: 90,
              spread: 360,
              origin: { x: Math.random(), y: Math.random() },
              colors: ['#E3B341', '#FDC830', '#F7931E', '#FFD700'],
              shapes: ['star'],
              scalar: 1.2,
              gravity: 0.5,
              ticks: 100
            });
          }, i * 100);
        }
        break;

      case 'none':
      default:
        break;
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'celebration':
        return <PartyPopper className="h-6 w-6 text-primary" />;
      case 'warning':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'urgent':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'success':
        return <Trophy className="h-6 w-6 text-green-500" />;
      default:
        return <Megaphone className="h-6 w-6 text-primary" />;
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'celebration':
        return { backgroundColor: '#E3B341', color: '#080C14' };
      case 'warning':
        return { backgroundColor: '#FDC830', color: '#080C14' };
      case 'urgent':
        return { backgroundColor: '#FF4F58', color: '#FFFFFF' };
      case 'success':
        return { backgroundColor: '#28C76F', color: '#FFFFFF' };
      default:
        return { backgroundColor: '#06B6D4', color: '#FFFFFF' };
    }
  };

  const handleNext = () => {
    if (currentIndex < activeAnnouncements.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setEffectTriggered(false);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    if (currentAnnouncement) {
      onDismiss(currentAnnouncement.id);
    }
    setOpen(false);
    setCurrentIndex(0);
    setEffectTriggered(false);
  };

  if (!currentAnnouncement) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px]" style={{ backgroundColor: '#0C1A2E', borderColor: '#0E2040' }}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-3">
              {getIcon(currentAnnouncement.type)}
              <span style={{ color: '#F1F5F9' }}>{currentAnnouncement.title}</span>
            </DialogTitle>
            <Badge style={getBadgeColor(currentAnnouncement.type)} className="text-xs font-semibold">
              {currentAnnouncement.type.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentAnnouncement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <DialogDescription className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#C9D1E2' }}>
              {currentAnnouncement.message}
            </DialogDescription>

            {currentAnnouncement.expiresAt && (
              <div className="flex items-center gap-2 text-sm" style={{ color: '#8A93A6' }}>
                <AlertCircle className="h-4 w-4" />
                <span>This message expires on {new Date(currentAnnouncement.expiresAt).toLocaleDateString()}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4">
              <div className="text-sm" style={{ color: '#8A93A6' }}>
                {activeAnnouncements.length > 1 && (
                  <span>Message {currentIndex + 1} of {activeAnnouncements.length}</span>
                )}
              </div>
              <div className="flex gap-2">
                {currentIndex < activeAnnouncements.length - 1 ? (
                  <>
                    <Button variant="outline" onClick={handleClose} style={{ borderColor: '#2B3A4C', color: '#C9D1E2' }}>
                      Skip All
                    </Button>
                    <Button onClick={handleNext} style={{ backgroundColor: '#E3B341', color: '#080C14' }}>
                      Next Message
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleClose} style={{ backgroundColor: '#E3B341', color: '#080C14' }}>
                    Got It!
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
