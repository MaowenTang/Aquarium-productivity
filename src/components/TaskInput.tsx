import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus } from 'lucide-react';

interface TaskInputProps {
  onAddTask: (task: {
    title: string;
    description: string;
    deadline?: Date;
    priority: number;
  }) => void;
}

export function TaskInput({ onAddTask }: TaskInputProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('2');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask({
        title: title.trim(),
        description: description.trim(),
        deadline: deadline ? new Date(deadline) : undefined,
        priority: parseInt(priority)
      });
      
      // Reset form
      setTitle('');
      setDescription('');
      setDeadline('');
      setPriority('2');
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-10">
      {!isOpen ? (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ 
            scale: 1,
            y: [0, -5, 0]
          }}
          transition={{
            scale: { duration: 0.3 },
            y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
          }}
          whileHover={{ 
            scale: 1.15, 
            y: -8,
            transition: { duration: 0.2 }
          }}
          whileTap={{ scale: 0.85 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bubble-semi-transparent morandi-blue
                     float-3d border-2 border-white/40 parallax-float"
            size="icon"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: 'easeInOut' 
              }}
            >
              <Plus className="h-7 w-7" />
            </motion.div>
          </Button>
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
        >
          <Card className="w-80 glass-morandi border-2 border-white/30 shadow-2xl rounded-3xl float-3d">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
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
                Add New Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  whileFocus={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    placeholder="Task title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="glass-morandi border-white/30 focus:border-blue-400 rounded-2xl float-3d"
                    required
                  />
                </motion.div>
                
                <motion.div
                  whileFocus={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass-morandi border-white/30 focus:border-blue-400 rounded-2xl resize-none float-3d"
                    rows={3}
                  />
                </motion.div>
                
                <motion.div
                  whileFocus={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Input
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="glass-morandi border-white/30 focus:border-blue-400 rounded-2xl float-3d"
                  />
                </motion.div>
                
                <motion.div
                  whileFocus={{ scale: 1.02, y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger className="glass-morandi border-white/30 focus:border-blue-400 rounded-2xl float-3d">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent className="glass-morandi border-white/30 rounded-2xl">
                      <SelectItem value="1">🌿 Low Priority</SelectItem>
                      <SelectItem value="2">🌊 Medium Priority</SelectItem>
                      <SelectItem value="3">🔥 High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>
                
                <div className="flex gap-3 pt-2">
                  <motion.div 
                    className="flex-1"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full morandi-blue float-3d rounded-2xl border border-white/30"
                    >
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
                      className="rounded-2xl glass-morandi border-white/40 hover:morandi-coral"
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
  );
}