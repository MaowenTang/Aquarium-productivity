import { motion } from 'motion/react';
import { useState, useEffect, useRef } from 'react';
import { TaskBubble } from './TaskBubble';
import { Task } from '../types/Task';
import { sortTasksByUrgency, TaskUrgency } from '../utils/urgencySystem';
import { useTheme } from '../contexts/ThemeContext';
import { 
  calculateBubblePositions, 
  resolveOverlaps, 
  getBubbleSizeInPixels,
  getResponsiveBubbleScale,
  BubblePosition 
} from '../utils/bubbleLayout';

interface BubbleVisualizationProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
  onChangePriority: (id: string, priority: number) => void;
}

export function BubbleVisualization({ tasks, onCompleteTask, onChangePriority }: BubbleVisualizationProps) {
  const { mode } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [bubblePositions, setBubblePositions] = useState<BubblePosition[]>([]);
  
  const activeTasks = tasks.filter(task => !task.completed);
  
  // Sort tasks by urgency (most urgent first)
  const sortedTaskUrgencies = sortTasksByUrgency(activeTasks);

  // Measure container dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerDimensions({
          width: rect.width,
          height: Math.max(rect.height, 400)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate bubble positions when tasks or container changes
  useEffect(() => {
    if (containerDimensions.width === 0 || sortedTaskUrgencies.length === 0) {
      setBubblePositions([]);
      return;
    }
    
    // Get bubble sizes (already responsive based on window width)
    const bubbleSizes = sortedTaskUrgencies.map(u => 
      getBubbleSizeInPixels(u.task.priority)
    );
    
    const urgencyLevels = sortedTaskUrgencies.map(u => {
      if (u.state === 'overdue') return 0;
      if (u.state === 'urgent') return 1;
      if (u.state === 'warning') return 2;
      return 3;
    });

    // Calculate initial positions
    let positions = calculateBubblePositions(
      sortedTaskUrgencies.length,
      containerDimensions.width,
      containerDimensions.height,
      bubbleSizes,
      urgencyLevels
    );

    // Resolve any overlaps with more iterations on mobile
    const iterations = window.innerWidth < 640 ? 5 : 3;
    positions = resolveOverlaps(positions, iterations);

    setBubblePositions(positions);
  }, [sortedTaskUrgencies.length, containerDimensions, tasks.length]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[400px] overflow-hidden bg-gradient-to-b from-blue-50/30 to-blue-100/50 dark:from-slate-900/30 dark:to-slate-800/50 rounded-3xl"
    >
      {/* Depth layers for visual hierarchy */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/10 to-blue-100/20 dark:via-slate-800/10 dark:to-slate-900/20 pointer-events-none" />
      
      {activeTasks.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center space-y-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="text-6xl mb-4"
            >
              🌊
            </motion.div>
            <div className="space-y-3">
              <p className="text-blue-600 dark:text-blue-400 max-w-sm mx-auto">
                Your ocean is calm and serene. Perfect time to add new tasks or simply enjoy the tranquility.
              </p>
              <p className="text-sm text-blue-500 dark:text-blue-500">
                Tap the + button below to create your first task
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {sortedTaskUrgencies.map((urgency, index) => (
            <TaskBubble
              key={urgency.task.id}
              task={urgency.task}
              urgency={urgency}
              index={index}
              position={bubblePositions[index]}
              onComplete={onCompleteTask}
              onPriorityChange={onChangePriority}
            />
          ))}
          
          {/* Task count indicator with urgency summary */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl px-4 py-2 shadow-xl border-2 border-white/30 dark:border-slate-700/30"
          >
            <div className="flex items-center gap-2">
              <motion.span 
                className="text-blue-600 text-xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                🫧
              </motion.span>
              <span className="font-semibold text-blue-800 dark:text-blue-200">
                {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''} floating
              </span>
            </div>
            
            {/* Urgency indicators */}
            {sortedTaskUrgencies.some(u => u.state !== 'normal') && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-wrap items-center gap-1 mt-2 text-xs"
              >
                {sortedTaskUrgencies.filter(u => u.state === 'overdue').length > 0 && (
                  <span className="bg-red-500/20 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-medium">
                    🚨 {sortedTaskUrgencies.filter(u => u.state === 'overdue').length}
                  </span>
                )}
                {sortedTaskUrgencies.filter(u => u.state === 'urgent').length > 0 && (
                  <span className="bg-rose-500/20 text-rose-700 dark:text-rose-400 px-2 py-1 rounded-full font-medium">
                    ⏰ {sortedTaskUrgencies.filter(u => u.state === 'urgent').length}
                  </span>
                )}
                {sortedTaskUrgencies.filter(u => u.state === 'warning').length > 0 && (
                  <span className="bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-full font-medium">
                    ⚠️ {sortedTaskUrgencies.filter(u => u.state === 'warning').length}
                  </span>
                )}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}