import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { Task } from '../types/Task';

interface DailyPlannerProps {
  tasks: Task[];
}

export function DailyPlanner({ tasks }: DailyPlannerProps) {
  const today = new Date();
  const todayString = today.toDateString();
  
  // Get today's tasks and sort by priority and deadline
  const todaysTasks = tasks
    .filter(task => !task.completed)
    .filter(task => {
      if (!task.deadline) return true; // Include tasks without deadline
      return task.deadline.toDateString() === todayString;
    })
    .sort((a, b) => {
      // Sort by priority first, then by deadline
      if (a.priority !== b.priority) return b.priority - a.priority;
      if (a.deadline && b.deadline) return a.deadline.getTime() - b.deadline.getTime();
      if (a.deadline && !b.deadline) return -1;
      if (!a.deadline && b.deadline) return 1;
      return 0;
    });

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

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Today's Plan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {today.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </CardHeader>
        <CardContent>
          {todaysTasks.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <div className="text-4xl">☀️</div>
              <p className="text-blue-600">No scheduled tasks for today!</p>
              <p className="text-sm text-blue-500">Perfect day to relax or tackle unscheduled tasks.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-white/50 rounded-xl border border-white/30 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm leading-tight">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {getPriorityLabel(task.priority)}
                    </Badge>
                  </div>
                  
                  {task.deadline && (
                    <div className="flex items-center gap-1 text-xs text-blue-600">
                      <Clock className="h-3 w-3" />
                      Due: {formatTime(task.deadline)}
                    </div>
                  )}
                </motion.div>
              ))}
              
              <div className="pt-2 border-t border-white/20">
                <p className="text-xs text-center text-blue-600">
                  {todaysTasks.length} task{todaysTasks.length !== 1 ? 's' : ''} planned
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}