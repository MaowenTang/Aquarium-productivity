import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, AlertCircle, AlertTriangle, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { TaskUrgency, getUrgencyMessage } from '../utils/urgencySystem';

interface UrgencyToastProps {
  urgentTasks: TaskUrgency[];
  onDismiss: (taskId: string) => void;
  onViewTask: (taskId: string) => void;
}

export function UrgencyToast({ urgentTasks, onDismiss, onViewTask }: UrgencyToastProps) {
  // Show only the most urgent tasks (max 3)
  const tasksToShow = urgentTasks.slice(0, 3);

  if (tasksToShow.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      <AnimatePresence mode="popLayout">
        {tasksToShow.map((urgency) => (
          <motion.div
            key={urgency.task.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`
              backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden
              ${urgency.state === 'overdue' 
                ? 'bg-red-500/90 border-2 border-red-300' 
                : urgency.state === 'urgent'
                ? 'bg-rose-500/90 border-2 border-rose-300'
                : 'bg-amber-500/90 border-2 border-amber-300'
              }
            `}
          >
            {/* Animated pulse background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />

            <div className="relative p-4">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0">
                  {urgency.state === 'overdue' ? (
                    <AlertCircle className="h-6 w-6 text-white" />
                  ) : urgency.state === 'urgent' ? (
                    <AlertTriangle className="h-6 w-6 text-white" />
                  ) : (
                    <Bell className="h-6 w-6 text-white" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-white truncate">
                      {urgency.task.title}
                    </h4>
                    <span className="text-2xl flex-shrink-0">
                      {urgency.state === 'overdue' ? '🚨' : urgency.state === 'urgent' ? '⏰' : '⚠️'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white/90 mb-2">
                    {getUrgencyMessage(urgency)}
                  </p>

                  {urgency.task.description && (
                    <p className="text-xs text-white/70 truncate mb-3">
                      {urgency.task.description}
                    </p>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onViewTask(urgency.task.id)}
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border border-white/30 rounded-xl text-xs"
                    >
                      View Task
                    </Button>
                    <Button
                      onClick={() => onDismiss(urgency.task.id)}
                      size="sm"
                      variant="ghost"
                      className="text-white hover:bg-white/20 rounded-xl text-xs"
                    >
                      Dismiss
                    </Button>
                  </div>
                </div>

                {/* Close button */}
                <button
                  onClick={() => onDismiss(urgency.task.id)}
                  className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Progress bar showing time remaining */}
            {urgency.state !== 'overdue' && urgency.task.deadline && (
              <motion.div
                className="h-1 bg-white/30"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{
                  duration: Math.max(urgency.timeUntilDue / 1000, 1),
                  ease: 'linear'
                }}
                style={{ transformOrigin: 'left' }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
