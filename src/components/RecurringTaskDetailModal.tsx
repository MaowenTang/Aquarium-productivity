import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types/Task';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  X, 
  CheckCircle2, 
  Repeat, 
  Calendar,
  Clock,
  Flag,
  FileText,
  Bell,
  Edit,
  History
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { 
  getRecurrenceDescription, 
  formatNextOccurrence,
  isOccurrenceDueToday,
  isOccurrenceOverdue 
} from '../utils/recurringTasks';

interface RecurringTaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onCompleteOccurrence: (taskId: string) => void;
  onEdit?: (task: Task) => void;
}

export function RecurringTaskDetailModal({
  task,
  isOpen,
  onClose,
  onCompleteOccurrence,
  onEdit
}: RecurringTaskDetailModalProps) {
  if (!task || !task.isRecurring) return null;

  const handleCompleteOccurrence = () => {
    onCompleteOccurrence(task.id);
    onClose();
    toast.success('Occurrence completed! 🎉', {
      description: `Next occurrence: ${formatNextOccurrence(task.nextOccurrence)}`,
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

  const getReminderText = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes before`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hour${Math.floor(minutes / 60) > 1 ? 's' : ''} before`;
    return `${Math.floor(minutes / 1440)} day${Math.floor(minutes / 1440) > 1 ? 's' : ''} before`;
  };

  const isDueToday = isOccurrenceDueToday(task.nextOccurrence);
  const isOverdue = isOccurrenceOverdue(task.nextOccurrence);

  const completedCount = task.occurrences?.filter(o => o.completed).length || 0;

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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[120]"
            onClick={onClose}
          />

          {/* Modal */}
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
                       w-full md:w-[540px] md:max-w-[90vw]
                       bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50
                       dark:from-slate-800 dark:to-slate-900
                       rounded-t-3xl md:rounded-3xl 
                       shadow-2xl border-2 border-purple-200/50 dark:border-purple-700/50
                       backdrop-blur-xl
                       z-[121]
                       overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient Wave Decoration */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400" />
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-slate-700/80 
                         backdrop-blur-sm border border-purple-200 dark:border-slate-600
                         flex items-center justify-center
                         hover:bg-white dark:hover:bg-slate-700 transition-all
                         hover:scale-110 active:scale-95"
            >
              <X className="h-4 w-4 text-purple-700 dark:text-purple-300" />
            </button>

            {/* Content */}
            <div className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 pr-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                               flex items-center justify-center flex-shrink-0"
                  >
                    <Repeat className="h-6 w-6 text-white" />
                  </motion.div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-medium text-purple-900 dark:text-purple-100 leading-tight">
                      {task.title}
                    </h2>
                    <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                      Recurring Task
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={`${getPriorityColor(task.priority)} border-2 px-3 py-1`}
                  >
                    <Flag className="h-3 w-3 mr-1.5" />
                    {getPriorityLabel(task.priority)}
                  </Badge>

                  {isDueToday && (
                    <Badge 
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200 border-2 px-3 py-1"
                    >
                      <Clock className="h-3 w-3 mr-1.5" />
                      Due Today
                    </Badge>
                  )}

                  {isOverdue && (
                    <Badge 
                      variant="outline"
                      className="bg-red-50 text-red-700 border-red-200 border-2 px-3 py-1"
                    >
                      Overdue
                    </Badge>
                  )}
                </div>
              </div>

              {/* Recurrence Pattern */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 
                           dark:from-purple-900/20 dark:to-pink-900/20
                           border-2 border-purple-200 dark:border-purple-700 backdrop-blur-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 
                                  flex items-center justify-center flex-shrink-0">
                    <Repeat className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-purple-700 dark:text-purple-400 mb-1">
                      Recurrence Pattern
                    </p>
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                      {task.recurrence ? getRecurrenceDescription(task.recurrence) : 'Custom schedule'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Next Occurrence */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 
                           border-2 border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 
                                flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Next Occurrence</p>
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {task.nextOccurrence 
                      ? task.nextOccurrence.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })
                      : 'No upcoming occurrences'
                    }
                  </p>
                  <p className="text-xs text-blue-500 dark:text-blue-400 mt-0.5">
                    {formatNextOccurrence(task.nextOccurrence)}
                  </p>
                </div>
              </motion.div>

              {/* Description */}
              {task.description && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 
                             border-2 border-blue-200/50 dark:border-blue-700/50 backdrop-blur-sm"
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

              {/* Reminder */}
              {task.reminderBefore !== undefined && task.reminderBefore > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 
                             dark:from-amber-900/20 dark:to-orange-900/20
                             border-2 border-amber-200 dark:border-amber-700 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 
                                  flex items-center justify-center flex-shrink-0">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Reminder</p>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {getReminderText(task.reminderBefore)}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Completion History */}
              {completedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 
                             dark:from-green-900/20 dark:to-emerald-900/20
                             border-2 border-green-200 dark:border-green-700 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 
                                    flex items-center justify-center flex-shrink-0">
                      <History className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-green-700 dark:text-green-400 font-medium">Completion History</p>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        {completedCount} occurrence{completedCount !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                  </div>
                  
                  {/* Recent completions */}
                  {task.occurrences && task.occurrences.length > 0 && (
                    <div className="space-y-1 mt-3 max-h-32 overflow-y-auto">
                      {task.occurrences
                        .filter(o => o.completed)
                        .slice(-5)
                        .reverse()
                        .map((occ, index) => (
                          <div 
                            key={index}
                            className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300"
                          >
                            <CheckCircle2 className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {new Date(occ.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-purple-200/30 dark:border-purple-700/30 bg-purple-50/50 dark:bg-slate-800/50">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                {/* Complete This Occurrence */}
                {task.nextOccurrence && (
                  <Button
                    onClick={handleCompleteOccurrence}
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-500 
                               hover:from-green-600 hover:to-emerald-600
                               text-white font-medium rounded-xl
                               shadow-lg shadow-green-200 dark:shadow-green-900/30
                               hover:shadow-xl hover:scale-[1.02] active:scale-95
                               transition-all duration-200"
                  >
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Complete This Occurrence
                  </Button>
                )}

                {/* Edit Recurrence (Optional) */}
                {onEdit && (
                  <Button
                    onClick={() => {
                      onEdit(task);
                      onClose();
                    }}
                    variant="outline"
                    className="w-full h-12 border-2 border-purple-300 dark:border-purple-700
                               text-purple-700 dark:text-purple-300 font-medium rounded-xl
                               hover:bg-purple-50 dark:hover:bg-purple-900/30
                               hover:scale-[1.02] active:scale-95
                               transition-all duration-200"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Edit Recurrence
                  </Button>
                )}

                {/* Close */}
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-12 border-2 border-blue-300 dark:border-blue-700
                             text-blue-700 dark:text-blue-300 font-medium rounded-xl
                             hover:bg-blue-50 dark:hover:bg-blue-900/30
                             hover:scale-[1.02] active:scale-95
                             transition-all duration-200"
                >
                  Close
                </Button>
              </motion.div>
            </div>

            {/* Decorative wave pattern */}
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none overflow-hidden opacity-20">
              <svg
                className="absolute bottom-0 w-full h-full"
                viewBox="0 0 1200 120"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,60 C150,90 350,30 600,60 C850,90 1050,30 1200,60 L1200,120 L0,120 Z"
                  fill="url(#waveGradientRecurring)"
                />
                <defs>
                  <linearGradient id="waveGradientRecurring" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#06b6d4" />
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
