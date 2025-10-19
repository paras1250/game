

import { GoogleGenAI, Modality } from "@google/genai";
import { SoundType, type Puzzle, type Character } from '../types';

// Base64 decoding function
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Raw PCM audio data decoding function
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext
    }
}

export type BanterType = 'taunt' | 'victory' | 'defeat';

class AudioService {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sounds: { [key in SoundType]?: { frequency: number, type: OscillatorType, duration: number } } = {};
  
  private isMuted: boolean = false;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private musicTimeout: any = null;
  private bgmNotes = [110.00, 130.81, 146.83, 130.81]; // A2, C3, D3, C3
  private noteIndex = 0;
  
  private ai: GoogleGenAI | null = null;
  private currentSpeechSource: AudioBufferSourceNode | null = null;

  constructor() {
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Global volume
      this.masterGain.connect(this.audioContext.destination);
    }
    this.sounds[SoundType.CLICK] = { frequency: 880, type: 'triangle', duration: 0.05 };
    
    if (process.env.API_KEY) {
        this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
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
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    const now = this.audioContext.currentTime;
    
    switch(sound) {
        case SoundType.SELECT_CHAR:
            this.playSweep(300, 600, 0.2, now, 'triangle');
            return;
        case SoundType.ENTER_TRAINING:
            this.playNote(220.00, 0.1, now, 'sine');
            this.playNote(329.63, 0.1, now + 0.1, 'sine');
            this.playNote(440.00, 0.15, now + 0.2, 'sine');
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
            this.playNote(116.54, 0.3, now, 'sawtooth', 0.3);
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
  
  async getHint(puzzle: Puzzle): Promise<string> {
    if (!this.ai) {
        console.error("AI service not initialized for hints.");
        return "Hint service is currently unavailable.";
    }

    const prompt = `You are a helpful coding tutor in a futuristic fighting game. A player is stuck on a puzzle. Provide a single, short, encouraging sentence as a hint to guide them. Do NOT give away the answer or the code. Focus on the core concept.

    - The problem is: "${puzzle.problem}"
    - The code snippet is: \`${puzzle.question}\`
    - The direct answer is "${puzzle.answer}", so your hint should lead them to think of this without saying it.
    - Example hint format: "Remember how you can repeat actions a specific number of times?" or "Think about the special property that tells you how long a list is."

    Your hint:`;

    try {
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error fetching hint from Gemini API:", error);
        return "There was an issue connecting to the AI tutor. Please check your connection.";
    }
  }
  
  async getBanter(character: Character, opponent: Character, type: BanterType): Promise<string> {
    if (!this.ai) return "...";

    const prompt = `You are playing a character in a futuristic coding-themed fighting game. Your character is ${character.name}, who is a "${character.description}".
    Your opponent is ${opponent.name}.
    
    Based on your character, generate a single, short, witty line for the following situation:
    - Situation: ${type}
    
    Keep it under 15 words. Be creative and funny. For example:
    - A taunt from Loop Lord might be: "Get ready for an infinite loop of pain!"
    - A victory line from Debugger might be: "Looks like your logic had a fatal flaw."
    - A defeat line from Array Queen might be: "My minions... my precious minions!"
    
    Now, generate the line for ${character.name}:`;

    try {
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.replace(/"/g, ''); // Remove quotes from AI response
    } catch (error) {
        console.error("Error fetching banter from Gemini API:", error);
        if (type === 'taunt') return "Let's do this!";
        if (type === 'victory') return "I am victorious!";
        return "I am defeated.";
    }
  }

  async speak(text: string, onEnded: () => void): Promise<void> {
    if (!this.ai || !this.audioContext || !this.masterGain) {
        console.error("TTS not initialized or not supported.");
        onEnded();
        return;
    }
    
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    this.stopSpeech();

    try {
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Say with a futuristic, digital voice: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("No audio data in response");

        const audioBuffer = await decodeAudioData(
            decode(base64Audio),
            this.audioContext,
            24000,
            1,
        );

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;
        
        const speechGain = this.audioContext.createGain();
        speechGain.gain.value = 1.0; // Speech volume
        source.connect(speechGain);
        speechGain.connect(this.masterGain);

        source.onended = () => {
            this.currentSpeechSource = null;
            onEnded();
        };
        
        source.start();
        this.currentSpeechSource = source;

    } catch (error) {
        console.error("Error generating or playing speech:", error);
        onEnded();
    }
  }

  stopSpeech() {
      if (this.currentSpeechSource) {
          this.currentSpeechSource.onended = null; // Prevent onEnded from firing on manual stop
          this.currentSpeechSource.stop();
          this.currentSpeechSource = null;
      }
  }
}

export const audioService = new AudioService();
