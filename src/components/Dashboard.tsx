import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { BubbleVisualization } from './BubbleVisualization';
import { MeditationModule } from './MeditationModule';
import { UrgencyToast } from './UrgencyToast';
import { AIPlanningAssistant } from './AIPlanningAssistant';
import { TaskListModal } from './TaskListModal';
import { Task } from '../types/Task';
import { sortTasksByUrgency, TaskUrgency } from '../utils/urgencySystem';
import { 
  Calendar, 
  Brain, 
  TrendingUp, 
  CheckCircle2, 
  Clock,
  Zap,
  Target
} from 'lucide-react';

interface DashboardProps {
  user: string;
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void;
  onCompleteTask: (id: string) => void;
  onChangePriority: (id: string, priority: number) => void;
  onUpdateTasks?: (tasks: Task[]) => void;
  onLogout: () => void;
}

export function Dashboard({ 
  user, 
  tasks, 
  onAddTask, 
  onCompleteTask, 
  onChangePriority,
  onUpdateTasks,
  onLogout 
}: DashboardProps) {
  const [showPlanner, setShowPlanner] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());
  const [activeModal, setActiveModal] = useState<'active' | 'completed' | 'due-today' | 'analytics' | null>(null);

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const todaysTasks = activeTasks.filter(task => {
    if (!task.deadline) return false;
    return task.deadline.toDateString() === new Date().toDateString();
  });
  const overdueTasks = activeTasks.filter(task => 
    task.deadline && task.deadline < new Date()
  );

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  // Calculate urgent tasks for notifications
  const urgentTaskUrgencies = sortTasksByUrgency(activeTasks)
    .filter(urgency => 
      urgency.reminderTriggered && 
      !dismissedNotifications.has(urgency.task.id)
    );

  // Auto-refresh urgency calculations every minute
  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update urgency states
      setDismissedNotifications(prev => new Set(prev));
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  const handleDismissNotification = (taskId: string) => {
    setDismissedNotifications(prev => new Set(prev).add(taskId));
  };

  const handleViewTask = (taskId: string) => {
    // Dismiss notification and optionally scroll to task
    handleDismissNotification(taskId);
    // You could add scroll-to-task logic here if desired
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-light text-blue-800">
          Welcome to your Ocean, {user.split('@')[0]}
        </h1>
        <p className="text-blue-600">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </motion.div>

      {/* Quick Stats Dashboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Tasks Card - Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setActiveModal('active')}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.97 }}
          className="cursor-pointer"
        >
          <Card className="glass-card-light hover:shadow-xl hover:border-blue-300 transition-all duration-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-2xl font-bold text-blue-600">{activeTasks.length}</span>
              </div>
              <div className="text-sm text-blue-700">Active Tasks</div>
              <div className="text-xs text-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to view
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completed Card - Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => setActiveModal('completed')}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.97 }}
          className="cursor-pointer"
        >
          <Card className="glass-card-light hover:shadow-xl hover:border-green-300 transition-all duration-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-2xl font-bold text-green-600">{completedTasks.length}</span>
              </div>
              <div className="text-sm text-green-700">Completed</div>
              <div className="text-xs text-green-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to view
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Due Today Card - Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setActiveModal('due-today')}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.97 }}
          className="cursor-pointer"
        >
          <Card className="glass-card-light hover:shadow-xl hover:border-orange-300 transition-all duration-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-orange-500 mr-2" />
                <span className="text-2xl font-bold text-orange-600">{todaysTasks.length}</span>
              </div>
              <div className="text-sm text-orange-700">Due Today</div>
              <div className="text-xs text-orange-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to view
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Completion Card - Clickable */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => setActiveModal('analytics')}
          whileHover={{ scale: 1.05, y: -4 }}
          whileTap={{ scale: 0.97 }}
          className="cursor-pointer"
        >
          <Card className="glass-card-light hover:shadow-xl hover:border-purple-300 transition-all duration-200">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-purple-500 mr-2" />
                <span className="text-2xl font-bold text-purple-600">{Math.round(completionRate)}%</span>
              </div>
              <div className="text-sm text-purple-700">Completion</div>
              <div className="text-xs text-purple-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Tap to view
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-2 border-red-300 bg-red-50/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Attention Needed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600 mb-3">
                You have {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''} that need your attention.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowPlanner(true)}
                  size="sm"
                  className="bg-red-500 hover:bg-red-600 rounded-xl"
                >
                  View in Planner
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Urgency Notifications */}
      <UrgencyToast
        urgentTasks={urgentTaskUrgencies}
        onDismiss={handleDismissNotification}
        onViewTask={handleViewTask}
      />

      {/* AI Planning Assistant Button/Card - Positioned before bubble ocean */}
      {activeTasks.length > 0 && onUpdateTasks && (
        <AIPlanningAssistant
          tasks={tasks}
          onApplyPlan={onUpdateTasks}
        />
      )}

      {/* Main Bubble Ocean */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="relative min-h-[500px] rounded-3xl overflow-hidden glass-card"
      >
        <BubbleVisualization
          tasks={tasks}
          onCompleteTask={onCompleteTask}
          onChangePriority={onChangePriority}
        />
      </motion.div>

      {/* Today's Focus Section */}
      {todaysTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass-card-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                Today's Focus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todaysTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-white/30 rounded-xl"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      {task.deadline && (
                        <p className="text-xs text-blue-600">
                          Due: {task.deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      )}
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        task.priority === 3 ? 'border-red-300 text-red-700' :
                        task.priority === 2 ? 'border-blue-300 text-blue-700' :
                        'border-green-300 text-green-700'
                      }
                    >
                      {task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low'}
                    </Badge>
                  </div>
                ))}
                {todaysTasks.length > 3 && (
                  <div className="text-center pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPlanner(true)}
                      className="text-blue-600 hover:bg-blue-50 rounded-xl"
                    >
                      View all {todaysTasks.length} tasks
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Actions for Empty State */}
      {activeTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="glass-card-light">
            <CardContent className="py-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <Button
                  onClick={() => setShowMeditation(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 rounded-xl"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start Meditation
                </Button>
                <Button
                  onClick={() => setShowPlanner(true)}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 rounded-xl"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Plan Your Day
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Meditation Module */}
      <MeditationModule
        isOpen={showMeditation}
        onClose={() => setShowMeditation(false)}
      />

      {/* Active Tasks Modal */}
      {activeModal === 'active' && (
        <TaskListModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Active Tasks"
          tasks={activeTasks}
          type="active"
          onCompleteTask={onCompleteTask}
          allTasks={tasks}
        />
      )}

      {/* Completed Tasks Modal */}
      {activeModal === 'completed' && (
        <TaskListModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Completed Tasks"
          tasks={completedTasks}
          type="completed"
          onCompleteTask={onCompleteTask}
          allTasks={tasks}
        />
      )}

      {/* Due Today Modal */}
      {activeModal === 'due-today' && (
        <TaskListModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Tasks Due Today"
          tasks={todaysTasks}
          type="due-today"
          onCompleteTask={onCompleteTask}
          allTasks={tasks}
        />
      )}

      {/* Analytics Modal */}
      {activeModal === 'analytics' && (
        <TaskListModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          title="Productivity Analytics"
          tasks={[]}
          type="analytics"
          onCompleteTask={onCompleteTask}
          allTasks={tasks}
        />
      )}
    </div>
  );
}