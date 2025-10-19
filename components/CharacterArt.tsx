import React from 'react';
import { AnimationState } from '../types';

interface CharacterArtProps {
  characterName: string;
  className?: string;
  animation?: AnimationState;
}

interface CharacterComponentProps {
    className?: string;
    animation?: AnimationState;
}

const LoopLord: React.FC<CharacterComponentProps> = ({ className, animation }) => {
    const isWin = animation === AnimationState.WIN;
    const isLose = animation === AnimationState.LOSE;
    return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <style>{`
      .loop-ring { animation: rotate 4s linear infinite; transform-origin: center; }
      .loop-ring2 { animation: rotate 6s linear infinite reverse; transform-origin: center; }
      .core { animation: pulse-core 2s ease-in-out infinite; transform-origin: center; }
      @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes pulse-core { 50% { transform: scale(1.1); filter: brightness(1.2); } }
      
      .core-intro { animation: core-intro-anim 1s ease-out forwards; }
      .ring-intro { animation: ring-intro-anim 1.5s ease-out forwards; stroke-dasharray: 200; stroke-dashoffset: 200; }
      @keyframes core-intro-anim {
        from { transform: scale(0); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
      @keyframes ring-intro-anim {
        from { stroke-dashoffset: 200; }
        to { stroke-dashoffset: 0; }
      }

      .win-lord .core { animation: pulse-core 0.5s ease-in-out infinite; }
      .win-lord .loop-ring { animation: rotate 1s linear infinite; filter: drop-shadow(0 0 5px #d946ef); }
      .win-lord .loop-ring2 { animation: rotate 2s linear infinite reverse; }
      .lose-lord { animation: fade-out 1s ease-in forwards; filter: grayscale(1); }
      @keyframes fade-out { to { opacity: 0.4; } }
    `}</style>
    <g className={`${isWin ? 'win-lord' : ''} ${isLose ? 'lose-lord' : ''}`}>
        <g className={animation === AnimationState.INTRO ? 'core-intro' : 'core'}>
            <circle cx="50" cy="50" r="15" fill="url(#gradLord)"/>
            <path d="M 50 35 L 55 50 L 50 65 L 45 50 Z" fill="#111" />
        </g>
        <path d="M 20 50 A 30 30 0 0 1 80 50 A 30 30 0 0 1 20 50" stroke="url(#gradLord)" strokeWidth="4" fill="none" className={animation === AnimationState.INTRO ? 'ring-intro' : 'loop-ring'} strokeLinecap="round"/>
        <path d="M 30 50 A 20 20 0 0 0 70 50 A 20 20 0 0 0 30 50" stroke="url(#gradLord)" strokeWidth="3" fill="none" className={animation === AnimationState.INTRO ? 'ring-intro' : 'loop-ring2'} style={animation === AnimationState.INTRO ? { animationDelay: '0.2s' } : {strokeDasharray: '5 5'}} strokeLinecap="round"/>
    </g>
    <defs>
      <linearGradient id="gradLord" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#d946ef" />
        <stop offset="100%" stopColor="#f472b6" />
      </linearGradient>
    </defs>
  </svg>
    )
};

const Debugger: React.FC<CharacterComponentProps> = ({ className, animation }) => {
    const isWin = animation === AnimationState.WIN;
    const isLose = animation === AnimationState.LOSE;
    return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <style>{`
      .scan-line { animation: scan 3s linear infinite; }
      .bug { animation: bug-flicker 1.5s ease-in-out infinite; }
      @keyframes scan { 0%, 100% { y: 25px; } 50% { y: 75px; } }
      @keyframes bug-flicker { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

      .debugger-intro { animation: debugger-intro-anim 1.2s ease-out forwards; transform: translateX(-50px); opacity: 0; }
      .scan-intro { animation: scan-intro-anim 1.5s ease-out forwards; }
      .bug-intro { animation: bug-intro-anim 1.5s ease-in forwards; opacity: 0; }
      @keyframes debugger-intro-anim { to { transform: translateX(0); opacity: 1; } }
      @keyframes scan-intro-anim { 0%, 100% { opacity: 0; } 50% { opacity: 0.7; transform: translateY(0); } 90% { opacity: 0.7; transform: translateY(50px); } }
      @keyframes bug-intro-anim { 60%, 100% { opacity: 1; } }

      .win-debugger { animation: bounce-win 1s ease-in-out; }
      .win-debugger circle { filter: drop-shadow(0 0 8px #22d3ee); }
      @keyframes bounce-win { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
      
      .lose-debugger { animation: glitch-lose 0.5s linear infinite; }
      @keyframes glitch-lose {
        0% { transform: translate(0,0); opacity: 1; }
        25% { transform: translate(-2px, 2px); opacity: 0.8; }
        50% { transform: translate(2px, -2px); opacity: 1; }
        75% { transform: translate(2px, 2px); opacity: 0.8; }
        100% { transform: translate(-2px, -2px); opacity: 1; }
      }
    `}</style>
    <g className={`${isWin ? 'win-debugger' : ''} ${isLose ? 'lose-debugger' : ''}`}>
        <path className={animation === AnimationState.INTRO ? 'bug-intro' : 'bug'} d="M40 60 Q50 30 60 60 L70 70 L60 80 L50 70 L40 80 L30 70 Z" fill="#a3e635"/>
        <g className={animation === AnimationState.INTRO ? 'debugger-intro' : ''}>
            <circle cx="45" cy="45" r="25" stroke="url(#gradDebugger)" strokeWidth="6" fill="none" />
            <line x1="62" y1="62" x2="80" y2="80" stroke="url(#gradDebugger)" strokeWidth="8" strokeLinecap="round" />
        </g>
        <rect className={animation === AnimationState.INTRO ? 'scan-intro' : 'scan-line'} x="20" y="25" width="50" height="2" fill="url(#gradDebugger)" />
    </g>
    <defs>
      <linearGradient id="gradDebugger" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#67e8f9" />
      </linearGradient>
    </defs>
  </svg>
    )
};

const ArrayQueen: React.FC<CharacterComponentProps> = ({ className, animation }) => {
    const isWin = animation === AnimationState.WIN;
    const isLose = animation === AnimationState.LOSE;
    return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <style>{`
      .minion1 { animation: orbit1 5s linear infinite; transform-origin: 50% 50%; }
      .minion2 { animation: orbit2 6s linear infinite; transform-origin: 50% 50%; }
      .minion3 { animation: orbit3 4s linear infinite; transform-origin: 50% 50%; }
      .queen-core { animation: pulse-queen 2.5s ease-in-out infinite; }
      @keyframes orbit1 { from { transform: rotate(0deg) translateX(35px) rotate(0deg); } to { transform: rotate(360deg) translateX(35px) rotate(-360deg); } }
      @keyframes orbit2 { from { transform: rotate(120deg) translateX(40px) rotate(0deg); } to { transform: rotate(480deg) translateX(40px) rotate(-360deg); } }
      @keyframes orbit3 { from { transform: rotate(240deg) translateX(30px) rotate(0deg); } to { transform: rotate(600deg) translateX(30px) rotate(-360deg); } }
      @keyframes pulse-queen { 50% { filter: drop-shadow(0 0 5px #34d399); } }

      .minion-intro { animation: minion-intro-anim 1.5s ease-out forwards; transform-origin: 50% 50%; }
      .queen-core-intro { animation: core-intro-anim 1s ease-out forwards; }
      @keyframes minion-intro-anim {
        from { transform: translate(-50%, -50%) scale(0); }
        to { transform: var(--final-pos) scale(1); }
      }

      .win-queen .minion1 { animation-duration: 1.5s; }
      .win-queen .minion2 { animation-duration: 2s; }
      .win-queen .minion3 { animation-duration: 1s; }
      .win-queen .queen-core { animation: pulse-queen 0.8s ease-in-out infinite; }
      
      .lose-queen .minion1, .lose-queen .minion2, .lose-queen .minion3 { animation: fall-lose 1s ease-in forwards; }
      .lose-queen .minion2 { animation-delay: 0.1s; }
      .lose-queen .minion3 { animation-delay: 0.2s; }
      .lose-queen .queen-core { filter: grayscale(1); opacity: 0.6; }
      @keyframes fall-lose { 
        to { transform: translateY(40px) rotate(90deg); opacity: 0; } 
      }
    `}</style>
    <g className={`${isWin ? 'win-queen' : ''} ${isLose ? 'lose-queen' : ''}`}>
        <g className={animation === AnimationState.INTRO ? 'queen-core-intro' : 'queen-core'}>
            <path d="M50 30 L65 50 L50 70 L35 50 Z" fill="url(#gradQueen)"/>
        </g>
        <rect width="10" height="10" rx="2" fill="url(#gradQueen)" className={animation === AnimationState.INTRO ? 'minion-intro' : 'minion1'} style={{'--final-pos': 'rotate(0deg) translateX(35px) rotate(0deg)'} as React.CSSProperties} />
        <rect width="12" height="12" rx="2" fill="url(#gradQueen)" className={animation === AnimationState.INTRO ? 'minion-intro' : 'minion2'} style={{'--final-pos': 'rotate(120deg) translateX(40px) rotate(0deg)', animationDelay: '0.1s'} as React.CSSProperties} />
        <rect width="8" height="8" rx="2" fill="url(#gradQueen)" className={animation === AnimationState.INTRO ? 'minion-intro' : 'minion3'} style={{'--final-pos': 'rotate(240deg) translateX(30px) rotate(0deg)', animationDelay: '0.2s'} as React.CSSProperties}/>
    </g>
    <defs>
      <linearGradient id="gradQueen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#a7f3d0" />
      </linearGradient>
    </defs>
  </svg>
    )
};

const SyntaxSamurai: React.FC<CharacterComponentProps> = ({ className, animation }) => {
    const isWin = animation === AnimationState.WIN;
    const isLose = animation === AnimationState.LOSE;
    return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <style>{`
      .slash { animation: slash-anim 3s ease-out infinite; stroke-dasharray: 100; stroke-dashoffset: 100; opacity: 0;}
      .samurai-body { animation: samurai-float 4s ease-in-out infinite; }
      @keyframes slash-anim { 20% { stroke-dashoffset: 0; opacity: 1; } 60% { stroke-dashoffset: -100; opacity: 0; } 100% { opacity: 0; } }
      @keyframes samurai-float { 50% { transform: translateY(-3px); } }

      .body-intro { animation: body-intro-anim 1.2s ease-out forwards; opacity: 0; }
      .slash-intro { animation: slash-intro-anim 1.5s ease-out forwards; stroke-dasharray: 150; stroke-dashoffset: 150; }
      @keyframes body-intro-anim { 20% { opacity: 0; } 100% { opacity: 1; } }
      @keyframes slash-intro-anim { 
        20% { stroke-dashoffset: 150; }
        50% { stroke-dashoffset: 0; }
        80% { stroke-dashoffset: -150; }
      }
      
      .win-samurai .samurai-body { animation: pose-win 2s ease-in-out; transform-origin: bottom center; }
      @keyframes pose-win { 
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.1) translateY(-5px); }
      }
      .win-samurai .slash {
          animation: slash-anim 1.5s ease-out infinite;
          stroke: #f87171;
      }

      .lose-samurai { animation: dissolve-lose 2s forwards; }
      .lose-samurai path { stroke-dasharray: 10; animation: dissolve-stroke 2s forwards; }
      @keyframes dissolve-lose {
          to { opacity: 0; transform: translateY(10px); }
      }
      @keyframes dissolve-stroke {
          to { stroke-dashoffset: 100; }
      }
    `}</style>
    <g className={`${isWin ? 'win-samurai' : ''} ${isLose ? 'lose-samurai' : ''}`}>
        <g className={animation === AnimationState.INTRO ? 'body-intro' : 'samurai-body'}>
          <path d="M 50 20 L 80 80 H 20 Z" fill="#333" stroke="url(#gradSamurai)" strokeWidth="3"/>
          <path d="M 50 30 L 70 70 H 30 Z" fill="url(#gradSamurai)" />
          <circle cx="50" cy="45" r="5" fill="#fff" />
        </g>
        <path className={animation === AnimationState.INTRO ? 'slash-intro' : 'slash'} d="M 20 25 L 80 75" stroke="white" strokeWidth="4" fill="none" />
    </g>
     <defs>
      <linearGradient id="gradSamurai" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#f87171" />
      </linearGradient>
    </defs>
  </svg>
    )
};


const CharacterArt: React.FC<CharacterArtProps> = ({ characterName, className, animation }) => {
  switch (characterName) {
    case 'Loop Lord':
      return <LoopLord className={className} animation={animation} />;
    case 'Debugger':
      return <Debugger className={className} animation={animation} />;
    case 'Array Queen':
      return <ArrayQueen className={className} animation={animation} />;
    case 'Syntax Samurai':
      return <SyntaxSamurai className={className} animation={animation} />;
    default:
      return null;
  }
};

export default CharacterArt;