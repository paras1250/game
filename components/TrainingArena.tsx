
import React, { useState, useRef, useEffect } from 'react';
import type { Puzzle, Concept } from '../types';
import { audioService } from '../services/audioService';
import { SoundType } from '../types';

interface TrainingArenaProps {
  concept: Concept;
  puzzles: Puzzle[];
  onExit: () => void;
  solvedPuzzleIds: Set<number>;
  onPuzzleSolved: (puzzleId: number) => void;
}

const SpeakerIcon: React.FC<{isSpeaking: boolean; onClick: () => void}> = ({ isSpeaking, onClick }) => (
    <button onClick={onClick} type="button" aria-label="Read problem aloud" className={`ml-2 p-1 rounded-full hover:bg-gray-600 transition-colors ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-gray-400'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
    </button>
);

const LearningIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-48 h-48 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const CompletionScreen: React.FC<{conceptName: string; onExit: () => void}> = ({ conceptName, onExit }) => (
    <div className="text-center bg-black/30 p-8 rounded-lg border-2 border-green-500 shadow-lg shadow-green-500/30 animate-fade-in w-full max-w-3xl">
        <h2 className="text-4xl font-bold text-green-400 mb-4">Concept Complete!</h2>
        <p className="text-xl text-gray-300 mb-6">Great work! You've mastered the basics of <strong>{conceptName}</strong>.</p>
        <p className="text-lg text-gray-400 mb-8">Keep practicing to become a true Code Clash champion!</p>
        <button 
            onClick={onExit} 
            className="px-8 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.8)] hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Back to Learning Path
        </button>
        <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: scale(0.95); }
                to { opacity: 1; transform: scale(1); }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
    </div>
);


const TrainingArena: React.FC<TrainingArenaProps> = ({ concept, puzzles, onExit, solvedPuzzleIds, onPuzzleSolved }) => {
  const [view, setView] = useState<'lesson' | 'puzzle'>('lesson');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPuzzle = puzzles[currentIndex];

  useEffect(() => {
    if (view === 'puzzle' && !isSubmitted) {
        audioService.playSound(SoundType.NEW_PUZZLE);
        inputRef.current?.focus();
    }
    return () => {
        audioService.stopSpeech();
    };
  }, [view, isSubmitted, currentIndex]);

  const handleStartPuzzles = () => {
    audioService.playSound(SoundType.CLICK);
    setView('puzzle');
  };

  const resetPuzzleState = (index: number) => {
      if (index >= 0 && index < puzzles.length) {
          setCurrentIndex(index);
          setAnswer('');
          setIsSubmitted(false);
          setIsCorrect(false);
          audioService.playSound(SoundType.CLICK);
      }
  };

  const handlePrevious = () => resetPuzzleState(currentIndex - 1);
  const handleNext = () => resetPuzzleState(currentIndex + 1);
  const handleJumpTo = (index: number) => resetPuzzleState(index);
  
  const handleBackToLesson = () => {
      audioService.playSound(SoundType.CLICK);
      setView('lesson');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitted) return;

    const correct = answer.trim().toLowerCase() === currentPuzzle.answer.replace(/"/g, '').toLowerCase();
    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      audioService.playSound(SoundType.SUCCESS);
      onPuzzleSolved(currentPuzzle.id);
    } else {
      audioService.playSound(SoundType.FAIL);
    }
  };

  const handleProceed = () => {
    audioService.playSound(SoundType.CLICK);
    setIsSubmitted(false);
    setAnswer('');

    if (currentIndex < puzzles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      audioService.playSound(SoundType.WIN);
      setIsComplete(true);
    }
  };
  
  const handleSpeak = () => {
    if (isSpeaking) {
        audioService.stopSpeech();
        setIsSpeaking(false);
    } else {
        setIsSpeaking(true);
        audioService.speak(currentPuzzle.problem, () => setIsSpeaking(false));
    }
  };

  const renderPuzzle = () => {
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
  
  if (isComplete) {
      return <CompletionScreen conceptName={concept.name} onExit={onExit} />;
  }

  if (view === 'lesson') {
    return (
      <div className="w-full max-w-3xl text-center relative">
        <button onClick={onExit} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors z-10 p-2" aria-label="Exit Training">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-black/30 border border-cyan-500/50 shadow-lg shadow-cyan-500/20">
            <LearningIcon />
            <h2 className="text-4xl font-bold text-cyan-300 mt-4 mb-2">{concept.name}</h2>
            <p className="text-lg text-gray-400 mb-6">{concept.description}</p>
            <div className="text-left text-gray-300 bg-gray-900/50 p-6 rounded-md w-full prose prose-invert prose-p:my-2 prose-li:my-1" dangerouslySetInnerHTML={{ __html: concept.lesson }} />
            <button onClick={handleStartPuzzles} className="mt-8 px-8 py-3 text-xl font-bold text-white bg-green-600 rounded-lg shadow-[0_0_15px_rgba(22,163,74,0.8)] hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                Start Puzzles ({puzzles.length})
            </button>
        </div>
      </div>
    );
  }

  return (
      <div className="w-full max-w-3xl relative">
          <button onClick={onExit} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors z-10 p-2" aria-label="Exit Training">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
        <div className="bg-gray-900/70 backdrop-blur-md border-4 border-fuchsia-500 rounded-xl shadow-2xl shadow-fuchsia-500/50 p-6 md:p-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">{concept.name} Training</h2>
          <div className="flex justify-between items-center text-gray-400 mb-4">
             <button onClick={handleBackToLesson} className="flex items-center gap-1 text-sm font-semibold hover:text-cyan-300 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                 Back to Lesson
             </button>
             <p className="text-lg">Puzzle {currentIndex + 1} of {puzzles.length}</p>
          </div>
          
          <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700 mb-6 flex items-center justify-between">
              <p className="text-lg text-yellow-400 font-semibold text-left flex-1">{currentPuzzle.problem}</p>
              <SpeakerIcon isSpeaking={isSpeaking} onClick={handleSpeak} />
          </div>
          
          <form onSubmit={handleSubmit} className="mb-6">
              <div className="mb-4">
                  {renderPuzzle()}
              </div>
              {!isSubmitted && (
                  <div className="flex flex-col items-center justify-center gap-3 mt-2">
                    <button type="submit" className="px-6 py-2 text-xl font-bold text-white bg-green-600 rounded-lg shadow-[0_0_15px_rgba(22,163,74,0.8)] hover:bg-green-700 transition-all duration-300 transform hover:scale-105">
                        Submit Answer
                    </button>
                    <button type="button" onClick={handleProceed} className="px-4 py-1 text-sm font-semibold text-gray-400 bg-transparent border border-gray-600 rounded-lg hover:bg-gray-700 hover:text-white transition-colors">
                        Skip Puzzle
                    </button>
                  </div>
              )}
          </form>
          
          {isSubmitted && (
              <div className={`p-4 rounded-md mt-4 animate-fade-in ${isCorrect ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}>
                  <h3 className={`text-2xl font-bold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isCorrect ? 'Correct!' : 'Not Quite!'}
                  </h3>
                  <p className="text-gray-300 mt-2">{currentPuzzle.explanation}</p>
                  <button onClick={handleProceed} className="mt-4 px-6 py-2 text-lg font-bold text-white bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.8)] hover:bg-blue-700 transition-all">
                      {currentIndex < puzzles.length - 1 ? 'Next Puzzle' : 'Finish Concept'}
                  </button>
              </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700/50 gap-2">
                <button
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    aria-label="Previous puzzle"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="flex items-center justify-center gap-0.5 flex-1 min-w-0">
                    {puzzles.map((puzzle, index) => {
                        const isCurrent = currentIndex === index;
                        const isSolved = solvedPuzzleIds.has(puzzle.id);
                        let dotClass = 'w-1 h-1 md:w-1.5 md:h-1.5 rounded-full transition-all duration-300 cursor-pointer flex-shrink-0';
                        if (isCurrent) {
                            dotClass += ' bg-cyan-400 ring-2 ring-cyan-200 scale-125';
                        } else if (isSolved) {
                            dotClass += ' bg-green-500';
                        } else {
                            dotClass += ' bg-gray-600 hover:bg-gray-500';
                        }
                        return (
                            <button
                                key={puzzle.id}
                                onClick={() => handleJumpTo(index)}
                                className={dotClass}
                                aria-label={`Go to puzzle ${index + 1}`}
                            />
                        );
                    })}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentIndex === puzzles.length - 1}
                    className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    aria-label="Next puzzle"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                     <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                   </svg>
                </button>
            </div>
        </div>
      </div>
  );
};

export default TrainingArena;
