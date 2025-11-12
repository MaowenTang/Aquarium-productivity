import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types/Task';
import { RecurringTaskDetailModal } from './RecurringTaskDetailModal';
import { Badge } from './ui/badge';
import { 
  Repeat, 
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  getRecurrenceDescription, 
  formatNextOccurrence,
  isOccurrenceDueToday,
  isOccurrenceOverdue 
} from '../utils/recurringTasks';

interface RecurringTasksListProps {
  tasks: Task[];
  onCompleteOccurrence: (taskId: string) => void;
  onEditTask?: (task: Task) => void;
}

export function RecurringTasksList({ 
  tasks, 
  onCompleteOccurrence,
  onEditTask 
}: RecurringTasksListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const recurringTasks = tasks.filter(task => task.isRecurring);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'bg-red-100 text-red-800 border-red-200';
      case 2: return 'bg-blue-100 text-blue-800 border-blue-200';
      case 1: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Normal';
    }
  };

  if (recurringTasks.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-6xl"
        >
          🔄
        </motion.div>
        <div>
          <p className="text-blue-600 dark:text-blue-400">No recurring tasks yet</p>
          <p className="text-sm text-blue-500 dark:text-blue-500 mt-1">
            Create a task and enable "Repeat" to add recurring tasks
          </p>
        </div>
      </div>
    );
  }

  // Sort by next occurrence date
  const sortedTasks = [...recurringTasks].sort((a, b) => {
    if (!a.nextOccurrence) return 1;
    if (!b.nextOccurrence) return -1;
    return new Date(a.nextOccurrence).getTime() - new Date(b.nextOccurrence).getTime();
  });

  return (
    <>
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedTasks.map((task, index) => {
            const isDueToday = isOccurrenceDueToday(task.nextOccurrence);
            const isOverdue = isOccurrenceOverdue(task.nextOccurrence);
            const completedCount = task.occurrences?.filter(o => o.completed).length || 0;

            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedTask(task)}
                className="group relative p-4 rounded-2xl border-2 transition-all duration-200
                           cursor-pointer hover:scale-[1.02] active:scale-[0.98]
                           bg-gradient-to-br from-purple-50/80 to-pink-50/80
                           dark:from-purple-900/20 dark:to-pink-900/20
                           border-purple-200/50 dark:border-purple-700/50
                           hover:border-purple-300 dark:hover:border-purple-600
                           hover:shadow-lg backdrop-blur-sm"
              >
                {/* Recurring indicator ribbon */}
                <div className="absolute top-0 right-0 w-20 h-20 overflow-hidden">
                  <div className="absolute top-3 right-[-30px] rotate-45 
                                  bg-gradient-to-r from-purple-500 to-pink-500 
                                  text-white text-[10px] font-medium 
                                  py-1 px-8 shadow-lg">
                    REPEAT
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 
                                    flex items-center justify-center flex-shrink-0
                                    group-hover:scale-110 transition-transform">
                      <Repeat className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-16">
                      <h4 className="font-medium text-purple-900 dark:text-purple-100 leading-tight mb-1">
                        {task.title}
                      </h4>
                      
                      {task.description && (
                        <p className="text-sm text-purple-700/70 dark:text-purple-300/70 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Recurrence Info */}
                  <div className="flex items-center gap-2 ml-13">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg 
                                    bg-white/60 dark:bg-slate-800/60 border border-purple-200/50">
                      <Repeat className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                        {task.recurrence ? getRecurrenceDescription(task.recurrence) : 'Custom'}
                      </span>
                    </div>

                    <Badge 
                      variant="outline" 
                      className={`${getPriorityColor(task.priority)} text-xs`}
                    >
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </div>

                  {/* Next Occurrence */}
                  <div className="ml-13 space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        Next: {formatNextOccurrence(task.nextOccurrence)}
                      </span>
                      
                      {isDueToday && (
                        <Badge 
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-orange-200 text-xs"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Today
                        </Badge>
                      )}
                      
                      {isOverdue && (
                        <Badge 
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 text-xs"
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>

                    {task.nextOccurrence && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {new Date(task.nextOccurrence).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                  </div>

                  {/* Completion Stats */}
                  {completedCount > 0 && (
                    <div className="ml-13 flex items-center gap-2 text-xs text-green-700 dark:text-green-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{completedCount} occurrence{completedCount !== 1 ? 's' : ''} completed</span>
                    </div>
                  )}
                </div>

                {/* Hover overlay effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-400/0 to-pink-400/0 
                                group-hover:from-purple-400/5 group-hover:to-pink-400/5 
                                transition-all duration-200 pointer-events-none" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Task Detail Modal */}
      <RecurringTaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onCompleteOccurrence={onCompleteOccurrence}
        onEdit={onEditTask}
      />
    </>
  );
}
