import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Play, Pause, RotateCcw, Coffee, Zap, Clock, X, Brain, Volume2, VolumeX } from 'lucide-react';
import { AmbientSoundGenerator, SoundType, AVAILABLE_SOUNDS } from '../utils/ambientSounds';
import { SoundSelector } from './SoundSelector';
import { Slider } from './ui/slider';

interface FocusModeProps {
  onClose?: () => void;
  onBreakTime?: () => void;
}

type SessionType = 'focus' | 'short-break' | 'long-break';
type SessionState = 'setup' | 'active' | 'paused' | 'completed';

interface SessionConfig {
  focus: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
}

export function FocusMode({ onClose, onBreakTime }: FocusModeProps) {
  const [sessionState, setSessionState] = useState<SessionState>('setup');
  const [currentType, setCurrentType] = useState<SessionType>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Audio states
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [selectedSound, setSelectedSound] = useState<SoundType>('ocean');
  const [showSoundSelector, setShowSoundSelector] = useState(false);
  const soundGeneratorRef = useRef<AmbientSoundGenerator | null>(null);

  const [config, setConfig] = useState<SessionConfig>({
    focus: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4
  });

  const sessionTypes = [
    { type: 'focus' as SessionType, label: 'Focus', duration: config.focus, icon: Zap, color: 'bg-blue-500' },
    { type: 'short-break' as SessionType, label: 'Short Break', duration: config.shortBreak, icon: Coffee, color: 'bg-green-500' },
    { type: 'long-break' as SessionType, label: 'Long Break', duration: config.longBreak, icon: Coffee, color: 'bg-purple-500' },
  ];

  useEffect(() => {
    if (sessionState !== 'active') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setSessionState('completed');
          
          if (currentType === 'focus') {
            setCompletedSessions(c => c + 1);
            setSessionCount(c => c + 1);
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionState, currentType]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = (type: SessionType) => {
    setCurrentType(type);
    const duration = type === 'focus' ? config.focus : 
                    type === 'short-break' ? config.shortBreak : config.longBreak;
    setTimeLeft(duration * 60);
    setSessionState('active');
    setIsFullscreen(type === 'focus');
  };

  const pauseSession = () => {
    setSessionState('paused');
  };

  const resumeSession = () => {
    setSessionState('active');
  };

  const resetSession = () => {
    setSessionState('setup');
    setTimeLeft(25 * 60);
    setIsFullscreen(false);
  };

  const getNextSessionType = (): SessionType => {
    if (currentType === 'focus') {
      return sessionCount % config.longBreakInterval === 0 && sessionCount > 0 ? 'long-break' : 'short-break';
    }
    return 'focus';
  };

  const progress = currentType === 'focus' ? 
    ((config.focus * 60 - timeLeft) / (config.focus * 60)) * 100 :
    currentType === 'short-break' ?
    ((config.shortBreak * 60 - timeLeft) / (config.shortBreak * 60)) * 100 :
    ((config.longBreak * 60 - timeLeft) / (config.longBreak * 60)) * 100;

  // Audio control functions
  const toggleAudio = async () => {
    if (isAudioPlaying) {
      soundGeneratorRef.current?.stop();
      setIsAudioPlaying(false);
    } else {
      if (!soundGeneratorRef.current) {
        soundGeneratorRef.current = new AmbientSoundGenerator();
      }
      try {
        await soundGeneratorRef.current.playSound(selectedSound, volume);
        setIsAudioPlaying(true);
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  const handleSoundChange = async (sound: SoundType) => {
    setSelectedSound(sound);
    if (isAudioPlaying && soundGeneratorRef.current) {
      try {
        await soundGeneratorRef.current.playSound(sound, volume);
      } catch (error) {
        console.error('Error changing sound:', error);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const vol = value[0];
    setVolume(vol);
    if (soundGeneratorRef.current) {
      soundGeneratorRef.current.setVolume(vol);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      soundGeneratorRef.current?.cleanup();
    };
  }, []);

  if (isFullscreen && sessionState === 'active') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
        {/* Animated Ocean Background */}
        <div className="absolute inset-0">
          {/* Multiple wave layers */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0 left-0 w-full opacity-20"
              style={{
                height: `${20 + i * 15}%`,
                background: `linear-gradient(45deg, transparent ${30 - i * 5}%, rgba(99, 179, 237, ${0.3 - i * 0.05}) 50%, transparent ${70 + i * 5}%)`
              }}
              animate={{
                x: ['-50%', '50%', '-50%'],
                y: [0, -10, 0]
              }}
              transition={{
                duration: 8 + i * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5
              }}
            />
          ))}
          
          {/* Floating particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 4 + Math.random() * 6,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Central Focus Timer */}
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-8">
            {/* Timer Bubble */}
            <motion.div
              className="relative mx-auto"
              animate={{ 
                scale: [1, 1.05, 1],
                y: [0, -8, 0],
                rotateY: [0, 5, 0, -5, 0],
                rotateX: [0, 2, 0, -2, 0]
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <div className="w-80 h-80 bg-gradient-to-br from-white/20 to-white/5 rounded-full 
                            border-4 border-white/40 shadow-2xl float-3d bubble-semi-transparent
                            flex items-center justify-center relative overflow-hidden">
                
                {/* Bubble highlight */}
                <div className="absolute top-16 left-16 w-20 h-20 bg-white/20 rounded-full blur-xl" />
                
                {/* Timer Text */}
                <div className="text-center">
                  <div className="text-6xl font-light text-white mb-4">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-xl text-blue-100 capitalize">
                    {currentType.replace('-', ' ')} Session
                  </div>
                </div>

                {/* Progress Ring */}
                <svg className="absolute inset-4 w-72 h-72 transform -rotate-90">
                  <circle
                    cx="144"
                    cy="144"
                    r="140"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <motion.circle
                    cx="144"
                    cy="144"
                    r="140"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 140}`}
                    strokeDashoffset={`${2 * Math.PI * 140 * (1 - progress / 100)}`}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
              </div>
            </motion.div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <Button
                onClick={pauseSession}
                size="lg"
                className="rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white"
              >
                <Pause className="h-6 w-6" />
              </Button>
              
              <Button
                onClick={() => {
                  if (onBreakTime) onBreakTime();
                }}
                size="lg"
                className="rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white"
              >
                <Brain className="h-6 w-6" />
              </Button>
              
              <Button
                onClick={() => setIsFullscreen(false)}
                size="lg"
                className="rounded-full bg-white/20 hover:bg-white/30 border border-white/30 text-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>

            <div className="text-white/60 text-sm">
              Session {sessionCount + 1} • {completedSessions} completed today
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <AnimatePresence mode="wait">
        {sessionState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  Focus Sessions
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose your focus session type and dive deep into productivity
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {sessionTypes.map((session) => (
                    <Button
                      key={session.type}
                      onClick={() => startSession(session.type)}
                      variant="outline"
                      className="h-16 justify-start bg-white/50 hover:bg-white/70 border-white/30 rounded-xl"
                    >
                      <div className={`w-12 h-12 ${session.color} rounded-full flex items-center justify-center mr-4`}>
                        <session.icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{session.label}</div>
                        <div className="text-sm text-muted-foreground">{session.duration} minutes</div>
                      </div>
                    </Button>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="flex items-center justify-between text-sm text-blue-600">
                    <span>Sessions completed today: {completedSessions}</span>
                    <span>Current cycle: {Math.floor(sessionCount / config.longBreakInterval) + 1}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {(sessionState === 'active' || sessionState === 'paused') && !isFullscreen && (
          <motion.div
            key="active"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    {currentType.replace('-', ' ')} Session
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFullscreen(true)}
                    className="rounded-full"
                  >
                    <Zap className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-light text-blue-800 mb-2">
                    {formatTime(timeLeft)}
                  </div>
                  <Progress value={progress} className="w-full h-3" />
                </div>

                <div className="flex items-center justify-center gap-4">
                  {sessionState === 'paused' ? (
                    <Button
                      onClick={resumeSession}
                      size="lg"
                      className="rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                    >
                      <Play className="h-6 w-6 mr-2" />
                      Resume
                    </Button>
                  ) : (
                    <Button
                      onClick={pauseSession}
                      size="lg"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Pause className="h-6 w-6 mr-2" />
                      Pause
                    </Button>
                  )}
                  
                  <Button
                    onClick={resetSession}
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                  >
                    <RotateCcw className="h-6 w-6 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    onClick={toggleAudio}
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    {isAudioPlaying ? <VolumeX className="h-6 w-6 mr-2" /> : <Volume2 className="h-6 w-6 mr-2" />}
                    {isAudioPlaying ? 'Stop Sound' : 'Play Sound'}
                  </Button>

                  <Button
                    onClick={() => setShowSoundSelector(true)}
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                  >
                    <Volume2 className="h-6 w-6 mr-2" />
                    {AVAILABLE_SOUNDS.find(s => s.type === selectedSound)?.icon || '🎵'}
                  </Button>

                  <div className="flex items-center gap-3 bg-white/50 rounded-full px-4 py-2">
                    <VolumeX className="h-4 w-4 text-blue-600" />
                    <Slider
                      value={[volume]}
                      onValueChange={handleVolumeChange}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-32"
                    />
                    <Volume2 className="h-4 w-4 text-blue-600" />
                  </div>
                </div>

                {/* Sound Selector Modal */}
                {showSoundSelector && (
                  <div className="mt-4 p-4 bg-white/80 rounded-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-blue-800">Choose Background Sound</h4>
                      <Button
                        onClick={() => setShowSoundSelector(false)}
                        variant="ghost"
                        size="sm"
                        className="rounded-full"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <SoundSelector
                      selectedSound={selectedSound}
                      onSoundSelect={handleSoundChange}
                      isPlaying={isAudioPlaying}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {sessionState === 'completed' && (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
              <CardContent className="text-center py-8 space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.6 }}
                  className="text-6xl"
                >
                  {currentType === 'focus' ? '🎉' : '☕'}
                </motion.div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">
                    {currentType === 'focus' ? 'Great Focus Session!' : 'Break Complete!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {currentType === 'focus' 
                      ? 'Time for a well-deserved break'
                      : 'Ready to get back to work?'
                    }
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={() => startSession(getNextSessionType())}
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    Start {getNextSessionType().replace('-', ' ')}
                  </Button>
                  
                  <Button
                    onClick={resetSession}
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                  >
                    Back to Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}