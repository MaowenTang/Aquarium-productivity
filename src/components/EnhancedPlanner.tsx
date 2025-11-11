import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { PlannerTaskDetailModal } from './PlannerTaskDetailModal';

import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Circle,
  ArrowUp,
  ArrowDown,
  Flame,
  Target,
  Briefcase,
  Coffee,
  Sparkles,
  Repeat
} from 'lucide-react';
import { Task } from '../types/Task';
import { generateTaskPlan, TaskRecommendation } from '../utils/aiPlanning';
import { RecurringTasksList } from './RecurringTasksList';
import { completeCurrentOccurrence } from '../utils/recurringTasks';

interface EnhancedPlannerProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
  onChangePriority: (id: string, priority: number) => void;
}

export function EnhancedPlanner({ tasks, onCompleteTask, onChangePriority }: EnhancedPlannerProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'timeline' | 'priority' | 'stats'>('timeline');
  const [busyMode, setBusyMode] = useState<'busy' | 'notbusy' | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTaskRecommendation, setSelectedTaskRecommendation] = useState<TaskRecommendation | null>(null);

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  // Generate AI recommendations
  const planningResult = generateTaskPlan(tasks);
  const recommendations = planningResult.recommendations;

  // Get tasks for selected date
  const getTasksForDate = (date: Date) => {
    const dateString = date.toDateString();
    return activeTasks.filter(task => {
      if (!task.deadline) return true; // Show tasks without deadline
      return task.deadline.toDateString() === dateString;
    });
  };

  const todaysTasks = getTasksForDate(selectedDate);
  const overdueTasks = activeTasks.filter(task => 
    task.deadline && task.deadline < new Date() && task.deadline.toDateString() !== new Date().toDateString()
  );

  // Priority grouping
  const tasksByPriority = {
    high: activeTasks.filter(task => task.priority === 3),
    medium: activeTasks.filter(task => task.priority === 2),
    low: activeTasks.filter(task => task.priority === 1),
  };

  // Stats calculations
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  const todayCompletion = todaysTasks.length > 0 ? 
    (todaysTasks.filter(task => task.completed).length / todaysTasks.length) * 100 : 0;

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const TaskCard = ({ task, showTime = true }: { task: Task, showTime?: boolean }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-white/60 rounded-xl border border-white/40 space-y-3 hover:bg-white/80 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCompleteTask(task.id)}
              className="h-6 w-6 rounded-full hover:bg-green-100"
            >
              <Circle className="h-4 w-4 text-blue-600" />
            </Button>
            <h4 className="font-medium leading-tight">{task.title}</h4>
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground ml-8 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getPriorityColor(task.priority)}>
            {getPriorityLabel(task.priority)}
          </Badge>
          
          <div className="flex flex-col gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChangePriority(task.id, Math.min(3, task.priority + 1))}
              className="h-4 w-4 hover:bg-blue-100"
            >
              <ArrowUp className="h-3 w-3 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onChangePriority(task.id, Math.max(1, task.priority - 1))}
              className="h-4 w-4 hover:bg-blue-100"
            >
              <ArrowDown className="h-3 w-3 text-blue-600" />
            </Button>
          </div>
        </div>
      </div>
      
      {task.deadline && showTime && (
        <div className="flex items-center gap-2 text-sm text-blue-600 ml-8">
          <Clock className="h-3 w-3" />
          <span>
            {task.deadline.toDateString() === new Date().toDateString() 
              ? `Today at ${formatTime(task.deadline)}`
              : `${task.deadline.toLocaleDateString()} at ${formatTime(task.deadline)}`
            }
          </span>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Header with date navigation */}
      <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Task Planner
            </div>
            <div className="text-sm text-blue-600">
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-sm border border-white/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{activeTasks.length}</div>
            <div className="text-sm text-muted-foreground">Active Tasks</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm border border-white/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm border border-white/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
            <div className="text-sm text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm border border-white/30">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{Math.round(completionRate)}%</div>
            <div className="text-sm text-muted-foreground">Completion</div>
          </CardContent>
        </Card>
      </div>

      {/* Recurring Tasks Section */}
      {tasks.some(t => t.isRecurring) && (
        <Card className="backdrop-blur-sm border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <Repeat className="h-5 w-5 text-purple-600" />
              Recurring Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecurringTasksList
              tasks={tasks}
              onCompleteOccurrence={(taskId) => {
                // Handle recurring task completion
                onCompleteTask(taskId);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="priority" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Priority
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          {/* Overdue Tasks */}
          {overdueTasks.length > 0 && (
            <Card className="backdrop-blur-sm border-2 border-red-200 bg-red-50/50">
              <CardHeader>
                <CardTitle className="text-red-700 flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Overdue Tasks ({overdueTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnimatePresence>
                  {overdueTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </AnimatePresence>
              </CardContent>
            </Card>
          )}

          {/* Today's Tasks */}
          <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
            <CardHeader className="space-y-4">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Today's Schedule - AI Recommended
              </CardTitle>
              
              {/* Busy/Not Busy Toggle Buttons */}
              {activeTasks.length > 0 && (
                <div className="flex gap-3">
                  <Button
                    onClick={() => setBusyMode('busy')}
                    variant={busyMode === 'busy' ? 'default' : 'outline'}
                    className={`flex-1 rounded-xl h-11 ${
                      busyMode === 'busy'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
                        : 'border-2 border-orange-300 text-orange-700 hover:bg-orange-50 bg-white/60'
                    } transition-all duration-200`}
                  >
                    <Briefcase className="h-4 w-4 mr-2" />
                    I'm busy today
                  </Button>
                  
                  <Button
                    onClick={() => setBusyMode('notbusy')}
                    variant={busyMode === 'notbusy' ? 'default' : 'outline'}
                    className={`flex-1 rounded-xl h-11 ${
                      busyMode === 'notbusy'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                        : 'border-2 border-green-300 text-green-700 hover:bg-green-50 bg-white/60'
                    } transition-all duration-200`}
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    I'm not busy today
                  </Button>
                </div>
              )}
              
              {busyMode && recommendations.length > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-600">
                    Showing {busyMode === 'busy' ? 'top priority tasks' : 'all recommended tasks'}
                  </span>
                  <span className="text-muted-foreground">
                    {busyMode === 'busy' 
                      ? `${Math.min(3, recommendations.length)} tasks` 
                      : `${recommendations.length} tasks`
                    }
                  </span>
                </div>
              )}
            </CardHeader>
            
            <CardContent>
              {activeTasks.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="text-6xl"
                  >
                    🌊
                  </motion.div>
                  <p className="text-blue-600">
                    All tasks completed! Your ocean is perfectly calm.
                  </p>
                </div>
              ) : !busyMode ? (
                <div className="text-center py-12 space-y-4">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-5xl"
                  >
                    👆
                  </motion.div>
                  <p className="text-blue-600 max-w-md mx-auto">
                    Choose your availability above to see AI-recommended tasks for today
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {recommendations
                      .slice(0, busyMode === 'busy' ? 3 : recommendations.length)
                      .map((rec, index) => {
                        const estimatedTime = rec.task.description?.match(/(\d+)\s*(min|hour)/i);
                        const duration = estimatedTime 
                          ? parseInt(estimatedTime[1]) * (estimatedTime[2].toLowerCase().includes('hour') ? 60 : 1)
                          : null;
                        
                        return (
                          <motion.div
                            key={rec.task.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => {
                              setSelectedTask(rec.task);
                              setSelectedTaskRecommendation(rec);
                            }}
                            className="p-4 bg-white/70 rounded-xl border-2 border-blue-200/50 
                                       hover:border-blue-300 hover:bg-white/90 hover:shadow-lg
                                       cursor-pointer transition-all duration-200 space-y-3
                                       hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {rec.task.completed ? (
                                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <Circle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                  )}
                                  <h4 className={`font-medium leading-tight ${
                                    rec.task.completed ? 'line-through text-muted-foreground' : ''
                                  }`}>
                                    {rec.task.title}
                                  </h4>
                                </div>
                                
                                {/* AI Reason */}
                                <div className="ml-7 mb-2">
                                  <p className="text-xs text-purple-700 bg-purple-50 inline-block px-2 py-1 rounded-md">
                                    {rec.reason}
                                  </p>
                                </div>
                                
                                {rec.task.description && (
                                  <p className="text-sm text-muted-foreground ml-7 line-clamp-2">
                                    {rec.task.description}
                                  </p>
                                )}
                              </div>
                              
                              <Badge 
                                variant="outline" 
                                className={getPriorityColor(rec.task.priority)}
                              >
                                {getPriorityLabel(rec.task.priority)}
                              </Badge>
                            </div>
                            
                            {rec.task.deadline && (
                              <div className="flex items-center gap-2 text-sm text-blue-600 ml-7">
                                <Clock className="h-3 w-3" />
                                <span>
                                  {rec.task.deadline.toDateString() === new Date().toDateString() 
                                    ? `Today at ${formatTime(rec.task.deadline)}`
                                    : rec.task.deadline.toLocaleDateString()
                                  }
                                </span>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          {/* High Priority */}
          <Card className="backdrop-blur-sm border-2 border-red-200 bg-red-50/30">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                High Priority ({tasksByPriority.high.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {tasksByPriority.high.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              {tasksByPriority.high.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No high priority tasks</p>
              )}
            </CardContent>
          </Card>

          {/* Medium Priority */}
          <Card className="backdrop-blur-sm border-2 border-blue-200 bg-blue-50/30">
            <CardHeader>
              <CardTitle className="text-blue-700 flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Medium Priority ({tasksByPriority.medium.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {tasksByPriority.medium.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              {tasksByPriority.medium.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No medium priority tasks</p>
              )}
            </CardContent>
          </Card>

          {/* Low Priority */}
          <Card className="backdrop-blur-sm border-2 border-green-200 bg-green-50/30">
            <CardHeader>
              <CardTitle className="text-green-700 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Low Priority ({tasksByPriority.low.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <AnimatePresence>
                {tasksByPriority.low.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </AnimatePresence>
              {tasksByPriority.low.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No low priority tasks</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-6">
            {/* Completion Progress */}
            <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Productivity Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Overall Completion</span>
                    <span>{Math.round(completionRate)}%</span>
                  </div>
                  <Progress value={completionRate} className="h-3" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Today's Progress</span>
                    <span>{Math.round(todayCompletion)}%</span>
                  </div>
                  <Progress value={todayCompletion} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Tasks Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{activeTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Tasks Remaining</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-red-600">High Priority</span>
                    <span className="font-medium">{tasksByPriority.high.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-600">Medium Priority</span>
                    <span className="font-medium">{tasksByPriority.medium.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600">Low Priority</span>
                    <span className="font-medium">{tasksByPriority.low.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Task Detail Modal */}
      <PlannerTaskDetailModal
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setSelectedTaskRecommendation(null);
        }}
        onComplete={onCompleteTask}
        estimatedDuration={selectedTaskRecommendation ? 
          (selectedTaskRecommendation.task.description?.match(/(\d+)\s*(min|hour)/i) 
            ? parseInt(selectedTaskRecommendation.task.description.match(/(\d+)\s*(min|hour)/i)![1]) * 
              (selectedTaskRecommendation.task.description.match(/(\d+)\s*(min|hour)/i)![2].toLowerCase().includes('hour') ? 60 : 1)
            : null
          ) : null
        }
        aiReason={selectedTaskRecommendation?.reason}
      />
    </div>
  );
}