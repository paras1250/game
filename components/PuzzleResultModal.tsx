import React from 'react';
import type { Puzzle } from '../types';

interface PuzzleResultModalProps {
  puzzle: Puzzle;
  onDismiss: () => void;
}

const PuzzleResultModal: React.FC<PuzzleResultModalProps> = ({ puzzle, onDismiss }) => {
  const highlightedAnswer = `<span class="text-yellow-300 font-bold px-2 bg-yellow-900/50 rounded">${puzzle.answer.replace(/"/g, '')}</span>`;
  const correctAnswerHtml = puzzle.question.replace('{INPUT}', highlightedAnswer);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 backdrop-blur-md">
      <div className="bg-gray-900 border-4 border-red-500 rounded-xl shadow-2xl shadow-red-500/50 p-6 md:p-8 w-11/12 max-w-2xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-4">Let's Review!</h2>
        <p className="text-lg text-gray-300 mb-6">Mistakes are part of coding. Let's see what happened.</p>
        
        <div className="text-left bg-black bg-opacity-50 p-4 rounded-lg border border-gray-700 space-y-4">
            <div>
                <h3 className="font-bold text-cyan-400 text-lg mb-2">Correct Implementation:</h3>
                <code className="text-xl text-green-300 bg-gray-800 p-3 rounded-md block" dangerouslySetInnerHTML={{ __html: correctAnswerHtml }} />
            </div>
            <div>
                <h3 className="font-bold text-cyan-400 text-lg mb-2">Key Concept:</h3>
                <p className="text-gray-200">{puzzle.explanation}</p>
            </div>
        </div>

        <button 
          onClick={onDismiss} 
          className="mt-8 px-8 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.8)] hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default PuzzleResultModal;