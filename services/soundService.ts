import { SoundType } from '../types';

declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}

class SoundService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sounds: { [key in SoundType]?: { frequency: number, type: OscillatorType, duration: number } } = {};
  
  private isMuted: boolean = false;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private musicTimeout: any = null;
  private bgmNotes = [110.00, 130.81, 146.83, 130.81]; // A2, C3, D3, C3
  private noteIndex = 0;


  constructor() {
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Global volume
      this.masterGain.connect(this.audioContext.destination);
    }
    // Define fallback sounds
    this.sounds[SoundType.CLICK] = { frequency: 880, type: 'triangle', duration: 0.05 };
    // Other sounds will be generated dynamically.
  }

  private playNote(frequency: number, duration: number, startTime: number, type: OscillatorType, volume: number = 0.5) {
    if (!this.audioContext || !this.masterGain) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.type = type;

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playSweep(startFreq: number, endFreq: number, duration: number, startTime: number, type: OscillatorType, volume: number = 0.5) {
      if (!this.audioContext || !this.masterGain) return;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);

      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
  }

  private playNoise(duration: number, startTime: number, volume: number = 0.4) {
      if (!this.audioContext || !this.masterGain) return;
      const bufferSize = this.audioContext.sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
      }

      const noise = this.audioContext.createBufferSource();
      noise.buffer = buffer;
      
      const gain = this.audioContext.createGain();
      gain.connect(this.masterGain);
      
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      noise.connect(gain);
      noise.start(startTime);
      noise.stop(startTime + duration);
  }

  playSound(sound: SoundType) {
    if (!this.audioContext || !this.masterGain) {
      console.warn("AudioContext not supported");
      return;
    }
    // Resume audio context on user interaction
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    const now = this.audioContext.currentTime;
    
    switch(sound) {
        case SoundType.SELECT_CHAR:
            this.playSweep(300, 600, 0.2, now, 'triangle');
            return;
        case SoundType.ENTER_TRAINING:
            this.playNote(220.00, 0.1, now, 'sine'); // A3
            this.playNote(329.63, 0.1, now + 0.1, 'sine'); // E4
            this.playNote(440.00, 0.15, now + 0.2, 'sine'); // A4
            return;
        case SoundType.NEW_PUZZLE:
            this.playSweep(440, 660, 0.1, now, 'sine', 0.3);
            return;
        case SoundType.ATTACK:
            this.playSweep(400, 100, 0.2, now, 'square', 0.4);
            return;
        case SoundType.SUCCESS:
            this.playNote(523.25, 0.1, now, 'triangle', 0.4);
            this.playNote(659.25, 0.1, now + 0.1, 'triangle', 0.4);
            this.playNote(783.99, 0.1, now + 0.2, 'triangle', 0.4);
            return;
        case SoundType.FAIL:
            this.playNote(110, 0.3, now, 'sawtooth', 0.3);
            this.playNote(116.54, 0.3, now, 'sawtooth', 0.3); // Dissonant note
            return;
        case SoundType.PLAYER_HIT:
        case SoundType.OPPONENT_HIT:
            this.playNoise(0.15, now);
            return;
        case SoundType.WIN:
            this.playNote(523.25, 0.15, now, 'sine');
            this.playNote(659.25, 0.15, now + 0.2, 'sine');
            this.playNote(783.99, 0.15, now + 0.4, 'sine');
            this.playNote(1046.50, 0.3, now + 0.6, 'sine');
            return;
        case SoundType.LOSE:
            this.playSweep(261.63, 196.00, 0.6, now, 'sawtooth');
            return;
        default:
            const soundData = this.sounds[sound];
            if (!soundData) return;
            this.playNote(soundData.frequency, soundData.duration, now, soundData.type);
            return;
    }
  }

  playBackgroundMusic() {
    if (this.bgmOscillator || !this.audioContext || !this.masterGain) return;
    
    this.bgmOscillator = this.audioContext.createOscillator();
    this.bgmGain = this.audioContext.createGain();

    this.bgmOscillator.type = 'sawtooth';
    this.bgmGain.gain.value = 0.1;

    this.bgmOscillator.connect(this.bgmGain);
    this.bgmGain.connect(this.masterGain);
    this.bgmOscillator.start();

    const playNote = () => {
        if (!this.bgmOscillator || !this.audioContext) return;
        const freq = this.bgmNotes[this.noteIndex % this.bgmNotes.length];
        this.bgmOscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
        this.noteIndex++;
        this.musicTimeout = setTimeout(playNote, 400);
    };
    playNote();
  }

  stopBackgroundMusic() {
      if (this.musicTimeout) clearTimeout(this.musicTimeout);
      if (this.bgmOscillator) {
          this.bgmOscillator.stop();
          this.bgmOscillator.disconnect();
      }
      this.musicTimeout = null;
      this.bgmOscillator = null;
      this.noteIndex = 0;
  }
  
  toggleMute(): boolean {
      if (!this.masterGain) return this.isMuted;
      this.isMuted = !this.isMuted;
      this.masterGain.gain.value = this.isMuted ? 0 : 0.3;
      return this.isMuted;
  }
}

export const soundService = new SoundService();