// Ambient sound generation utilities for meditation and focus modes

export type SoundType = 'ocean' | 'rain' | 'forest' | 'river' | 'wind' | 'white-noise' | 'brown-noise';

export interface Sound {
  name: string;
  type: SoundType;
  icon: string;
  description: string;
  color: string;
}

export const AVAILABLE_SOUNDS: Sound[] = [
  {
    name: 'Ocean Waves',
    type: 'ocean',
    icon: '🌊',
    description: 'Gentle ocean waves lapping on shore',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    name: 'Rainfall',
    type: 'rain',
    icon: '🌧️',
    description: 'Peaceful rain falling',
    color: 'from-slate-400 to-blue-400'
  },
  {
    name: 'Forest Ambience',
    type: 'forest',
    icon: '🌲',
    description: 'Birds chirping in a serene forest',
    color: 'from-green-400 to-emerald-500'
  },
  {
    name: 'Flowing River',
    type: 'river',
    icon: '💧',
    description: 'Babbling brook and gentle stream',
    color: 'from-cyan-400 to-teal-500'
  },
  {
    name: 'Gentle Wind',
    type: 'wind',
    icon: '💨',
    description: 'Soft wind through trees',
    color: 'from-gray-300 to-blue-300'
  },
  {
    name: 'White Noise',
    type: 'white-noise',
    icon: '⚪',
    description: 'Pure white noise for focus',
    color: 'from-gray-400 to-gray-500'
  },
  {
    name: 'Brown Noise',
    type: 'brown-noise',
    icon: '🟤',
    description: 'Deep brown noise for relaxation',
    color: 'from-amber-600 to-orange-700'
  }
];

export class AmbientSoundGenerator {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sources: AudioBufferSourceNode[] = [];
  private oscillators: OscillatorNode[] = [];

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  private createNoiseBuffer(type: 'white' | 'pink' | 'brown'): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);
      let lastOut = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        
        switch (type) {
          case 'white':
            data[i] = white;
            break;
          case 'pink':
            // Simple pink noise approximation
            const pink = (lastOut + (0.02 * white)) / 1.02;
            lastOut = pink;
            data[i] = pink * 3;
            break;
          case 'brown':
            // Brown noise (Brownian/red noise)
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            data[i] = lastOut * 3.5;
            break;
        }
      }
    }

    return buffer;
  }

  private createOceanSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const bufferSize = this.audioContext.sampleRate * 4;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      for (let i = 0; i < bufferSize; i++) {
        // Pink noise base
        const noise = Math.random() * 2 - 1;
        
        // Wave motion (multiple frequencies for natural sound)
        const time = i / this.audioContext.sampleRate;
        const wave1 = Math.sin(2 * Math.PI * 0.1 * time) * 0.3;
        const wave2 = Math.sin(2 * Math.PI * 0.15 * time) * 0.2;
        const wave3 = Math.sin(2 * Math.PI * 0.07 * time) * 0.25;
        
        data[i] = (noise * 0.15) + wave1 + wave2 + wave3;
      }
    }

    return buffer;
  }

  private createRainSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      for (let i = 0; i < bufferSize; i++) {
        // High-frequency white noise for rain
        let value = Math.random() * 2 - 1;
        
        // Add some variation in intensity
        const time = i / this.audioContext.sampleRate;
        const intensity = 0.7 + Math.sin(2 * Math.PI * 0.3 * time) * 0.3;
        
        data[i] = value * intensity * 0.4;
      }
    }

    return buffer;
  }

  private createForestSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const bufferSize = this.audioContext.sampleRate * 4;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      for (let i = 0; i < bufferSize; i++) {
        const time = i / this.audioContext.sampleRate;
        
        // Gentle rustling (pink noise)
        const rustling = (Math.random() * 2 - 1) * 0.05;
        
        // Bird chirps (random high-frequency tones)
        let chirp = 0;
        if (Math.random() < 0.001) {
          const freq = 2000 + Math.random() * 2000;
          chirp = Math.sin(2 * Math.PI * freq * time) * 0.15;
        }
        
        // Ambient background
        const ambient = Math.sin(2 * Math.PI * 0.05 * time) * 0.02;
        
        data[i] = rustling + chirp + ambient;
      }
    }

    return buffer;
  }

  private createRiverSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const bufferSize = this.audioContext.sampleRate * 3;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      for (let i = 0; i < bufferSize; i++) {
        const time = i / this.audioContext.sampleRate;
        
        // White noise for water turbulence
        const noise = Math.random() * 2 - 1;
        
        // Flow motion
        const flow1 = Math.sin(2 * Math.PI * 0.2 * time) * 0.2;
        const flow2 = Math.sin(2 * Math.PI * 0.35 * time) * 0.15;
        const flow3 = Math.sin(2 * Math.PI * 0.13 * time) * 0.18;
        
        data[i] = (noise * 0.25) + flow1 + flow2 + flow3;
      }
    }

    return buffer;
  }

  private createWindSound(): AudioBuffer {
    if (!this.audioContext) throw new Error('Audio context not initialized');

    const bufferSize = this.audioContext.sampleRate * 3;
    const buffer = this.audioContext.createBuffer(2, bufferSize, this.audioContext.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel);

      for (let i = 0; i < bufferSize; i++) {
        const time = i / this.audioContext.sampleRate;
        
        // Pink noise base
        const noise = Math.random() * 2 - 1;
        
        // Wind gusts (low frequency modulation)
        const gust1 = Math.sin(2 * Math.PI * 0.08 * time) * 0.3;
        const gust2 = Math.sin(2 * Math.PI * 0.12 * time) * 0.2;
        const gust3 = Math.sin(2 * Math.PI * 0.05 * time) * 0.25;
        
        const intensity = 0.5 + gust1 + gust2 + gust3;
        
        data[i] = noise * intensity * 0.2;
      }
    }

    return buffer;
  }

  async playSound(soundType: SoundType, volume: number = 0.5) {
    await this.initialize();
    
    if (!this.audioContext || !this.masterGain) {
      throw new Error('Audio context not initialized');
    }

    // Stop any existing sounds
    this.stopAll();

    let buffer: AudioBuffer;
    let filterFrequency = 2000; // Default filter frequency

    switch (soundType) {
      case 'ocean':
        buffer = this.createOceanSound();
        filterFrequency = 1200;
        break;
      case 'rain':
        buffer = this.createRainSound();
        filterFrequency = 3000;
        break;
      case 'forest':
        buffer = this.createForestSound();
        filterFrequency = 4000;
        break;
      case 'river':
        buffer = this.createRiverSound();
        filterFrequency = 2000;
        break;
      case 'wind':
        buffer = this.createWindSound();
        filterFrequency = 800;
        break;
      case 'white-noise':
        buffer = this.createNoiseBuffer('white');
        filterFrequency = 8000;
        break;
      case 'brown-noise':
        buffer = this.createNoiseBuffer('brown');
        filterFrequency = 500;
        break;
      default:
        buffer = this.createOceanSound();
    }

    // Create audio source
    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Create filter for more natural sound
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(filterFrequency, this.audioContext.currentTime);
    filter.Q.setValueAtTime(1, this.audioContext.currentTime);

    // Set volume
    this.masterGain.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);

    // Connect nodes
    source.connect(filter);
    filter.connect(this.masterGain);

    // Start playback
    source.start();
    this.sources.push(source);
  }

  // Alias for playSound
  async play(soundType: SoundType, volume: number = 0.5) {
    return this.playSound(soundType, volume);
  }

  setVolume(volume: number) {
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(volume * 0.5, this.audioContext.currentTime);
    }
  }

  stopAll() {
    // Stop all buffer sources
    this.sources.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.sources = [];

    // Stop all oscillators
    this.oscillators.forEach(osc => {
      try {
        osc.stop();
      } catch (e) {
        // Already stopped
      }
    });
    this.oscillators = [];
  }

  // Alias for stopAll
  stop() {
    return this.stopAll();
  }

  cleanup() {
    this.stopAll();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
      this.masterGain = null;
    }
  }
}