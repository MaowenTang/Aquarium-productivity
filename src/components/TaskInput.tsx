import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RecurrenceSelector } from './RecurrenceSelector';
import { RecurrencePattern } from '../types/Task';
import { getRecurrenceDescription } from '../utils/recurringTasks';
import { Plus, Repeat, Bell, X } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (task: {
    title: string;
    description: string;
    deadline?: Date;
    priority: number;
    isRecurring?: boolean;
    recurrence?: RecurrencePattern;
    reminderBefore?: number;
  }) => void;
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('2');
  const [isOpen, setIsOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrencePattern | null>(null);
  const [reminderBefore, setReminderBefore] = useState<number | null>(null);
  const [showRecurrenceSelector, setShowRecurrenceSelector] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask({
        title: title.trim(),
        description: description.trim(),
        deadline: deadline ? new Date(deadline) : undefined,
        priority: parseInt(priority),
        isRecurring,
        recurrence: isRecurring ? recurrence || undefined : undefined,
        reminderBefore: isRecurring && reminderBefore ? reminderBefore : undefined,
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('2');
      setIsRecurring(false);
      setRecurrence(null);
      setReminderBefore(null);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay when form is open */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <div className="fixed bottom-[88px] right-4 z-30 sm:bottom-24 sm:right-6 md:bottom-8 md:right-8">
      {!isOpen ? (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: 1,
            opacity: 1
          }}
          transition={{
            scale: { 
              type: "spring", 
              stiffness: 400, 
              damping: 25, 
              duration: 0.4 
            },
            opacity: { duration: 0.3 }
          }}
          whileHover={{ 
            scale: 1.15, 
            y: -8,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.92 }}
          className="relative group"
        >
          {/* Main FAB Button - ENLARGED */}
          <Button
            onClick={() => setIsOpen(true)}
            className="w-[72px] h-[72px] md:w-20 md:h-20 rounded-full 
                     bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600
                     hover:from-blue-600 hover:via-blue-700 hover:to-cyan-700
                     shadow-[0_8px_30px_rgba(59,130,246,0.5)] 
                     hover:shadow-[0_12px_40px_rgba(59,130,246,0.7)]
                     active:shadow-[0_4px_20px_rgba(59,130,246,0.5)]
                     border-2 border-white/20 text-white
                     transition-all duration-300 ease-out
                     relative overflow-hidden"
            size="icon"
          >
            {/* Enhanced highlight effect */}
            <div className="absolute top-3 left-4 w-6 h-6 bg-white/40 rounded-full blur-md" />
            <div className="absolute top-4 left-5 w-3 h-3 bg-white/60 rounded-full blur-sm" />
            
            {/* Plus icon - LARGER */}
            <motion.div
              animate={{ 
                rotate: [0, 90, 0]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
              className="relative z-10"
            >
              <Plus className="h-8 w-8 md:h-9 md:w-9 stroke-[3]" />
            </motion.div>
            
            {/* Ripple effect on hover - ENHANCED */}
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-full scale-0 group-hover:scale-100"
              transition={{ duration: 0.3 }}
            />
          </Button>
          
          {/* Pulsing ring effect - LARGER */}
          <motion.div
            className="absolute inset-0 rounded-full border-3 border-blue-400/50"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.9, 0, 0.9]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          
          {/* Secondary pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-cyan-400/40"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 0, 0.7]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.5
            }}
          />
          
          {/* Floating particles - MORE VISIBLE */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 4 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 bg-blue-300 rounded-full shadow-lg"
                style={{
                  left: `${25 + i * 15}%`,
                  top: `${20 + i * 20}%`,
                }}
                animate={{
                  y: [-3, -12, -3],
                  opacity: [0.5, 1, 0.5],
                  scale: [0.9, 1.3, 0.9]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
          
          {/* Enhanced shadow effect */}
          <div className="absolute top-0 left-0 w-full h-full rounded-full 
                         shadow-[0_10px_35px_rgba(59,130,246,0.5),0_0_20px_rgba(14,165,233,0.3)] 
                         group-hover:shadow-[0_15px_50px_rgba(59,130,246,0.6),0_0_30px_rgba(14,165,233,0.4)]
                         transition-shadow duration-300" />
          
          {/* Tooltip - ENHANCED */}
          <motion.div
            className="absolute -top-14 right-0 bg-gradient-to-r from-blue-600 to-cyan-600 
                       text-white text-sm px-4 py-2 
                       rounded-xl opacity-0 group-hover:opacity-100 
                       transition-opacity duration-300 pointer-events-none
                       whitespace-nowrap shadow-xl border border-white/20"
            initial={{ opacity: 0, y: 5 }}
            whileHover={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add New Task</span>
            </div>
            <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] 
                           border-l-transparent border-r-transparent border-t-blue-600" />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0, opacity: 0, y: 50 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 25,
            duration: 0.4 
          }}
          className="w-80 max-w-[calc(100vw-2rem)] md:w-80 max-h-[calc(100vh-20rem)] md:max-h-none overflow-y-auto
                     absolute bottom-0 right-0 md:static"
          style={{
            // 在手机端时，表单向上显示，确保不被底部导航遮挡
            transform: 'translateY(-100%)',
            transformOrigin: 'bottom right'
          }}
        >
          <Card className="glass-morandi border-2 border-white/30 shadow-2xl rounded-3xl float-3d overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
              <CardTitle className="flex items-center justify-between text-lg">
                <div className="flex items-center gap-3">
                  <motion.span 
                    className="text-2xl"
                    animate={{ 
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: 'easeInOut' 
                    }}
                  >
                    🐠
                  </motion.span>
                  <span className="text-blue-800">Add New Task</span>
                </div>
                <motion.button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 
                           flex items-center justify-center text-blue-600 hover:text-blue-800
                           transition-colors duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Plus className="h-4 w-4 rotate-45" />
                </motion.button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    placeholder="Task title *"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="glass-morandi border-white/30 focus:border-blue-400 rounded-2xl 
                             h-12 text-base placeholder:text-blue-600/60"
                    required
                    autoFocus
                  />
                </motion.div>
                
                <motion.div
                  whileFocus={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                >
                  <Textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-morandi border-white/30 focus:border-blue-400 rounded-2xl 
                             resize-none text-base placeholder:text-blue-600/60"
                    rows={2}
                  />
                </motion.div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Input
                      type="datetime-local"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="glass-morandi border-white/30 focus:border-blue-400 rounded-2xl 
                               h-12 text-base"
                    />
                  </motion.div>
                  
                  <motion.div
                    whileFocus={{ scale: 1.01 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger className="glass-morandi border-white/30 focus:border-blue-400 rounded-2xl h-12">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent className="glass-morandi border-white/30 rounded-2xl">
                        <SelectItem value="1">🌿 Low Priority</SelectItem>
                        <SelectItem value="2">🌊 Medium Priority</SelectItem>
                        <SelectItem value="3">🔥 High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                </div>
                
                {/* Recurring Task Toggle */}
                <motion.button
                  type="button"
                  onClick={() => setIsRecurring(!isRecurring)}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left
                    ${isRecurring 
                      ? 'border-purple-400 bg-purple-50/80 dark:bg-purple-900/20' 
                      : 'border-blue-200/50 bg-white/40 dark:bg-slate-800/40 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center
                        ${isRecurring 
                          ? 'bg-gradient-to-br from-purple-400 to-pink-400' 
                          : 'bg-gradient-to-br from-blue-400 to-cyan-400'
                        }`}>
                        <Repeat className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className={`font-medium ${isRecurring ? 'text-purple-900' : 'text-blue-900'}`}>
                          Recurring Task
                        </p>
                        {recurrence && (
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                            {getRecurrenceDescription(recurrence)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-all
                      ${isRecurring ? 'bg-purple-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all
                        ${isRecurring ? 'left-6' : 'left-0.5'}`} />
                    </div>
                  </div>
                </motion.button>

                {/* Recurrence Settings Button */}
                {isRecurring && (
                  <motion.button
                    type="button"
                    onClick={() => setShowRecurrenceSelector(true)}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full p-3 rounded-xl border-2 border-purple-200 bg-purple-50/60 
                               hover:bg-purple-50 transition-all text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-900 dark:text-purple-100">
                        {recurrence ? getRecurrenceDescription(recurrence) : 'Set recurrence pattern'}
                      </span>
                      <span className="text-purple-600">→</span>
                    </div>
                  </motion.button>
                )}

                {/* Reminder Before Toggle */}
                {isRecurring && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between p-3 rounded-xl 
                                    border-2 border-amber-200 bg-amber-50/60">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-900">Reminder</span>
                      </div>
                    </div>
                    
                    <Select 
                      value={reminderBefore?.toString() || ''} 
                      onValueChange={(val) => setReminderBefore(val ? parseInt(val) : null)}
                    >
                      <SelectTrigger className="glass-morandi border-white/30 focus:border-amber-400 rounded-2xl h-12">
                        <SelectValue placeholder="No reminder" />
                      </SelectTrigger>
                      <SelectContent className="glass-morandi border-white/30 rounded-2xl">
                        <SelectItem value="0">No reminder</SelectItem>
                        <SelectItem value="15">15 minutes before</SelectItem>
                        <SelectItem value="30">30 minutes before</SelectItem>
                        <SelectItem value="60">1 hour before</SelectItem>
                        <SelectItem value="120">2 hours before</SelectItem>
                        <SelectItem value="1440">1 day before</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
                
                <div className="flex gap-3 pt-4">
                  <motion.div 
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-500 to-cyan-500 
                               hover:from-blue-600 hover:to-cyan-600 
                               text-white border-0 rounded-2xl shadow-lg hover:shadow-xl
                               transition-all duration-300 font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsOpen(false)}
                      className="h-12 px-6 rounded-2xl glass-morandi border-white/40 
                               hover:bg-red-50 hover:border-red-200 hover:text-red-600
                               transition-all duration-300"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
      </div>

      {/* Recurrence Selector Modal */}
      <RecurrenceSelector
        isOpen={showRecurrenceSelector}
        onClose={() => setShowRecurrenceSelector(false)}
        onSelect={(pattern) => {
          setRecurrence(pattern);
          if (!pattern) {
            setIsRecurring(false);
          }
        }}
        initialPattern={recurrence || undefined}
      />
    </>
  );
}