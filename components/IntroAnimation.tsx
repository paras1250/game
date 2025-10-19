import React, { useEffect, useState, useMemo } from 'react';

interface IntroAnimationProps {
  onComplete: () => void;
}

const GLITCH_WORDS = [
  'ERROR_404', 'SEGFAULT', 'COMPILING...', '0xDEADBEEF', 'BUFFER_OVERFLOW',
  'SYNTAX_ERR', 'UNDEFINED', 'NULL', 'NaN', 'INITIALIZING...', 'ACCESS_DENIED',
  'RECURSION_ERROR', 'FATAL_EXCEPTION', 'CORE_DUMP', './a.out'
];

const GLITCH_COLORS = ['#ef4444', '#f87171', '#22d3ee', '#67e8f9', '#34d399', '#a7f3d0', '#facc15'];

const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const GlitchParticle: React.FC = () => {
    const style = {
        top: `${getRandomInt(0, 100)}%`,
        left: `${getRandomInt(0, 100)}%`,
        fontSize: `${getRandomInt(12, 26)}px`,
        color: getRandom(GLITCH_COLORS),
        textShadow: `0 0 5px ${getRandom(GLITCH_COLORS)}`,
        animationDelay: `${Math.random() * 2}s`,
        animationDuration: `${Math.random() * 1 + 0.5}s`,
    };
    return <span className="glitch-particle" style={style}>{getRandom(GLITCH_WORDS)}</span>;
};


const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'glitching' | 'resolving' | 'fading'>('glitching');
  const particles = useMemo(() => Array.from({ length: 60 }).map((_, i) => <GlitchParticle key={i} />), []);

  useEffect(() => {
    const glitchTimer = setTimeout(() => setPhase('resolving'), 2500);
    const fadeTimer = setTimeout(() => setPhase('fading'), 3800);
    const completeTimer = setTimeout(onComplete, 4800);

    return () => {
      clearTimeout(glitchTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const getPhaseClass = () => {
    switch (phase) {
      case 'glitching':
      case 'resolving': 
        return 'opacity-100';
      case 'fading': 
        return 'opacity-0';
      default: 
        return 'opacity-0';
    }
  };

  return (
    <div className={`fixed inset-0 bg-slate-900 flex items-center justify-center z-[100] transition-opacity duration-1000 ${getPhaseClass()}`}>
        <style>{`
            .intro-container {
                position: absolute;
                inset: 0;
                overflow: hidden;
                background-color: #020617;
                background-image:
                    linear-gradient(rgba(20, 83, 45, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(20, 83, 45, 0.05) 1px, transparent 1px);
                background-size: 25px 25px;
            }
            @keyframes scanline-anim {
                0% { transform: translateY(-10%); }
                100% { transform: translateY(110vh); }
            }
            .scanline {
                position: absolute;
                top: 0; left: 0; right: 0;
                height: 4px;
                background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.4), transparent);
                animation: scanline-anim 4s linear infinite;
                opacity: 0.6;
                z-index: 2;
            }
            .vignette {
                position: absolute;
                inset: 0;
                box-shadow: inset 0 0 100px 20px rgba(0, 0, 0, 0.7);
                z-index: 3;
            }
            .glitch-particle {
                position: absolute;
                font-family: 'Courier New', Courier, monospace;
                font-weight: bold;
                opacity: 0;
                animation: flash 1s steps(1, end) infinite;
                z-index: 1;
            }
            @keyframes flash {
                0%, 100% { opacity: 0; transform: scale(1); }
                5%, 50% { opacity: 1; transform: scale(1.05); }
            }
            .logo-container {
                position: relative;
                text-align: center;
                z-index: 10;
            }
            .glitch-title {
                font-family: 'Courier New', Courier, monospace;
                font-weight: bold;
                color: #fca5a5;
                position: relative;
                animation: screen-jump 0.8s cubic-bezier(.25, .46, .45, .94) both infinite, text-flicker 3s linear infinite;
                text-shadow: 0 0 5px #ef4444, 0 0 10px #ef4444;
                transition: all 0.5s ease-out;
            }
            @keyframes text-flicker {
                0%, 100% { opacity: 1; }
                50.2% { opacity: 0.8; }
            }
            .glitch-title[data-text]::before,
            .glitch-title[data-text]::after {
                content: attr(data-text);
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: #020617;
                overflow: hidden;
            }
            .glitch-title[data-text]::before {
                left: 2px;
                text-shadow: -2px 0 #ef4444;
                clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
                animation: glitch-anim-1 2s infinite linear alternate-reverse;
            }
            .glitch-title[data-text]::after {
                left: -2px;
                text-shadow: 2px 0 #22d3ee;
                clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
                animation: glitch-anim-2 3s infinite linear alternate-reverse;
            }
            .resolved .glitch-title {
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                animation: none;
                background-image: linear-gradient(45deg, #ef4444, #facc15);
                -webkit-background-clip: text;
                background-clip: text;
                color: transparent;
                text-shadow: none;
                filter: drop-shadow(0 0 8px rgba(250, 204, 21, 0.5));
            }
             .resolved .glitch-title[data-text]::before,
             .resolved .glitch-title[data-text]::after {
                display: none;
             }
             .subtitle {
                font-family: 'Courier New', Courier, monospace;
                opacity: 0;
                transition: opacity 0.5s ease-out, font-family 0.5s ease-out;
             }
             .resolved .subtitle {
                 font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                 opacity: 1;
             }
            @keyframes screen-jump {
                0%, 100% { transform: translate(0,0); } 10% { transform: translate(-2px, 2px); } 20% { transform: translate(2px, -2px); }
                30% { transform: translate(-3px, 3px); } 40% { transform: translate(3px, -3px); } 50% { transform: translate(-1px, 1px); }
                60% { transform: translate(1px, -1px); } 70% { transform: translate(-2px, 1px); } 80% { transform: translate(1px, -2px); }
                90% { transform: translate(-1px, 2px); }
            }
            @keyframes glitch-anim-1 {
                0% { clip-path: polygon(0 2%, 100% 2%, 100% 33%, 0 33%); }
                25% { clip-path: polygon(0 40%, 100% 40%, 100% 45%, 0 45%); }
                50% { clip-path: polygon(0 60%, 100% 60%, 100% 80%, 0 80%); }
                75% { clip-path: polygon(0 15%, 100% 15%, 100% 25%, 0 25%); }
                100% { clip-path: polygon(0 90%, 100% 90%, 100% 95%, 0 95%); }
            }
            @keyframes glitch-anim-2 {
                0% { clip-path: polygon(0 67%, 100% 67%, 100% 68%, 0 68%); }
                15% { clip-path: polygon(0 15%, 100% 15%, 100% 25%, 0 25%); }
                40% { clip-path: polygon(0 80%, 100% 80%, 100% 82%, 0 82%); }
                65% { clip-path: polygon(0 40%, 100% 40%, 100% 42%, 0 42%); }
                100% { clip-path: polygon(0 5%, 100% 5%, 100% 10%, 0 10%); }
            }
        `}</style>
        <div className="intro-container">
            {phase === 'glitching' && particles}
            <div className="scanline"></div>
            <div className="vignette"></div>
        </div>
        
        <div className={`logo-container transition-all duration-500 ${phase === 'resolving' ? 'resolved' : ''}`}>
            <h1 className="glitch-title text-5xl md:text-8xl" data-text="Code Clash">
                Code Clash
            </h1>
            <p className="subtitle text-xl md:text-2xl text-yellow-300 mt-2 font-semibold tracking-wider opacity-90 transition-opacity duration-1000">
                Battle of the Bugs
            </p>
        </div>
    </div>
  );
};

export default IntroAnimation;
