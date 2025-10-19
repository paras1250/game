import React, { useState, useRef, useEffect } from 'react';
import type { Puzzle } from '../types';
import { soundService } from '../services/soundService';
import { SoundType } from '../types';

interface TrainingArenaProps {
  conceptName: string;
  puzzles: Puzzle[];
  onExit: () => void;
}

const LearningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const TrainingArena: React.FC<TrainingArenaProps> = ({ conceptName, puzzles, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPuzzle = puzzles[currentIndex];

  useEffect(() => {
    if (!isSubmitted) {
        soundService.playSound(SoundType.NEW_PUZZLE);
        inputRef.current?.focus();
    }
  }, [currentIndex, isSubmitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPuzzle) return;
    const correct = answer.trim().toLowerCase() === currentPuzzle.answer.replace(/"/g, '').toLowerCase();
    setIsCorrect(correct);
    setIsSubmitted(true);
    soundService.playSound(correct ? SoundType.SUCCESS : SoundType.FAIL);
  };

  const handleNext = () => {
    soundService.playSound(SoundType.CLICK);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % puzzles.length);
    setAnswer('');
    setIsSubmitted(false);
    setIsCorrect(false);
  };

  const renderPuzzle = () => {
    if (!currentPuzzle) return null;
    const parts = currentPuzzle.question.split('{INPUT}');
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
                disabled={isSubmitted}
            />
            <span>{parts[1]}</span>
        </code>
    );
  };

  if (!currentPuzzle) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl text-yellow-400">No puzzles available for this concept yet.</h2>
            <button onClick={onExit} className="mt-4 px-6 py-2 text-lg font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Back to Concepts</button>
        </div>
    );
  }
  
  const highlightedAnswer = `<span class="text-yellow-300 font-bold px-2 bg-yellow-900/50 rounded">${currentPuzzle.answer.replace(/"/g, '')}</span>`;
  const correctAnswerHtml = currentPuzzle.question.replace('{INPUT}', highlightedAnswer);

  return (
    <div className="flex flex-col h-full p-4 w-full max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Learning Arena: {conceptName}</h1>
            <button onClick={onExit} className="px-5 py-2 text-md font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors">Back to Concepts</button>
        </header>

        <div className="flex-grow flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-1/3 flex items-center justify-center p-8">
                <LearningIcon />
            </div>

            <div className="w-full md:w-2/3 bg-black/30 p-6 rounded-lg border-2 border-gray-700">
                {!isSubmitted ? (
                    <form onSubmit={handleSubmit} className="text-center">
                        <p className="text-lg text-gray-300 mb-2">Solve the problem by completing the code. No time limit here.</p>
                        <p className="text-lg text-yellow-400 font-semibold mb-6 bg-gray-800/50 p-3 rounded-md border border-gray-700">{currentPuzzle.problem}</p>
                        <div className="mb-6">{renderPuzzle()}</div>
                        <button type="submit" className="px-6 py-2 text-xl font-bold text-white bg-green-600 rounded-lg shadow-[0_0_15px_rgba(22,163,74,0.8)] hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                            Check Answer
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <h2 className={`text-3xl font-bold mb-4 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {isCorrect ? 'Correct!' : 'Not Quite!'}
                        </h2>
                        <div className="text-left bg-black bg-opacity-50 p-4 rounded-lg border border-gray-600 space-y-4 mb-6">
                            <div>
                                <h3 className="font-bold text-cyan-400 text-lg mb-2">The Correct Code:</h3>
                                <code className="text-xl text-green-300 bg-gray-800 p-3 rounded-md block" dangerouslySetInnerHTML={{ __html: correctAnswerHtml }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-cyan-400 text-lg mb-2">Explanation:</h3>
                                <p className="text-gray-200">{currentPuzzle.explanation}</p>
                            </div>
                        </div>
                        <button onClick={handleNext} className="px-8 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.8)] hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                            Next Puzzle
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default TrainingArena;
