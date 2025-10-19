import React from 'react';
import type { Character } from '../types';
import { AnimationState } from '../types';
import CharacterArt from './CharacterArt';

interface BattleCharacterProps {
  character: Character;
  animation: AnimationState;
  isOpponent?: boolean;
}

const BattleCharacter: React.FC<BattleCharacterProps> = ({ character, animation, isOpponent = false }) => {
  const animationClasses = () => {
    switch (animation) {
      case AnimationState.ATTACKING:
        return isOpponent ? 'animate-pulse scale-110 -translate-x-4' : 'animate-pulse scale-110 translate-x-4';
      case AnimationState.HIT:
        return 'animate-bounce opacity-70';
      case AnimationState.IDLE:
      case AnimationState.INTRO:
      default:
        // Using a custom animation defined in CharacterArt for idle & intro states
        return '';
    }
  };

  return (
    <div className={`transition-transform duration-300 ${isOpponent ? 'transform -scale-x-100' : ''}`}>
      <CharacterArt
        characterName={character.name}
        animation={animation}
        className={`w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 drop-shadow-[0_10px_15px_rgba(0,0,0,0.7)] ${animationClasses()}`}
      />
    </div>
  );
};

export default BattleCharacter;
