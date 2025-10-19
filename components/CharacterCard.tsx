import React from 'react';
import type { Character } from '../types';
import CharacterArt from './CharacterArt';
import { soundService } from '../services/soundService';
import { SoundType } from '../types';

interface CharacterCardProps {
    character: Character;
    onBattle: (character: Character) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onBattle }) => {
    const borderColor = `border-${character.color}-500`;
    const shadowColor = `shadow-${character.color}-500/40`;
    const hoverBorderColor = `hover:border-${character.color}-400`;
    const hoverShadowColor = `hover:shadow-${character.color}-400/60`;
    
    const buttonBaseStyle = "w-full px-4 py-2 text-md font-bold rounded-md transition-all duration-300 transform hover:scale-105";
    const battleButtonStyle = `bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.7)] hover:bg-red-500`;

    return (
        <div
            className={`bg-gray-900/50 backdrop-blur-sm p-2 rounded-lg border-4 ${borderColor} ${shadowColor} shadow-lg transition-all duration-300 transform hover:-translate-y-2 ${hoverBorderColor} ${hoverShadowColor} flex flex-col`}
        >
            <div className="bg-gray-800/70 p-2 rounded-md flex flex-col h-full flex-grow">
                 <div className="w-full h-48 bg-gray-900/50 rounded-md mb-4 border-2 border-gray-600 p-2 flex items-center justify-center">
                    <CharacterArt characterName={character.name} className="w-full h-full" />
                 </div>
                 <div className="flex flex-col flex-grow justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-center mb-2" style={{ color: `var(--tw-color-${character.color}-400)` }}>{character.name}</h3>
                        <p className="text-sm text-gray-300 text-center mb-2 min-h-[40px]">{character.description}</p>
                    </div>
                    <p className="text-xs text-center bg-gray-700 text-yellow-400 py-1 rounded-full font-mono mt-auto">{character.powerType}</p>
                 </div>
                 <div className="flex items-center justify-around mt-4 pt-3 border-t-2 border-gray-700/50">
                    <button onClick={() => { soundService.playSound(SoundType.CLICK); onBattle(character); }} className={`${buttonBaseStyle} ${battleButtonStyle}`}>Battle</button>
                </div>
            </div>
        </div>
    );
};

export default CharacterCard;
