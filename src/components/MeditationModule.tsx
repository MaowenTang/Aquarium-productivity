import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Play, Pause, RotateCcw, Heart, Clock, Volume2, VolumeX, Music } from 'lucide-react';
import { AmbientSoundGenerator, AVAILABLE_SOUNDS, SoundType } from '../utils/ambientSounds';
import { SoundSelector } from './SoundSelector';
import { WeatherDisplay } from './WeatherDisplay';

interface MeditationModuleProps {
  isOpen?: boolean;
  onClose?: () => void;
  isStandalone?: boolean;
}

export function MeditationModule({ isOpen = true, onClose, isStandalone = false }: MeditationModuleProps) {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [timer, setTimer] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(300); // 5 minutes default
  const [sessionType, setSessionType] = useState<'breathing' | 'meditation' | 'visualization'>('breathing');
  const [sessionTimer, setSessionTimer] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  
  // Audio states
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [selectedSound, setSelectedSound] = useState<SoundType>('ocean');
  const [audioError, setAudioError] = useState<string | null>(null);
  const soundGeneratorRef = useRef<AmbientSoundGenerator | null>(null);

  const breathingPattern = {
    inhale: 4000,   // 4 seconds
    hold: 4000,     // 4 seconds  
    exhale: 6000,   // 6 seconds
  };

  const sessions = [
    { 
      type: 'breathing' as const, 
      title: 'Breathing Exercise', 
      description: 'Rhythmic breathing with visual guide',
      duration: [60, 180, 300, 600],
      icon: '🫁'
    },
    { 
      type: 'meditation' as const, 
      title: 'Ocean Meditation', 
      description: 'Guided meditation with ocean sounds',
      duration: [180, 300, 600, 900],
      icon: '🧘‍♀️'
    },
    { 
      type: 'visualization' as const, 
      title: 'Underwater Journey', 
      description: 'Calming underwater visualization',
      duration: [300, 600, 900, 1200],
      icon: '🐠'
    },
  ];

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const currentPhaseTime = breathingPattern[phase];
        if (prev >= currentPhaseTime) {
          if (phase === 'inhale') {
            setPhase('hold');
          } else if (phase === 'hold') {
            setPhase('exhale');
          } else {
            setPhase('inhale');
            setCycle(c => c + 1);
          }
          return 0;
        }
        return prev + 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  useEffect(() => {
    if (!sessionStarted) return;

    const interval = setInterval(() => {
      setSessionTimer((prev) => {
        if (prev >= sessionDuration * 1000) {
          setSessionStarted(false);
          setIsActive(false);
          stopAudio();
          return 0;
        }
        return prev + 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionStarted, sessionDuration]);

  // Audio functions
  const playSound = async () => {
    try {
      if (!soundGeneratorRef.current) {
        soundGeneratorRef.current = new AmbientSoundGenerator();
      }

      const soundGenerator = soundGeneratorRef.current;
      await soundGenerator.play(selectedSound, volume);
      setIsAudioPlaying(true);
      setAudioError(null);

    } catch (error) {
      console.error('Audio playback error:', error);
      setAudioError('Unable to play audio. Please check your browser settings.');
    }
  };

  const stopAudio = () => {
    try {
      if (soundGeneratorRef.current) {
        soundGeneratorRef.current.stop();
      }
      setIsAudioPlaying(false);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  const toggleAudio = async () => {
    if (isAudioPlaying) {
      stopAudio();
    } else {
      await playSound();
    }
  };

  const updateVolume = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    
    if (soundGeneratorRef.current) {
      soundGeneratorRef.current.setVolume(vol);
    }
  };

  const getPhaseInstructions = () => {
    switch (phase) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
    }
  };

  const getCircleScale = () => {
    const progress = timer / breathingPattern[phase];
    switch (phase) {
      case 'inhale': return 0.6 + (0.4 * progress);
      case 'hold': return 1;
      case 'exhale': return 1 - (0.4 * progress);
      default: return 0.6;
    }
  };

  const reset = () => {
    setIsActive(false);
    setPhase('inhale');
    setTimer(0);
    setCycle(0);
    setSessionStarted(false);
    setSessionTimer(0);
    stopAudio();
  };

  const startSession = (type: typeof sessionType, duration: number) => {
    setSessionType(type);
    setSessionDuration(duration);
    setSessionStarted(true);
    if (type === 'breathing') {
      setIsActive(true);
    }
    // Auto-start audio for meditation sessions
    if (type === 'meditation' || type === 'visualization') {
      playSound();
    }
  };

  const formatSessionTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sessionProgress = sessionStarted ? (sessionTimer / (sessionDuration * 1000)) * 100 : 0;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (soundGeneratorRef.current) {
        soundGeneratorRef.current.cleanup();
      }
    };
  }, []);

  if (!isOpen && !isStandalone) return null;

  if (isStandalone) {
    return (
      <div className="space-y-6 pb-20 md:pb-6">
        {/* Ocean Weather Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <WeatherDisplay 
            onActivitySelect={(activity) => {
              // Start meditation based on weather activity
              const activityLower = activity.toLowerCase();
              if (activityLower.includes('meditation') || activityLower.includes('relax')) {
                // Auto-select meditation session
                startSession('meditation', 300); // 5 minutes
              } else if (activityLower.includes('breathing') || activityLower.includes('calm')) {
                startSession('breathing', 180); // 3 minutes
              } else if (activityLower.includes('visualization') || activityLower.includes('journey')) {
                startSession('visualization', 600); // 10 minutes
              }
            }}
            showRecommendations={true}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          {!sessionStarted ? (
            <motion.div
              key="session-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-pink-500" />
                    Mindfulness & Meditation
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Take a moment to center yourself and find inner peace
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Audio Controls */}
                  <div className="space-y-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 mb-3">
                      <Music className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700">Background Sounds</span>
                    </div>
                    
                    {audioError && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                        {audioError}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={toggleAudio}
                        variant={isAudioPlaying ? "default" : "outline"}
                        size="sm"
                        className="flex-shrink-0"
                      >
                        {isAudioPlaying ? (
                          <>
                            <Pause className="h-3 w-3 mr-1" />
                            Playing
                          </>
                        ) : (
                          <>
                            <Play className="h-3 w-3 mr-1" />
                            Ocean Waves
                          </>
                        )}
                      </Button>
                      
                      <div className="flex items-center gap-2 flex-1">
                        {volume > 0 ? (
                          <Volume2 className="h-3 w-3 text-blue-600" />
                        ) : (
                          <VolumeX className="h-3 w-3 text-blue-600" />
                        )}
                        <Slider
                          value={[volume]}
                          onValueChange={updateVolume}
                          max={1}
                          step={0.1}
                          className="flex-1"
                        />
                        <span className="text-xs text-blue-600 w-8 text-right">
                          {Math.round(volume * 100)}%
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-blue-600">
                      🌊 Synthetic ocean waves • Perfect for meditation and focus
                    </p>
                  </div>
                </CardContent>
              </Card>

              {sessions.map((session) => (
                <Card key={session.type} className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{session.icon}</span>
                      {session.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{session.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {session.duration.map((duration) => (
                        <Button
                          key={duration}
                          onClick={() => startSession(session.type, duration)}
                          variant="outline"
                          className="rounded-xl bg-white/50 hover:bg-white/70 border-white/30"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {duration >= 60 ? `${Math.floor(duration / 60)}m` : `${duration}s`}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="session-active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{sessions.find(s => s.type === sessionType)?.icon}</span>
                      {sessions.find(s => s.type === sessionType)?.title}
                    </div>
                    <div className="text-sm text-blue-600">
                      {formatSessionTime(Math.floor(sessionTimer / 1000))} / {formatSessionTime(sessionDuration)}
                    </div>
                  </CardTitle>
                  <Progress value={sessionProgress} className="w-full h-2" />
                </CardHeader>
                <CardContent>
                  {/* Audio Controls in Session */}
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      onClick={toggleAudio}
                      variant={isAudioPlaying ? "default" : "outline"}
                      size="sm"
                      className="flex-shrink-0"
                    >
                      {isAudioPlaying ? (
                        <>
                          <Pause className="h-3 w-3 mr-1" />
                          Ocean
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 mr-1" />
                          Ocean
                        </>
                      )}
                    </Button>
                    
                    <div className="flex items-center gap-2 flex-1">
                      {volume > 0 ? (
                        <Volume2 className="h-3 w-3 text-blue-600" />
                      ) : (
                        <VolumeX className="h-3 w-3 text-blue-600" />
                      )}
                      <Slider
                        value={[volume]}
                        onValueChange={updateVolume}
                        max={1}
                        step={0.1}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {sessionType === 'breathing' && (
                <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-center h-64">
                      <div className="relative">
                        <div className="w-48 h-48 border-4 border-blue-200 rounded-full" />
                        
                        <motion.div
                          className="absolute inset-4 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full 
                                   border-4 border-white/50 shadow-lg"
                          animate={{ 
                            scale: getCircleScale(),
                          }}
                          transition={{ 
                            duration: 0.1,
                            ease: 'easeInOut'
                          }}
                        />
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                          <div className="text-lg font-medium mb-2">
                            {getPhaseInstructions()}
                          </div>
                          <div className="text-sm opacity-80">
                            Cycle {cycle}
                          </div>
                        </div>

                        {Array.from({ length: 8 }).map((_, i) => (
                          <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-blue-300/60 rounded-full"
                            style={{
                              left: '50%',
                              top: '50%',
                              marginLeft: '-4px',
                              marginTop: '-4px',
                            }}
                            animate={{
                              x: Math.cos((i * Math.PI * 2) / 8) * 120,
                              y: Math.sin((i * Math.PI * 2) / 8) * 120,
                              opacity: [0.3, 0.8, 0.3],
                            }}
                            transition={{
                              duration: 4,
                              repeat: Infinity,
                              delay: i * 0.5,
                              ease: 'easeInOut'
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 mt-6">
                      <Button
                        onClick={() => setIsActive(!isActive)}
                        variant={isActive ? "outline" : "default"}
                        size="lg"
                        className="rounded-full px-6"
                      >
                        {isActive ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Start
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={reset}
                        variant="outline"
                        size="lg"
                        className="rounded-full px-6"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {sessionType === 'meditation' && (
                <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
                  <CardContent className="pt-6 text-center space-y-6">
                    <motion.div
                      animate={{ 
                        scale: [1, 1.05, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                      className="text-8xl"
                    >
                      🌊
                    </motion.div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium text-blue-700">
                        Let the ocean waves carry your thoughts away
                      </h3>
                      <p className="text-blue-600 max-w-md mx-auto">
                        Close your eyes and imagine yourself floating peacefully in warm, crystal-clear waters. 
                        Feel the gentle waves supporting you as you breathe deeply and let go of any tension.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={reset}
                        variant="outline"
                        size="lg"
                        className="rounded-full px-6"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        End Session
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {sessionType === 'visualization' && (
                <Card className="backdrop-blur-sm border-2 border-white/20 shadow-lg">
                  <CardContent className="pt-6 text-center space-y-6">
                    <div className="relative">
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          rotate: [0, 5, 0]
                        }}
                        transition={{ 
                          duration: 6, 
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                        className="text-6xl"
                      >
                        🐠
                      </motion.div>
                      
                      {Array.from({ length: 5 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute text-2xl"
                          style={{
                            left: `${30 + i * 15}%`,
                            top: `${20 + Math.sin(i) * 30}%`,
                          }}
                          animate={{
                            x: [0, 20, 0],
                            y: [0, -15, 0],
                            opacity: [0.4, 0.8, 0.4],
                          }}
                          transition={{
                            duration: 4 + i,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: 'easeInOut'
                          }}
                        >
                          {['🐟', '🐡', '🦈', '🐙', '🪸'][i]}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-medium text-blue-700">
                        Journey Through the Coral Garden
                      </h3>
                      <p className="text-blue-600 max-w-md mx-auto">
                        Drift through a vibrant underwater world. Watch colorful fish dance around coral reefs, 
                        feel the gentle current guide you deeper into this peaceful sanctuary beneath the waves.
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                      <Button
                        onClick={reset}
                        variant="outline"
                        size="lg"
                        className="rounded-full px-6"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        End Journey
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <Card className="backdrop-blur-sm border-2 border-white/20 shadow-2xl bg-gradient-to-b from-blue-50/90 to-cyan-50/90">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <span className="text-blue-500">🧘‍♀️</span>
              Mindful Breathing
            </CardTitle>
            <p className="text-sm text-blue-600">Take a moment to center yourself</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Breathing Circle */}
            <div className="flex items-center justify-center h-64">
              <div className="relative">
                {/* Outer ring */}
                <div className="w-48 h-48 border-4 border-blue-200 rounded-full" />
                
                {/* Breathing circle */}
                <motion.div
                  className="absolute inset-4 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-full 
                           border-4 border-white/50 shadow-lg"
                  animate={{ 
                    scale: getCircleScale(),
                  }}
                  transition={{ 
                    duration: 0.1,
                    ease: 'easeInOut'
                  }}
                />
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <div className="text-lg font-medium mb-2">
                    {getPhaseInstructions()}
                  </div>
                  <div className="text-sm opacity-80">
                    Cycle {cycle}
                  </div>
                </div>

                {/* Floating particles around the circle */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-blue-300/60 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      marginLeft: '-4px',
                      marginTop: '-4px',
                    }}
                    animate={{
                      x: Math.cos((i * Math.PI * 2) / 8) * 120,
                      y: Math.sin((i * Math.PI * 2) / 8) * 120,
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={() => setIsActive(!isActive)}
                variant={isActive ? "outline" : "default"}
                size="lg"
                className="rounded-full px-6"
              >
                {isActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              
              <Button
                onClick={reset}
                variant="outline"
                size="lg"
                className="rounded-full px-6"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Audio Controls */}
            <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <Button
                onClick={toggleAudio}
                variant={isAudioPlaying ? "default" : "outline"}
                size="sm"
                className="flex-shrink-0"
              >
                {isAudioPlaying ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Ocean
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Ocean
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-2 flex-1">
                {volume > 0 ? (
                  <Volume2 className="h-3 w-3 text-blue-600" />
                ) : (
                  <VolumeX className="h-3 w-3 text-blue-600" />
                )}
                <Slider
                  value={[volume]}
                  onValueChange={updateVolume}
                  max={1}
                  step={0.1}
                  className="flex-1"
                />
              </div>
            </div>

            {audioError && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg text-center">
                {audioError}
              </div>
            )}

            {/* Instructions */}
            <div className="text-center space-y-2 text-sm text-blue-600">
              <p>Follow the circle's rhythm:</p>
              <p>Inhale for 4s → Hold for 4s → Exhale for 6s</p>
            </div>

            <Button 
              onClick={onClose}
              variant="ghost" 
              className="w-full rounded-xl"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

// Export alias for compatibility with App.tsx
export { MeditationModule as MeditationHub };