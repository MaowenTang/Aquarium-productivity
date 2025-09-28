import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task } from '../types/Task';

interface TaskBubbleProps {
  task: Task;
  index: number;
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

export function TaskBubble({ task, index, onComplete, onPriorityChange }: TaskBubbleProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const getBubbleSize = (priority: number) => {
    switch (priority) {
      case 3: return 'w-24 h-24'; // High priority - larger bubbles
      case 2: return 'w-18 h-18'; // Medium priority
      case 1: return 'w-14 h-14'; // Low priority - small bubble
      default: return 'w-16 h-16';
    }
  };

  const getBubbleColor = (priority: number) => {
    switch (priority) {
      case 3: return 'morandi-coral'; // High priority - warm Morandi colors
      case 2: return 'morandi-blue'; // Medium priority
      case 1: return 'morandi-sage'; // Low priority - cool Morandi colors
      default: return 'morandi-lavender';
    }
  };

  const getBubblePosition = (priority: number, index: number) => {
    const urgencyBoost = task.deadline && task.deadline < new Date() ? -20 : 0; // Overdue tasks float higher
    const baseY = priority === 3 ? 15 + urgencyBoost : priority === 2 ? 45 : 75; // High priority floats up
    const horizontalSpread = Math.min(window.innerWidth - 100, 600); // Responsive positioning
    const offset = (index % 4) * (horizontalSpread / 4);
    return { 
      x: 20 + offset + (Math.sin(index * 0.5) * 50), 
      y: Math.max(10, baseY + (Math.sin(index * 0.3) * 15))
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

  const position = getBubblePosition(task.priority, index);

  return (
    <motion.div
      className={`absolute ${getBubbleSize(task.priority)} cursor-pointer`}
      style={{ left: position.x, top: `${position.y}%` }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: task.completed || isCompleting ? [1, 1.2, 0] : 1,
        opacity: task.completed || isCompleting ? [1, 1, 0] : 1,
        y: [0, -10, 0],
        x: [0, 5, 0],
        rotate: isCompleting ? [0, 10, -10, 0] : [0, 1, -1, 0],
        rotateY: [0, 5, 0, -5, 0],
      }}
      transition={{ 
        duration: 0.5,
        y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' },
        x: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' },
        rotate: { duration: 6 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' },
        rotateY: { duration: 8 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut' }
      }}
      whileHover={{ 
        scale: 1.15, 
        y: -5,
        rotateX: 10,
        transition: { duration: 0.2 }
      }}
      whileTap={{ scale: 0.9 }}
      onClick={handleComplete}
    >
      <motion.div 
        className={`w-full h-full rounded-full ${getBubbleColor(task.priority)} 
                   bubble-semi-transparent bubble-pulse float-3d
                   flex items-center justify-center relative overflow-hidden`}
        animate={{
          boxShadow: [
            '0 4px 15px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.08)',
            '0 8px 25px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.12)',
            '0 4px 15px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.08)'
          ]
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
        }}
      >
        {/* Enhanced bubble highlights - now using ::before and ::after from CSS */}
        
        {/* Sparkle effect on completion */}
        <AnimatePresence>
          {showSparkles && <SparkleEffect />}
        </AnimatePresence>
        
        {/* Task text */}
        <div className="text-center p-2 z-10 relative">
          <div className="text-xs font-medium text-gray-800 leading-tight drop-shadow-sm">
            {task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title}
          </div>
        </div>

        {/* Priority indicator */}
        <div className="absolute bottom-1 right-1 flex gap-0.5 z-10">
          {Array.from({ length: task.priority }).map((_, i) => (
            <motion.div 
              key={i} 
              className="w-1.5 h-1.5 bg-white/80 rounded-full shadow-sm"
              animate={{ scale: [0.8, 1, 0.8] }}
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
              className="absolute w-1 h-1 bg-white/40 rounded-full"
              style={{
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`,
              }}
              animate={{
                y: [0, -10, 0],
                x: [0, 5, 0],
                opacity: [0.2, 0.6, 0.2],
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
      </motion.div>

      {/* Priority adjustment buttons */}
      <div className="absolute -top-2 -right-2 opacity-0 hover:opacity-100 transition-all duration-300">
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onPriorityChange(task.id, Math.min(3, task.priority + 1));
          }}
          className="w-5 h-5 glass-morandi rounded-full text-xs flex items-center justify-center mb-1 float-3d"
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
          className="w-5 h-5 glass-morandi rounded-full text-xs flex items-center justify-center float-3d"
          whileHover={{ scale: 1.2, rotate: -90 }}
          whileTap={{ scale: 0.8 }}
        >
          -
        </motion.button>
      </div>
    </motion.div>
  );
}