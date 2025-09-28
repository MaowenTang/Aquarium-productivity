import { motion } from 'motion/react';

export function OceanWaves() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Multiple wave layers for depth */}
      <motion.div
        className="absolute bottom-0 left-0 w-[200%] h-32 opacity-20"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(99, 179, 237, 0.3) 50%, transparent 70%)'
        }}
        animate={{
          x: ['-50%', '0%', '-50%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      <motion.div
        className="absolute bottom-0 left-0 w-[150%] h-24 opacity-15"
        style={{
          background: 'linear-gradient(45deg, transparent 20%, rgba(44, 90, 160, 0.4) 50%, transparent 80%)'
        }}
        animate={{
          x: ['0%', '-30%', '0%'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      <motion.div
        className="absolute bottom-0 left-0 w-[120%] h-16 opacity-25"
        style={{
          background: 'linear-gradient(45deg, transparent 25%, rgba(190, 227, 248, 0.5) 50%, transparent 75%)'
        }}
        animate={{
          x: ['-20%', '20%', '-20%'],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
      
      {/* Floating particles for underwater effect */}
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/10 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  );
}