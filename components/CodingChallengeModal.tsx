import React, { useState, useEffect, useRef } from 'react';
import type { Puzzle } from '../types';
import { GAME_CONSTANTS } from '../constants';

interface CodingChallengeModalProps {
  puzzle: Puzzle;
  onSolve: () => void;
  onFail: () => void;
}

const CodingChallengeModal: React.FC<CodingChallengeModalProps> = ({ puzzle, onSolve, onFail }) => {
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(GAME_CONSTANTS.PUZZLE_TIMER_SECONDS);
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

    return () => clearInterval(timer);
  }, [onFail]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim().toLowerCase() === puzzle.answer.replace(/"/g, '').toLowerCase()) {
      onSolve();
    } else {
      onFail();
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
  const timerWidth = (timeLeft / GAME_CONSTANTS.PUZZLE_TIMER_SECONDS) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 backdrop-blur-md">
      <div className="bg-gray-900 border-4 border-fuchsia-500 rounded-xl shadow-2xl shadow-fuchsia-500/50 p-6 md:p-8 w-11/12 max-w-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-red-500 mb-2">⚠️ Syntax Error Detected!</h2>
        <p className="text-lg text-gray-300 mb-2">Complete the code to execute your attack!</p>
        <p className="text-lg text-yellow-400 font-semibold mb-6 bg-gray-800/50 p-3 rounded-md border border-gray-700">{puzzle.problem}</p>
        
        <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
                {renderPuzzle()}
            </div>
            <button type="submit" className="px-6 py-2 text-xl font-bold text-white bg-green-600 rounded-lg shadow-[0_0_15px_rgba(22,163,74,0.8)] hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                Compile()
            </button>
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