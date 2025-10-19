

import React, { useState, useEffect, useRef } from 'react';
// FIX: Import Difficulty type
import type { Puzzle, Difficulty } from '../types';
import { GAME_CONSTANTS } from '../constants';
import { audioService } from '../services/audioService';

interface CodingChallengeModalProps {
  puzzle: Puzzle;
  onSolve: () => void;
  onFail: () => void;
  onSkip: () => void;
  solvedPuzzleIds: Set<number>;
  // FIX: Add difficulty to props to determine timer length
  difficulty: Difficulty;
}

const SpeakerIcon: React.FC<{isSpeaking: boolean; onClick: () => void}> = ({ isSpeaking, onClick }) => (
    <button onClick={onClick} type="button" aria-label="Read problem aloud" className={`ml-2 p-1 rounded-full hover:bg-gray-600 transition-colors ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-gray-400'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
    </button>
);

const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.657a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 14.95a1 1 0 001.414 1.414l.707-.707a1 1 0 00-1.414-1.414l-.707.707zM4 10a1 1 0 01-1 1H2a1 1 0 110-2h1a1 1 0 011 1zM10 18a1 1 0 001-1v-1a1 1 0 10-2 0v1a1 1 0 001 1zM3.636 4.95a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM10 5a5 5 0 100 10 5 5 0 000-10z" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

// FIX: Destructure difficulty from props
const CodingChallengeModal: React.FC<CodingChallengeModalProps> = ({ puzzle, onSolve, onFail, onSkip, solvedPuzzleIds, difficulty }) => {
  const [answer, setAnswer] = useState('');
  // FIX: Initialize timeLeft state with the correct numeric value based on difficulty
  const [timeLeft, setTimeLeft] = useState(GAME_CONSTANTS.PUZZLE_TIMER_SECONDS[difficulty]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintLoading, setIsHintLoading] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onFail();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup function
    return () => {
        clearInterval(timer);
        audioService.stopSpeech();
    };
  }, [onFail]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === puzzle.answer.replace(/"/g, '').toLowerCase()) {
      onSolve();
    } else {
      onFail();
    }
  };

  const handleSpeak = () => {
    if (isSpeaking) {
        audioService.stopSpeech();
        setIsSpeaking(false);
    } else {
        setIsSpeaking(true);
        audioService.speak(puzzle.problem, () => setIsSpeaking(false));
    }
  };
  
  const handleGetHint = async () => {
    if (hintUsed || isHintLoading) return;
    setIsHintLoading(true);
    setHintUsed(true);
    try {
        const hintText = await audioService.getHint(puzzle);
        setHint(hintText);
    } catch (error) {
        console.error("Error getting hint:", error);
        setHint("Sorry, the AI tutor is busy. Please try again later.");
    } finally {
        setIsHintLoading(false);
    }
  };


  const renderPuzzle = () => {
    const parts = puzzle.question.split('{INPUT}');
    return (
        <code className="text-xl md:text-2xl text-green-300 bg-gray-800 p-4 rounded-md inline-flex items-center flex-wrap justify-center">
            <span>{parts[0]}</span>
            <input
                ref={inputRef}
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="bg-transparent border-b-2 border-yellow-400 text-yellow-300 w-24 md:w-32 text-center mx-2 focus:outline-none focus:border-yellow-200 font-mono"
                autoComplete="off"
                spellCheck="false"
            />
            <span>{parts[1]}</span>
        </code>
    );
  };
  
  const timerColor = timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-yellow-400';
  // FIX: Calculate timer width using the correct max time for the current difficulty
  const timerWidth = (timeLeft / GAME_CONSTANTS.PUZZLE_TIMER_SECONDS[difficulty]) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 backdrop-blur-md">
       <style>{`
            @keyframes fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
      <div className="relative bg-gray-900 border-4 border-fuchsia-500 rounded-xl shadow-2xl shadow-fuchsia-500/50 p-6 md:p-8 w-11/12 max-w-2xl text-center">
        <button onClick={onSkip} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors z-10 p-2" aria-label="Exit puzzle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <h2 className="text-3xl md:text-4xl font-bold text-red-500 mb-2">⚠️ Syntax Error Detected!</h2>
        <h3 className="text-xl font-bold text-cyan-400 mb-2">Concept: {puzzle.concept}</h3>
        <p className="text-lg text-gray-300 mb-2">Complete the code to execute your attack!</p>
        <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700 mb-6 flex items-center justify-between">
            <p className="text-lg text-yellow-400 font-semibold text-left flex-1">{puzzle.problem}</p>
            <SpeakerIcon isSpeaking={isSpeaking} onClick={handleSpeak} />
        </div>
        
        { (isHintLoading || hint) && (
            <div className="mb-6 p-3 rounded-md bg-cyan-900/50 border border-cyan-700 text-left animate-fade-in">
                <p className="font-bold text-cyan-400 flex items-center gap-2 font-mono">
                    // AI Tutor Hint
                </p>
                <div className="mt-2 text-cyan-200">
                    {isHintLoading ? (
                        <p className="italic animate-pulse">Thinking of a good hint...</p>
                    ) : (
                        <p>{hint}</p>
                    )}
                </div>
            </div>
        ) }

        <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
                {renderPuzzle()}
            </div>
            <div className="flex flex-col items-center justify-center gap-4 mt-6">
                <button type="submit" className="px-6 py-2 text-xl font-bold text-white bg-green-600 rounded-lg shadow-[0_0_15px_rgba(22,163,74,0.8)] hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                    Compile()
                </button>
                <div className="flex items-center justify-center gap-4">
                     <button 
                        type="button" 
                        onClick={handleGetHint} 
                        disabled={hintUsed || isHintLoading}
                        className="px-4 py-1 text-sm font-semibold text-yellow-300 bg-transparent border border-yellow-500 rounded-lg hover:bg-yellow-900/50 hover:text-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                     >
                        {isHintLoading ? <SpinnerIcon /> : <LightbulbIcon />}
                        Get a Hint
                    </button>
                    <button type="button" onClick={onSkip} className="px-4 py-1 text-sm font-semibold text-gray-400 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                        Skip Puzzle
                    </button>
                </div>
            </div>
        </form>

        <div className="w-full bg-gray-700 rounded-full h-4 border-2 border-gray-500">
             <div
                className="h-full rounded-full transition-all duration-1000 linear"
                style={{ width: `${timerWidth}%`, backgroundColor: timeLeft <= 3 ? '#ef4444' : '#facc15' }}
              />
        </div>
        <p className={`mt-2 text-2xl font-mono font-bold ${timerColor}`}>{timeLeft}</p>
      </div>
    </div>
  );
};

export default CodingChallengeModal;