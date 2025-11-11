import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types/Task';
import { TaskDetailModal } from './TaskDetailModal';
import { PlannerTaskDetailModal } from './PlannerTaskDetailModal';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  X, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target,
  TrendingUp,
  Calendar,
  Award,
  Flame
} from 'lucide-react';
import { sortTasksByUrgency } from '../utils/urgencySystem';

interface TaskListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tasks: Task[];
  type: 'active' | 'completed' | 'due-today' | 'analytics';
  onCompleteTask: (id: string) => void;
  allTasks?: Task[]; // For analytics
}

export function TaskListModal({ 
  isOpen, 
  onClose, 
  title, 
  tasks, 
  type,
  onCompleteTask,
  allTasks = []
}: TaskListModalProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  const formatTime = (date: Date | null) => {
    if (!date) return 'No deadline';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'No deadline';
    const today = new Date().toDateString();
    const tomorrow = new Date(Date.now() + 86400000).toDateString();
    
    if (date.toDateString() === today) return 'Today';
    if (date.toDateString() === tomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Calculate analytics data
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.completed);
  const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  
  // Calculate streak (simplified - count recent completions)
  const recentCompletions = completedTasks
    .filter(t => t.createdAt)
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 7);

  const getHeaderIcon = () => {
    switch (type) {
      case 'active': return <Target className="h-6 w-6 text-blue-500" />;
      case 'completed': return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'due-today': return <Clock className="h-6 w-6 text-orange-500" />;
      case 'analytics': return <TrendingUp className="h-6 w-6 text-purple-500" />;
    }
  };

  const getEmptyMessage = () => {
    switch (type) {
      case 'active': return { emoji: '🌊', text: 'No active tasks. Your ocean is calm!' };
      case 'completed': return { emoji: '📝', text: 'No completed tasks yet. Start checking them off!' };
      case 'due-today': return { emoji: '☀️', text: 'No tasks due today. Enjoy your free time!' };
      default: return { emoji: '📊', text: 'No data available' };
    }
  };

  // Sort tasks by urgency for active and due-today views
  const sortedTasks = (type === 'active' || type === 'due-today') 
    ? sortTasksByUrgency(tasks).map(u => u.task)
    : tasks;

  const renderAnalytics = () => (
    <div className="space-y-4">
      {/* Overall Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20
                   rounded-2xl border-2 border-purple-200 dark:border-purple-700"
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                          flex items-center justify-center">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">Overall Progress</h3>
            <p className="text-sm text-purple-600 dark:text-purple-300">
              {completedTasks.length} of {totalTasks} tasks completed
            </p>
          </div>
        </div>
        <Progress value={completionRate} className="h-3 mb-2" />
        <div className="flex justify-between text-sm">
          <span className="text-purple-700 dark:text-purple-300">Completion Rate</span>
          <span className="font-bold text-purple-900 dark:text-purple-100">{Math.round(completionRate)}%</span>
        </div>
      </motion.div>

      {/* Task Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border-2 border-blue-200 
                     dark:border-blue-700 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {allTasks.filter(t => !t.completed).length}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">Active Tasks</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border-2 border-green-200 
                     dark:border-green-700 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {completedTasks.length}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300 mt-1">Completed</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border-2 border-red-200 
                     dark:border-red-700 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {allTasks.filter(t => t.priority === 3 && !t.completed).length}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300 mt-1">High Priority</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border-2 border-orange-200 
                     dark:border-orange-700 backdrop-blur-sm"
        >
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              {allTasks.filter(t => t.deadline && t.deadline.toDateString() === new Date().toDateString()).length}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">Due Today</div>
          </div>
        </motion.div>
      </div>

      {/* Recent Completions */}
      {recentCompletions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 bg-white/60 dark:bg-slate-800/60 rounded-xl border-2 border-green-200 
                     dark:border-green-700 backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900 dark:text-green-100">Recent Achievements</h3>
          </div>
          <div className="space-y-2">
            {recentCompletions.slice(0, 5).map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-green-800 dark:text-green-200 truncate">{task.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderTaskList = () => (
    <div className="space-y-3">
      <AnimatePresence mode="popLayout">
        {sortedTasks.map((task, index) => {
          const urgency = type === 'active' || type === 'due-today' 
            ? sortTasksByUrgency([task])[0]
            : null;

          return (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedTask(task)}
              className="p-4 bg-white/70 dark:bg-slate-800/70 rounded-xl border-2 border-blue-200/50 
                         dark:border-blue-700/50 hover:border-blue-300 dark:hover:border-blue-600
                         hover:bg-white/90 dark:hover:bg-slate-800/90 hover:shadow-lg
                         cursor-pointer transition-all duration-200 space-y-2
                         hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium leading-tight mb-1 ${
                      task.completed ? 'line-through text-muted-foreground' : 'text-blue-900 dark:text-blue-100'
                    }`}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <Badge 
                  variant="outline" 
                  className={`${getPriorityColor(task.priority)} flex-shrink-0`}
                >
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>

              {/* Deadline Info */}
              {task.deadline && (
                <div className="flex items-center gap-4 ml-8 text-sm">
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(task.deadline)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{formatTime(task.deadline)}</span>
                  </div>
                </div>
              )}

              {/* Urgency indicator for active/due-today tasks */}
              {urgency && urgency.state !== 'normal' && (
                <div className="ml-8">
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      urgency.state === 'overdue' || urgency.state === 'urgent'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    {urgency.state === 'overdue' ? '⚠️ Overdue' :
                     urgency.state === 'urgent' ? '🚨 Urgent' : '⏰ Due Soon'}
                  </Badge>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );

  return (
    <>
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

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ 
                type: 'spring', 
                damping: 25, 
                stiffness: 300 
              }}
              className="fixed inset-x-4 bottom-4 top-20 md:inset-auto md:top-1/2 md:left-1/2 
                         md:-translate-x-1/2 md:-translate-y-1/2 
                         md:w-[600px] md:max-w-[90vw] md:max-h-[85vh]
                         bg-gradient-to-br from-blue-50 to-cyan-50
                         dark:from-slate-800 dark:to-slate-900
                         rounded-3xl 
                         shadow-2xl border-2 border-blue-200/50 dark:border-blue-700/50
                         backdrop-blur-xl
                         z-[101]
                         overflow-hidden
                         flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Ocean Wave Decoration */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400" />
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-blue-200/30 dark:border-blue-700/30">
                <div className="flex items-center gap-3">
                  {getHeaderIcon()}
                  <div>
                    <h2 className="text-2xl font-medium text-blue-900 dark:text-blue-100">
                      {title}
                    </h2>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      {type === 'analytics' 
                        ? 'Your productivity overview'
                        : `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/80 dark:bg-slate-700/80 
                             backdrop-blur-sm border border-blue-200 dark:border-slate-600
                             flex items-center justify-center
                             hover:bg-white dark:hover:bg-slate-700 transition-all
                             hover:scale-110 active:scale-95"
                >
                  <X className="h-5 w-5 text-blue-700 dark:text-blue-300" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                {type === 'analytics' ? (
                  renderAnalytics()
                ) : tasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.2 }}
                      className="text-7xl"
                    >
                      {getEmptyMessage().emoji}
                    </motion.div>
                    <p className="text-blue-600 dark:text-blue-400 text-center max-w-sm">
                      {getEmptyMessage().text}
                    </p>
                  </div>
                ) : (
                  renderTaskList()
                )}
              </div>

              {/* Footer - Back Button */}
              <div className="p-6 border-t border-blue-200/30 dark:border-blue-700/30 bg-blue-50/50 dark:bg-slate-800/50">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-12 border-2 border-blue-300 dark:border-blue-700
                             text-blue-700 dark:text-blue-300 font-medium rounded-xl
                             hover:bg-blue-50 dark:hover:bg-blue-900/30
                             hover:scale-[1.02] active:scale-95
                             transition-all duration-200"
                >
                  Back to Dashboard
                </Button>
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <PlannerTaskDetailModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onComplete={onCompleteTask}
        />
      )}
    </>
  );
}
