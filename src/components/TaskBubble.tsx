import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types/Task';
import { TaskUrgency, getUrgencyColors, getPriorityColors, getUrgencyIcon, formatTimeRemaining } from '../utils/urgencySystem';
import { BubblePosition } from '../utils/bubbleLayout';
import { useTheme } from '../contexts/ThemeContext';
import { TaskDetailModal } from './TaskDetailModal';
import { Bell, Clock, AlertCircle } from 'lucide-react';

interface TaskBubbleProps {
  task: Task;
  urgency: TaskUrgency;
  index: number;
  position?: BubblePosition;
  onComplete: (id: string) => void;
  onPriorityChange: (id: string, priority: number) => void;
}

const SparkleEffect = () => (
  <div className="absolute inset-0 pointer-events-none">
    {Array.from({ length: 8 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-yellow-300 rounded-full"
        style={{
          left: '50%',
          top: '50%',
        }}
        initial={{ scale: 0, opacity: 1 }}
        animate={{
          scale: [0, 1, 0],
          opacity: [1, 1, 0],
          x: [0, (Math.cos((i * Math.PI * 2) / 8) * 40)],
          y: [0, (Math.sin((i * Math.PI * 2) / 8) * 40)],
        }}
        transition={{
          duration: 0.8,
          ease: 'easeOut',
          delay: i * 0.1
        }}
      />
    ))}
  </div>
);

export function TaskBubble({ task, urgency, index, position, onComplete, onPriorityChange }: TaskBubbleProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { mode } = useTheme();

  const getBubbleSize = (priority: number) => {
    switch (priority) {
      case 3: return 'w-[100px] h-[100px] sm:w-[88px] sm:h-[88px]'; // High priority - larger on mobile
      case 2: return 'w-[85px] h-[85px] sm:w-[72px] sm:h-[72px]'; // Medium priority
      case 1: return 'w-[70px] h-[70px] sm:w-[60px] sm:h-[60px]'; // Low priority
      default: return 'w-[85px] h-[85px] sm:w-[72px] sm:h-[72px]';
    }
  };

  const getIconSize = (priority: number) => {
    switch (priority) {
      case 3: return 'text-4xl sm:text-3xl';
      case 2: return 'text-3xl sm:text-2xl';
      case 1: return 'text-2xl sm:text-xl';
      default: return 'text-3xl sm:text-2xl';
    }
  };

  const getPriorityBadgeSize = (priority: number) => {
    switch (priority) {
      case 3: return 'w-7 h-7 text-xs';
      case 2: return 'w-6 h-6 text-xs';
      case 1: return 'w-5 h-5 text-[10px]';
      default: return 'w-6 h-6 text-xs';
    }
  };

  const getBubblePosition = (urgencyLevel: number, taskIndex: number) => {
    // More urgent tasks float higher
    const urgencyY = urgencyLevel * 15; // Each urgency level adds 15% to vertical position
    const baseY = 20 + urgencyY; // Start from 20% from top
    
    // Horizontal positioning with some randomness
    const horizontalSpread = Math.min(window.innerWidth - 150, 700);
    const offset = (taskIndex % 5) * (horizontalSpread / 5);
    const randomOffset = Math.sin(taskIndex * 0.7) * 40;
    
    return { 
      x: 30 + offset + randomOffset, 
      y: Math.max(10, Math.min(85, baseY + (Math.sin(taskIndex * 0.3) * 10)))
    };
  };

  const handleComplete = () => {
    setIsCompleting(true);
    setShowSparkles(true);
    
    // Delay the actual completion to show animation
    setTimeout(() => {
      onComplete(task.id);
    }, 600);
  };

  // Calculate position based on urgency (higher urgency = higher position)
  const urgencyLevel = urgency.state === 'overdue' ? 0 
                     : urgency.state === 'urgent' ? 1
                     : urgency.state === 'warning' ? 2
                     : 3;
  
  // Use calculated position if available, otherwise use fallback
  const fallbackPos = getBubblePosition(urgencyLevel, index);
  const pos = position || fallbackPos;
  
  // Convert position to appropriate format
  const bubbleStyle = position 
    ? { left: pos.x, top: pos.y } 
    : { left: fallbackPos.x, top: `${fallbackPos.y}%` };
  
  // Determine colors based on urgency state and priority
  // If urgent/overdue/warning, use urgency colors (orange for urgent/overdue)
  // Otherwise, use priority-based colors
  const isUrgent = urgency.state === 'overdue' || urgency.state === 'urgent' || urgency.state === 'warning';
  const colors = isUrgent 
    ? getUrgencyColors(urgency.state, mode === 'dark')
    : getPriorityColors(task.priority, mode === 'dark');
  
  const urgencyIcon = getUrgencyIcon(urgency.state);

  // Animation scale based on urgency - urgent bubbles pulse more
  const pulseScale = urgency.state === 'overdue' || urgency.state === 'urgent' 
    ? [1, 1.06, 1]  // Gentle pulse for urgent
    : urgency.state === 'warning'
    ? [1, 1.03, 1]
    : [1, 1.01, 1]; // Very subtle for normal

  const pulseDuration = urgency.state === 'overdue' || urgency.state === 'urgent'
                      ? 1.8  // Faster pulse for urgent
                      : urgency.state === 'warning' ? 2.5
                      : 4;    // Slower pulse for normal

  return (
    <motion.div
      className={`absolute ${getBubbleSize(task.priority)} cursor-pointer z-${urgency.state === 'overdue' ? '50' : urgency.state === 'urgent' ? '40' : urgency.state === 'warning' ? '30' : '10'}`}
      style={bubbleStyle}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: task.completed || isCompleting ? [1, 1.2, 0] : 1,
        opacity: task.completed || isCompleting ? [1, 1, 0] : 1,
        y: [0, -8, 0],
        x: [0, 3, 0],
      }}
      transition={{ 
        duration: 0.5,
        y: { duration: 3 + Math.random() * 1, repeat: Infinity, ease: 'easeInOut' },
        x: { duration: 4 + Math.random() * 1, repeat: Infinity, ease: 'easeInOut' },
      }}
      whileHover={{ 
        scale: 1.15, 
        y: -8,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.9 }}
      onClick={() => setShowModal(true)}
    >
      {/* Urgency notification badge */}
      <AnimatePresence>
        {urgency.reminderTriggered && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-2 -right-2 z-20"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className={`
                w-8 h-8 rounded-full flex items-center justify-center text-lg
                shadow-lg
                ${urgency.state === 'overdue' 
                  ? 'bg-red-500 text-white' 
                  : urgency.state === 'urgent'
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-500 text-white'
                }
              `}
            >
              {urgency.state === 'overdue' || urgency.state === 'urgent' ? (
                <AlertCircle className="h-5 w-5" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className={`w-full h-full rounded-full 
                   backdrop-blur-sm
                   flex items-center justify-center relative overflow-hidden
                   border-2`}
        style={{
          background: colors.gradient,
          borderColor: colors.border,
        }}
        animate={{
          scale: pulseScale,
          boxShadow: [
            `0 4px 15px ${colors.glow}, 0 2px 8px ${colors.glow}`,
            `0 8px 30px ${colors.glow}, 0 4px 15px ${colors.glow}`,
            `0 4px 15px ${colors.glow}, 0 2px 8px ${colors.glow}`
          ]
        }}
        transition={{
          scale: { duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' },
          boxShadow: { duration: pulseDuration, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        {/* Glass highlight effect */}
        <div className="absolute top-2 left-2 w-8 h-8 bg-white/30 rounded-full blur-md" />
        <div className="absolute top-3 left-3 w-4 h-4 bg-white/40 rounded-full blur-sm" />
        
        {/* Sparkle effect on completion */}
        <AnimatePresence>
          {showSparkles && <SparkleEffect />}
        </AnimatePresence>
        
        {/* Task content - Minimalist design */}
        <div className="flex flex-col items-center justify-center z-10 relative w-full h-full px-2">
          {/* Large urgency/task icon */}
          <div className={`${getIconSize(task.priority)} mb-1 drop-shadow-lg`}
               style={{ color: colors.text }}>
            {urgencyIcon}
          </div>
          
          {/* Time indicator for deadline tasks - compact */}
          {task.deadline && urgency.state !== 'normal' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/10 dark:bg-white/10 backdrop-blur-sm"
                 style={{ color: colors.text }}>
              <Clock className="h-3 w-3" />
              <span className="text-[9px] sm:text-[10px] font-bold whitespace-nowrap">
                {formatTimeRemaining(urgency.timeUntilDue)}
              </span>
            </div>
          )}
          
          {/* Tap hint - only on non-urgent tasks */}
          {urgency.state === 'normal' && (
            <div className="text-[8px] sm:text-[9px] opacity-60 mt-1 font-medium"
                 style={{ color: colors.text }}>
              Tap to view
            </div>
          )}
        </div>

        {/* Priority badge - larger and clearer */}
        <div className="absolute top-2 left-2 z-10">
          <motion.div 
            className={`${getPriorityBadgeSize(task.priority)} rounded-full font-bold bg-white/30 dark:bg-black/30 backdrop-blur-sm border-2 border-white/50 shadow-lg flex items-center justify-center`}
            style={{ color: colors.text }}
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
          >
            {task.priority === 3 ? 'H' : task.priority === 2 ? 'M' : 'L'}
          </motion.div>
        </div>

        {/* Task count/index badge - bottom left */}
        <div className="absolute bottom-2 left-2 z-10">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-[9px] sm:text-[10px] font-bold"
               style={{ color: colors.text }}>
            {index + 1}
          </div>
        </div>

        {/* Priority indicator dots - bottom right corner */}
        <div className="absolute bottom-2 right-2 flex gap-0.5 z-10">
          {Array.from({ length: task.priority }).map((_, i) => (
            <motion.div 
              key={i} 
              className="w-1.5 h-1.5 bg-white/90 rounded-full shadow-sm"
              animate={{ scale: [0.8, 1, 0.8], opacity: [0.7, 1, 0.7] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                delay: i * 0.2,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Floating inner particles */}
        <div className="absolute inset-2 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/50 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
              }}
              animate={{
                y: [0, -8, 0],
                x: [0, 4, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </div>

        {/* Urgency pulse ring */}
        {urgency.reminderTriggered && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: colors.border }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 0, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut'
            }}
          />
        )}
      </motion.div>

      {/* Priority adjustment buttons - only visible on hover */}
      <div className="absolute -top-2 -left-2 opacity-0 hover:opacity-100 transition-all duration-300 z-20">
        <div className="flex flex-col gap-1">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onPriorityChange(task.id, Math.min(3, task.priority + 1));
            }}
            className="w-6 h-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-xs font-bold flex items-center justify-center shadow-lg border border-white/30"
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.8 }}
          >
            +
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onPriorityChange(task.id, Math.max(1, task.priority - 1));
            }}
            className="w-6 h-6 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-full text-xs font-bold flex items-center justify-center shadow-lg border border-white/30"
            whileHover={{ scale: 1.2, rotate: -90 }}
            whileTap={{ scale: 0.8 }}
          >
            −
          </motion.button>
        </div>
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={task}
        urgency={urgency}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onComplete={handleComplete}
      />
    </motion.div>
  );
}