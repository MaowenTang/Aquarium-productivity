import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types/Task';
import { TaskUrgency, formatTimeRemaining } from '../utils/urgencySystem';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, X, Clock, Calendar, Flag, FileText, Timer, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface TaskDetailModalProps {
  task: Task | null;
  urgency: TaskUrgency | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
}

export function TaskDetailModal({ task, urgency, isOpen, onClose, onComplete }: TaskDetailModalProps) {
  if (!task || !urgency) return null;

  const handleComplete = () => {
    onComplete(task.id);
    onClose();
    toast.success('Task completed! 🎉');
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'High Priority';
      case 2: return 'Medium Priority';
      case 1: return 'Low Priority';
      default: return 'Normal';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700';
      case 2: return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-700';
      case 1: return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-700';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityShortLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'H';
      case 2: return 'M';
      case 1: return 'L';
      default: return 'N';
    }
  };

  const formatDeadline = (deadline: Date) => {
    const now = new Date();
    const isToday = deadline.toDateString() === now.toDateString();
    const isTomorrow = deadline.toDateString() === new Date(now.getTime() + 86400000).toDateString();
    
    const timeString = deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `Today at ${timeString}`;
    if (isTomorrow) return `Tomorrow at ${timeString}`;
    
    return deadline.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99998]"
            onClick={onClose}
          />

          {/* Modal - Bottom Sheet on Mobile, Centered on Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: 0.3 
            }}
            className="fixed 
                       bottom-0 left-0 right-0
                       md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       w-full md:w-[360px] md:max-w-[90vw]
                       bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50
                       dark:from-slate-800 dark:via-slate-900 dark:to-slate-800
                       rounded-t-2xl md:rounded-xl 
                       shadow-2xl border border-blue-200/50 dark:border-blue-700/50
                       backdrop-blur-xl
                       z-[99999]
                       overflow-hidden
                       max-h-[85vh] md:max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ocean Wave Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/80 dark:bg-slate-700/80 
                         backdrop-blur-sm border border-blue-200 dark:border-slate-600
                         flex items-center justify-center
                         hover:bg-white dark:hover:bg-slate-700 transition-all
                         hover:scale-110 active:scale-95"
            >
              <X className="h-3 w-3 text-blue-700 dark:text-blue-300" />
            </button>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3 pb-2 space-y-3">
                {/* Header with emoji and title */}
                <div className="space-y-1.5 pr-7">
                  <div className="flex items-start gap-2">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="text-2xl flex-shrink-0"
                    >
                      🫧
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-blue-900 dark:text-blue-100 leading-tight break-words">
                        {task.title}
                      </h2>
                    </div>
                  </div>

                  {/* Priority Badge */}
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getPriorityColor(task.priority)} border px-2 py-0.5 font-medium text-xs`}
                    >
                      <Flag className="h-2.5 w-2.5 mr-1" />
                      {getPriorityLabel(task.priority)} ({getPriorityShortLabel(task.priority)})
                    </Badge>
                  </div>
                </div>

                {/* Task Details */}
                <div className="space-y-2">
                  {/* Due Time */}
                  {task.deadline && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-2 p-2.5 rounded-lg bg-white/60 dark:bg-slate-800/60 
                                 border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm"
                    >
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 
                                      flex items-center justify-center flex-shrink-0">
                        <Clock className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Due Time</p>
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          {formatDeadline(task.deadline)}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {/* Time Remaining */}
                  {urgency.timeUntilDue !== null && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className={`flex items-center gap-2 p-2.5 rounded-lg backdrop-blur-sm border
                                 ${urgency.state === 'overdue' || urgency.state === 'urgent'
                                   ? 'bg-orange-50/80 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                                   : urgency.state === 'warning'
                                   ? 'bg-yellow-50/80 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700'
                                   : 'bg-blue-50/80 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
                                 }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                                      ${urgency.state === 'overdue' || urgency.state === 'urgent'
                                        ? 'bg-gradient-to-br from-orange-400 to-red-400'
                                        : urgency.state === 'warning'
                                        ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
                                        : 'bg-gradient-to-br from-blue-400 to-cyan-400'
                                      }`}>
                        <Calendar className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium
                                      ${urgency.state === 'overdue' || urgency.state === 'urgent'
                                        ? 'text-orange-700 dark:text-orange-400'
                                        : urgency.state === 'warning'
                                        ? 'text-yellow-700 dark:text-yellow-400'
                                        : 'text-blue-600 dark:text-blue-400'
                                      }`}>
                          {urgency.state === 'overdue' ? 'Overdue' : 'Time Remaining'}
                        </p>
                        <p className={`text-sm font-semibold
                                      ${urgency.state === 'overdue' || urgency.state === 'urgent'
                                        ? 'text-orange-900 dark:text-orange-200'
                                        : urgency.state === 'warning'
                                        ? 'text-yellow-900 dark:text-yellow-200'
                                        : 'text-blue-900 dark:text-blue-100'
                                      }`}>
                          {formatTimeRemaining(urgency.timeUntilDue)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Description Section */}
                {task.description && task.description.trim() && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 }}
                    className="flex items-start gap-2 p-2.5 rounded-lg bg-gradient-to-br from-purple-50/80 to-pink-50/80 
                               dark:from-purple-900/20 dark:to-pink-900/20
                               border border-purple-200/50 dark:border-purple-700/50 backdrop-blur-sm"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 
                                    flex items-center justify-center flex-shrink-0">
                      <FileText className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0 max-h-20 overflow-y-auto">
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-0.5">Description</p>
                      <p className="text-xs text-purple-900 dark:text-purple-100 leading-relaxed whitespace-pre-wrap break-words">
                        {task.description}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Additional Info Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="grid grid-cols-2 gap-2"
                >
                  {/* Creation Date */}
                  {task.createdAt && (
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 
                                    border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Sparkles className="h-2.5 w-2.5 text-blue-500" />
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Created</p>
                      </div>
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                        {new Date(task.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Estimated Duration (extracted from description if exists) */}
                  {task.description && task.description.match(/(\d+)\s*(min|minute|hour|hr)/i) && (
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-slate-800/60 
                                    border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Timer className="h-2.5 w-2.5 text-cyan-500" />
                        <p className="text-xs text-cyan-600 dark:text-cyan-400 font-medium">Duration</p>
                      </div>
                      <p className="text-xs font-semibold text-cyan-900 dark:text-cyan-100">
                        {task.description.match(/(\d+)\s*(min|minute|hour|hr)/i)?.[0] || 'N/A'}
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>

            {/* Fixed Bottom Section with Buttons */}
            <div className="border-t border-blue-200/30 dark:border-blue-700/30 bg-blue-50/50 dark:bg-slate-800/50 backdrop-blur-sm p-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="flex flex-col gap-2"
              >
                {/* Mark as Completed Button - Primary */}
                <Button
                  onClick={handleComplete}
                  className="w-full h-9 bg-gradient-to-r from-green-500 to-emerald-500 
                             hover:from-green-600 hover:to-emerald-600
                             text-white font-semibold rounded-lg text-sm
                             shadow-lg shadow-green-200 dark:shadow-green-900/30
                             hover:shadow-xl hover:scale-[1.02] active:scale-[0.97]
                             transition-all duration-200"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                  Mark as Completed
                </Button>

                {/* Not Yet Button - Secondary */}
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-8 border border-blue-300 dark:border-blue-700
                             text-blue-700 dark:text-blue-300 font-medium rounded-lg text-sm
                             bg-white/50 dark:bg-slate-800/50
                             hover:bg-blue-50 dark:hover:bg-blue-900/30
                             hover:scale-[1.02] active:scale-[0.97]
                             transition-all duration-200"
                >
                  Not Yet
                </Button>
              </motion.div>
            </div>

            {/* Decorative wave pattern at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none overflow-hidden opacity-10">
              <svg
                className="absolute bottom-0 w-full h-full"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z"
                  fill="url(#waveGradient)"
                />
                <defs>
                  <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}