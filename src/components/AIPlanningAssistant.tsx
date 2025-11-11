import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types/Task';
import { generateTaskPlan, applyRecommendations, hasSignificantChanges, TaskRecommendation } from '../utils/aiPlanning';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Sparkles, Wand2, Clock, TrendingUp, CheckCircle, X, Loader2, Lightbulb } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface AIPlanningAssistantProps {
  tasks: Task[];
  onApplyPlan: (updatedTasks: Task[]) => void;
}

export function AIPlanningAssistant({ tasks, onApplyPlan }: AIPlanningAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [planResult, setPlanResult] = useState<ReturnType<typeof generateTaskPlan> | null>(null);
  const { mode } = useTheme();

  const activeTasks = tasks.filter(t => !t.completed);

  const handleAnalyze = () => {
    setIsOpen(true);
    setIsAnalyzing(true);
    
    // Simulate AI thinking time for better UX
    setTimeout(() => {
      const result = generateTaskPlan(tasks);
      setPlanResult(result);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleApply = () => {
    if (!planResult) return;

    const updatedTasks = applyRecommendations(tasks, planResult.recommendations);
    onApplyPlan(updatedTasks);
    
    setIsOpen(false);
    setPlanResult(null);
    
    // Show success toast
    toast.success('Planning Complete', {
      description: 'Task priorities have been optimized for maximum productivity',
      duration: 4000,
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    setPlanResult(null);
    setIsAnalyzing(false);
  };

  const hasChanges = planResult ? hasSignificantChanges(planResult.recommendations) : false;

  if (activeTasks.length === 0) {
    return null; // Don't show if no active tasks
  }

  return (
    <>
      {/* Assistant Button Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-4"
      >
        <Card 
          className="cursor-pointer backdrop-blur-md border-2 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
            borderColor: 'rgba(139, 92, 246, 0.3)'
          }}
          onClick={handleAnalyze}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 
                             flex items-center justify-center shadow-lg"
                >
                  <Sparkles className="h-5 w-5 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-violet-900 dark:text-violet-200 flex items-center gap-2">
                    AI Planning Assistant
                    <Badge variant="outline" className="text-xs border-violet-400 text-violet-700 dark:text-violet-300 bg-violet-50/50 dark:bg-violet-900/30">
                      Beta
                    </Badge>
                  </h3>
                  <p className="text-xs text-violet-700 dark:text-violet-400">
                    Get smart task order suggestions
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <Wand2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </motion.div>
            </div>
            
            {/* Stats Preview */}
            <div className="flex items-center gap-3 mt-3 text-xs text-violet-600 dark:text-violet-400">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                <span>{activeTasks.length} tasks to optimize</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal/Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
              onClick={handleClose}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] md:max-h-[80vh]"
            >
              <Card className="rounded-t-3xl md:rounded-3xl md:max-w-2xl md:mx-auto md:mb-8 shadow-2xl border-2 overflow-hidden"
                    style={{
                      background: 'var(--theme-surfaceBase)',
                      borderColor: 'var(--theme-border)'
                    }}>
                <CardHeader className="pb-3 border-b"
                           style={{
                             background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
                             borderColor: 'var(--theme-borderSubtle)'
                           }}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                      </motion.div>
                      <span style={{ color: 'var(--theme-textPrimary)' }}>
                        AI Task Planning
                      </span>
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="h-8 w-8 p-0 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 max-h-[calc(85vh-120px)] md:max-h-[calc(80vh-120px)] overflow-y-auto">
                  {isAnalyzing ? (
                    <AnalyzingState />
                  ) : planResult ? (
                    <PlanningResults 
                      result={planResult}
                      hasChanges={hasChanges}
                      onApply={handleApply}
                      onClose={handleClose}
                    />
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Analyzing State Component
function AnalyzingState() {
  return (
    <div className="space-y-6 py-8">
      <div className="flex flex-col items-center justify-center text-center">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 
                     flex items-center justify-center shadow-xl"
        >
          <Wand2 className="h-8 w-8 text-white" />
        </motion.div>
        
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--theme-textPrimary)' }}>
          Analyzing Your Tasks...
        </h3>
        <p className="text-sm" style={{ color: 'var(--theme-textSecondary)' }}>
          AI is evaluating deadlines, priorities, and task complexity
        </p>
      </div>

      {/* Loading Shimmer Items */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="h-20 rounded-2xl overflow-hidden"
            style={{ background: 'var(--theme-glassBackground)' }}
          >
            <motion.div
              className="h-full w-full bg-gradient-to-r from-transparent via-violet-400/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Planning Results Component
interface PlanningResultsProps {
  result: ReturnType<typeof generateTaskPlan>;
  hasChanges: boolean;
  onApply: () => void;
  onClose: () => void;
}

function PlanningResults({ result, hasChanges, onApply, onClose }: PlanningResultsProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(167, 139, 250, 0.1) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.2)'
        }}
      >
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-violet-600 dark:text-violet-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-violet-900 dark:text-violet-200 mb-1">
              Recommendation Summary
            </h4>
            <p className="text-sm text-violet-700 dark:text-violet-300">
              {result.summary}
            </p>
          </div>
        </div>
      </motion.div>

      {/* No Changes Message */}
      {!hasChanges && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(52, 211, 153, 0.1) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Your current priorities are already optimal!
            </p>
          </div>
        </motion.div>
      )}

      {/* Task List Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold" style={{ color: 'var(--theme-textPrimary)' }}>
          Suggested Order
        </h4>
        <Badge variant="outline" className="text-xs">
          {result.recommendations.length} tasks
        </Badge>
      </div>

      {/* Task Recommendations */}
      <div className="space-y-2">
        {result.recommendations.map((rec, index) => (
          <TaskRecommendationItem 
            key={rec.task.id} 
            recommendation={rec} 
            index={index}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 sticky bottom-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pb-2">
        <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onApply}
            disabled={!hasChanges}
            className="w-full h-12 rounded-xl shadow-lg text-white"
            style={{
              background: hasChanges 
                ? 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)'
                : 'rgba(156, 163, 175, 0.5)'
            }}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {hasChanges ? 'Apply Suggestions' : 'Already Optimized'}
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.98 }}>
          <Button
            onClick={onClose}
            variant="outline"
            className="h-12 px-6 rounded-xl"
          >
            Close
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// Task Recommendation Item
interface TaskRecommendationItemProps {
  recommendation: TaskRecommendation;
  index: number;
}

function TaskRecommendationItem({ recommendation, index }: TaskRecommendationItemProps) {
  const { task, recommendedPriority, reason, urgencyScore } = recommendation;
  const isChanged = task.priority !== recommendedPriority;

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: 'text-red-700 dark:text-red-400' };
      case 2: return { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: 'text-blue-700 dark:text-blue-400' };
      default: return { bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.3)', text: 'text-green-700 dark:text-green-400' };
    }
  };

  const colors = getPriorityColor(recommendedPriority);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="p-4 rounded-2xl border-2 backdrop-blur-sm"
      style={{
        background: colors.bg,
        borderColor: colors.border
      }}
    >
      <div className="flex items-start gap-3">
        {/* Order Number */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${colors.text}`}
             style={{ background: colors.border }}>
          {index + 1}
        </div>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h5 className={`font-semibold ${colors.text}`}>
              {task.title}
            </h5>
            {isChanged && (
              <Badge variant="outline" className="text-xs border-violet-400 text-violet-700 dark:text-violet-300 bg-violet-50/50 dark:bg-violet-900/30 flex-shrink-0">
                Priority Change
              </Badge>
            )}
          </div>
          
          <p className={`text-xs ${colors.text} opacity-80 mb-2`}>
            {reason}
          </p>

          {/* Priority Indicator */}
          <div className="flex items-center gap-2">
            {isChanged && (
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    task.priority === 3 ? 'bg-red-500' :
                    task.priority === 2 ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <span className="text-gray-600 dark:text-gray-400">P{task.priority}</span>
                </div>
                <span className="text-gray-400">→</span>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${
                    recommendedPriority === 3 ? 'bg-red-500' :
                    recommendedPriority === 2 ? 'bg-blue-500' : 'bg-green-500'
                  }`} />
                  <span className={colors.text}>P{recommendedPriority}</span>
                </div>
              </div>
            )}
            
            {/* Urgency Score */}
            <div className={`ml-auto text-xs ${colors.text} flex items-center gap-1`}>
              <TrendingUp className="h-3 w-3" />
              <span>{urgencyScore}% urgent</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
