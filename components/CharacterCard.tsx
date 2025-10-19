
import React from 'react';
import type { Character } from '../types';
import CharacterArt from './CharacterArt';
import { audioService } from '../services/audioService';
import { SoundType } from '../types';

interface CharacterCardProps {
    character: Character;
    onBattle: (character: Character) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onBattle }) => {
    
    const colorMap: { [key: string]: string } = {
        fuchsia: '#d946ef',
        cyan: '#22d3ee',
        emerald: '#34d399',
        red: '#ef4444'
    };
    const characterColor = colorMap[character.color] || '#ffffff';

    return (
        <>
        <style>{`
            /* -- Styles are now generic and use CSS variables to support multiple card colors -- */
            .character-card {
                /* The border and glow are now persistent */
                border: 2px solid var(--character-glow-border);
                box-shadow: 0 0 15px var(--character-glow-shadow);
                transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;
            }
            .character-card:hover {
                /* On hover, the glow becomes more intense */
                border-color: var(--character-glow);
                box-shadow: 0 0 25px var(--character-glow);
            }

            .character-card .glitch-title {
                position: relative;
                color: var(--character-glow); /* Use CSS variable */
                text-shadow: 0 0 5px var(--character-glow-shadow); /* Use CSS variable */
            }

            /* The glitch effect is only active on hover */
            .character-card:hover .glitch-title::before,
            .character-card:hover .glitch-title::after {
                content: attr(data-text);
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #111827; /* Match card inner background */
                overflow: hidden;
            }

            .character-card:hover .glitch-title::before {
                left: 2px;
                text-shadow: -2px 0 #ef4444; /* Red channel */
                clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
                animation: card-glitch-anim 1.5s infinite linear alternate-reverse;
            }

            .character-card:hover .glitch-title::after {
                left: -2px;
                text-shadow: 2px 0 #22d3ee; /* Cyan channel */
                clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
                animation: card-glitch-anim 2s infinite linear alternate-reverse;
            }
            
            @keyframes card-glitch-anim {
                0% { clip-path: polygon(0 45%, 100% 45%, 100% 55%, 0 55%); }
                15% { clip-path: polygon(0 0, 100% 0, 100% 10%, 0 10%); }
                30% { clip-path: polygon(0 95%, 100% 95%, 100% 100%, 0 100%); }
                45% { clip-path: polygon(0 50%, 100% 50%, 100% 60%, 0 60%); }
                60% { clip-path: polygon(0 20%, 100% 20%, 100% 35%, 0 35%); }
                75% { clip-path: polygon(0 80%, 100% 80%, 100% 85%, 0 85%); }
                90% { clip-path: polygon(0 30%, 100% 30%, 100% 40%, 0 40%); }
                100% { clip-path: polygon(0 70%, 100% 70%, 100% 75%, 0 75%); }
            }
            .character-card .character-art-container {
                filter: drop-shadow(0 0 8px var(--character-glow-shadow));
            }
        `}</style>
        <div 
            className="group character-card bg-gray-900/60 backdrop-blur-sm p-2 rounded-lg flex flex-col h-full transform hover:-translate-y-2"
            style={{ 
                '--character-glow': characterColor,
                '--character-glow-border': `${characterColor}80`, // 80 alpha for border
                '--character-glow-shadow': `${characterColor}60`, // 60 alpha for shadow
            } as React.CSSProperties}
        >
          <div className="relative bg-gray-900 p-3 rounded-md flex flex-col h-full flex-grow transition-all duration-300 group-hover:bg-gray-800/80 group-hover:shadow-2xl">
            <div className="w-full h-48 bg-black/50 rounded-md mb-4 border-2 border-gray-600 p-2 flex items-center justify-center transition-all duration-300 group-hover:border-gray-500 overflow-hidden">
                <div className="w-full h-full transition-all duration-300 group-hover:scale-105 character-art-container">
                    <CharacterArt characterName={character.name} className="w-full h-full" />
                </div>
            </div>
            <div className="flex flex-col flex-grow justify-between text-center">
                <div>
                    <h3 data-text={character.name} className="glitch-title text-xl md:text-2xl font-bold mb-2">{character.name}</h3>
                    <p className="text-sm text-gray-300 mb-2 min-h-[40px] px-1">{character.description}</p>
                </div>
                <p className="text-xs text-center bg-gray-700 text-yellow-400 py-1 px-2 rounded-full font-mono mt-auto">{character.powerType}</p>
            </div>
            <div className="flex items-center justify-around mt-4 pt-3 border-t-2 border-gray-700/50">
                <button 
                    onClick={() => { audioService.playSound(SoundType.CLICK); onBattle(character); }} 
                    className="w-full px-4 py-2 text-md font-bold rounded-md transition-all duration-300 transform hover:scale-105 bg-red-600 text-white group-hover:bg-red-500"
                    style={{
                        boxShadow: `0 0 10px rgba(239, 68, 68, 0)`,
                        transition: 'box-shadow 0.3s ease, background-color 0.3s ease'
                    }}
                >
                    Battle
                </button>
            </div>
          </div>
        </div>
    </>
    );
};

export default CharacterCard;
