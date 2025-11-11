import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types/Task';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, X, Clock, Calendar, Flag, FileText, Timer } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface PlannerTaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (id: string) => void;
  estimatedDuration?: number | null;
  aiReason?: string;
}

export function PlannerTaskDetailModal({ 
  task, 
  isOpen, 
  onClose, 
  onComplete,
  estimatedDuration,
  aiReason
}: PlannerTaskDetailModalProps) {
  if (!task) return null;

  const handleComplete = () => {
    onComplete(task.id);
    onClose();
    toast.success('Task completed! 🎉', {
      description: `"${task.title}" has been marked as complete.`,
    });
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
      case 3: return 'text-red-700 bg-red-50 border-red-200';
      case 2: return 'text-blue-700 bg-blue-50 border-blue-200';
      case 1: return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const formatDeadline = (deadline: Date | null) => {
    if (!deadline) return 'No deadline set';
    
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal - Bottom Sheet on Mobile, Center on Desktop */}
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
            className="fixed bottom-0 md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       w-full md:w-[520px] md:max-w-[90vw]
                       bg-gradient-to-br from-blue-50 to-cyan-50
                       dark:from-slate-800 dark:to-slate-900
                       rounded-t-3xl md:rounded-3xl 
                       shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50
                       backdrop-blur-xl
                       z-[101]
                       overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ocean Wave Decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-700/80 
                         backdrop-blur-sm border border-blue-200 dark:border-slate-600
                         flex items-center justify-center
                         hover:bg-white dark:hover:bg-slate-700 transition-all
                         hover:scale-110 active:scale-95"
            >
              <X className="h-4 w-4 text-blue-700 dark:text-blue-300" />
            </button>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
              {/* Header with title */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 pr-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="text-4xl flex-shrink-0 mt-1"
                  >
                    📋
                  </motion.div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-medium text-blue-900 dark:text-blue-100 leading-tight">
                      {task.title}
                    </h2>
                  </div>
                </div>

                {/* Status and Priority Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={`${getPriorityColor(task.priority)} border-2 px-3 py-1`}
                  >
                    <Flag className="h-3 w-3 mr-1.5" />
                    {getPriorityLabel(task.priority)}
                  </Badge>
                  
                  {task.completed && (
                    <Badge 
                      variant="outline" 
                      className="text-green-700 bg-green-50 border-green-200 border-2 px-3 py-1"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1.5" />
                      Completed
                    </Badge>
                  )}
                </div>
              </div>

              {/* AI Recommendation (if provided) */}
              {aiReason && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 
                             dark:from-purple-900/20 dark:to-pink-900/20
                             border border-purple-200 dark:border-purple-700 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🤖</span>
                    <div className="flex-1">
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
                        AI Recommendation
                      </p>
                      <p className="text-sm text-purple-900 dark:text-purple-200">
                        {aiReason}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Task Details */}
              <div className="space-y-3">
                {/* Description */}
                {task.description && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 
                               border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 
                                    flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Description</p>
                      <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
                        {task.description}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Due Time */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/60 dark:bg-slate-800/60 
                             border border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 
                                  flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Due Date</p>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {formatDeadline(task.deadline)}
                    </p>
                  </div>
                </motion.div>

                {/* Estimated Duration */}
                {estimatedDuration && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 
                               dark:from-cyan-900/20 dark:to-blue-900/20
                               border border-cyan-200 dark:border-cyan-700 backdrop-blur-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 
                                    flex items-center justify-center flex-shrink-0">
                      <Timer className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-cyan-700 dark:text-cyan-400 font-medium">Estimated Duration</p>
                      <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">
                        {estimatedDuration < 60 
                          ? `${estimatedDuration} minutes`
                          : `${Math.floor(estimatedDuration / 60)}h ${estimatedDuration % 60}m`
                        }
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Created Date */}
                {task.createdAt && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/40 dark:bg-slate-800/40 
                               border border-blue-200/30 dark:border-blue-700/30 backdrop-blur-sm"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 
                                    dark:from-slate-600 dark:to-slate-700
                                    flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Created</p>
                      <p className="text-sm text-slate-800 dark:text-slate-200">
                        {new Date(task.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col gap-3 pt-2"
              >
                {/* Mark as Completed Button - Only show if not already completed */}
                {!task.completed && (
                  <Button
                    onClick={handleComplete}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 
                               hover:from-green-600 hover:to-emerald-600
                               text-white font-medium rounded-xl
                               shadow-lg shadow-green-200 dark:shadow-green-900/30
                               hover:shadow-xl hover:scale-[1.02] active:scale-95
                               transition-all duration-200"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Mark as Completed
                  </Button>
                )}

                {/* Go Back Button */}
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-12 border-2 border-blue-300 dark:border-blue-700
                             text-blue-700 dark:text-blue-300 font-medium rounded-xl
                             hover:bg-blue-50 dark:hover:bg-blue-900/30
                             hover:scale-[1.02] active:scale-95
                             transition-all duration-200"
                >
                  {task.completed ? 'Go Back' : 'Not Yet'}
                </Button>
              </motion.div>

              {/* Bottom spacing for mobile */}
              <div className="h-2 md:h-0" />
            </div>

            {/* Decorative wave pattern at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden opacity-20">
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
