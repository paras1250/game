export interface Character {
  id: number;
  name: string;
  description: string;
  powerType: string;
  color: string;
}

export interface Puzzle {
  id: number;
  level: number;
  concept: string;
  problem: string;
  question: string; // Using {INPUT} as placeholder
  answer: string;
  explanation: string;
  tags?: string[];
}

export enum GamePhase {
  HUB = 'HUB',
  SELECT = 'SELECT',
  LEARNING = 'LEARNING',
  BATTLE = 'BATTLE',
  GAMEOVER = 'GAMEOVER',
}

export enum AnimationState {
  IDLE = 'IDLE',
  ATTACKING = 'ATTACKING',
  HIT = 'HIT',
  INTRO = 'INTRO',
  WIN = 'WIN',
  LOSE = 'LOSE',
}

export enum SoundType {
  CLICK,
  ATTACK,
  SUCCESS,
  FAIL,
  PLAYER_HIT,
  OPPONENT_HIT,
  WIN,
  LOSE,
  SELECT_CHAR,
  ENTER_TRAINING,
  NEW_PUZZLE,
}
