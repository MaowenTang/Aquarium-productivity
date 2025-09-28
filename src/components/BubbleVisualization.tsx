import { TaskBubble } from './TaskBubble';
import { Task } from '../types/Task';

interface BubbleVisualizationProps {
  tasks: Task[];
  onCompleteTask: (id: string) => void;
  onChangePriority: (id: string, priority: number) => void;
}

export function BubbleVisualization({ tasks, onCompleteTask, onChangePriority }: BubbleVisualizationProps) {
  const activeTasks = tasks.filter(task => !task.completed);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Depth layers for visual hierarchy */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/10 to-blue-100/20 pointer-events-none" />
      
      {activeTasks.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl">🌊</div>
            <h3 className="text-xl text-blue-700">Peaceful Waters</h3>
            <p className="text-blue-600">No tasks floating around. Time to relax or add some new ones!</p>
          </div>
        </div>
      ) : (
        <>
          {activeTasks.map((task, index) => (
            <TaskBubble
              key={task.id}
              task={task}
              index={index}
              onComplete={onCompleteTask}
              onPriorityChange={onChangePriority}
            />
          ))}
          
          {/* Task count indicator */}
          <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-blue-600">🫧</span>
              <span className="font-medium text-blue-800">
                {activeTasks.length} task{activeTasks.length !== 1 ? 's' : ''} floating
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}