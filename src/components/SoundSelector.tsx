import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AVAILABLE_SOUNDS, SoundType } from '../utils/ambientSounds';
import { Check } from 'lucide-react';

interface SoundSelectorProps {
  selectedSound: SoundType;
  onSoundSelect: (sound: SoundType) => void;
  isPlaying: boolean;
}

export function SoundSelector({ selectedSound, onSoundSelect, isPlaying }: SoundSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {AVAILABLE_SOUNDS.map((sound) => (
        <motion.div
          key={sound.type}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            onClick={() => onSoundSelect(sound.type)}
            variant="outline"
            className={`
              w-full h-auto flex flex-col items-center gap-2 p-4 rounded-2xl
              border-2 transition-all
              ${selectedSound === sound.type 
                ? `bg-gradient-to-br ${sound.color} border-white text-white shadow-lg` 
                : 'bg-white/60 border-white/30 hover:bg-white/80'
              }
            `}
          >
            <div className="relative">
              <span className="text-3xl">{sound.icon}</span>
              {selectedSound === sound.type && isPlaying && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              {selectedSound === sound.type && !isPlaying && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-blue-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-blue-600" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className={`text-xs font-medium ${selectedSound === sound.type ? 'text-white' : 'text-blue-700'}`}>
                {sound.name}
              </p>
              <p className={`text-[10px] ${selectedSound === sound.type ? 'text-white/90' : 'text-blue-500'}`}>
                {sound.description}
              </p>
            </div>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}
