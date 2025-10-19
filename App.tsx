/**
 * Fix: Implement the main App component.
 * This file was previously empty, causing module resolution errors.
 * This implementation provides the main application logic, state management,
 * and renders different game screens based on the game phase.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { CHARACTERS, PUZZLES, GAME_CONSTANTS, CONCEPTS } from './constants';
import type { Character, Puzzle } from './types';
import { GamePhase, AnimationState, SoundType } from './types';
import CharacterCard from './components/CharacterCard';
import TrainingArena from './components/TrainingArena';
import BattleCharacter from './components/BattleCharacter';
import HealthBar from './components/HealthBar';
import CodingChallengeModal from './components/CodingChallengeModal';
import PuzzleResultModal from './components/PuzzleResultModal';
import { soundService } from './services/soundService';
import IntroAnimation from './components/IntroAnimation';

const HomeScreenBackground = () => (
    <>
        <style>{`
            .home-bg {
                position: absolute;
                inset: 0;
                overflow: hidden;
                background-color: #020617;
                background-image:
                    radial-gradient(ellipse at center, rgba(17, 24, 39, 0.8) 0%, transparent 70%),
                    linear-gradient(rgba(20, 83, 45, 0.08) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(20, 83, 45, 0.08) 1px, transparent 1px);
                background-size: 100% 100%, 30px 30px, 30px 30px;
            }
            @keyframes scan {
                0% { transform: translateY(-10vh); }
                100% { transform: translateY(110vh); }
            }
            .scanline {
                position: absolute;
                left: 0;
                right: 0;
                height: 2px;
                background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.5), transparent);
                animation: scan 8s linear infinite;
                opacity: 0.8;
            }
            .scanline:nth-child(2) { animation-delay: -2s; animation-duration: 9s; opacity: 0.5; }
            .scanline:nth-child(3) { animation-delay: -5s; animation-duration: 7s; opacity: 0.6; }
        `}</style>
        <div className="home-bg">
            <div className="scanline"></div>
            <div className="scanline"></div>
            <div className="scanline"></div>
        </div>
    </>
);


const BattleBackground = () => (
    <>
    <style>{`
        .battle-bg-container {
            background-color: #0a0a1a;
            background-image: radial-gradient(circle at 50% 100%, #1e293b 0%, #020617 60%);
        }
        .perspective-grid {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 60%;
            perspective: 300px;
        }
        .grid-plane {
            width: 100%;
            height: 100%;
            background-image:
                linear-gradient(rgba(59, 130, 246, 0.4) 1.5px, transparent 1.5px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1.5px, transparent 1.5px);
            background-size: 50px 50px;
            transform: rotateX(75deg);
            animation: scroll-grid 10s linear infinite;
        }
        @keyframes scroll-grid {
            from { background-position: 0 0; }
            to { background-position: 0 -200px; }
        }
        @keyframes particle-float {
            0% { transform: translateY(0); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(-100vh); opacity: 0; }
        }
        .particle {
            position: absolute;
            width: 2px;
            height: 2px;
            background: #67e8f9;
            border-radius: 50%;
            box-shadow: 0 0 5px #67e8f9;
            animation: particle-float 20s linear infinite;
        }
    `}</style>
    <div className="absolute inset-0 z-0 overflow-hidden battle-bg-container">
        <div className="perspective-grid">
            <div className="grid-plane"></div>
        </div>
        {Array.from({ length: 30 }).map((_, i) => (
            <div
                key={i}
                className="particle"
                style={{
                    left: `${Math.random() * 100}%`,
                    animationDuration: `${Math.random() * 15 + 10}s`,
                    animationDelay: `${Math.random() * 10}s`,
                }}
            />
        ))}
    </div>
    </>
);

const HexPlatform: React.FC<{ color: string }> = ({ color }) => {
    const gradientId = `grad-${color.replace('#', '')}`;
    return (
        <div className="absolute -bottom-4 w-64 h-32" style={{ filter: `drop-shadow(0 0 25px ${color})`}}>
            <svg viewBox="0 0 120 104" className="w-full h-full">
                <defs>
                    <radialGradient id={gradientId} cx="50%" cy="50%" r="70%">
                        <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.4 }} />
                        <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
                    </radialGradient>
                </defs>
                <path
                    d="M30 0 L90 0 L120 52 L90 104 L30 104 L0 52 Z"
                    stroke={color}
                    strokeWidth="1.5"
                    fill={`url(#${gradientId})`}
                />
            </svg>
        </div>
    );
};

const colorMap: { [key: string]: string } = {
    fuchsia: '#d946ef',
    cyan: '#22d3ee',
    emerald: '#34d399',
    red: '#ef4444'
};


const App: React.FC = () => {
    const [isIntro, setIsIntro] = useState(true);
    const [gamePhase, setGamePhase] = useState<GamePhase>(GamePhase.HUB);
    const [player, setPlayer] = useState<Character | null>(null);
    const [opponent, setOpponent] = useState<Character | null>(null);
    const [selectedConcept, setSelectedConcept] = useState<{name: string, tags: string[]}|null>(null);

    const [playerHealth, setPlayerHealth] = useState(GAME_CONSTANTS.PLAYER_MAX_HEALTH);
    const [opponentHealth, setOpponentHealth] = useState(GAME_CONSTANTS.OPPONENT_MAX_HEALTH);
    const [playerAnimation, setPlayerAnimation] = useState(AnimationState.IDLE);
    const [opponentAnimation, setOpponentAnimation] = useState(AnimationState.IDLE);
    const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
    const [failedPuzzle, setFailedPuzzle] = useState<Puzzle | null>(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [turnMessage, setTurnMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [showConcepts, setShowConcepts] = useState(false);

    const getPuzzlesForCharacter = useCallback((character: Character | null) => {
        if (!character) return [];
        let tags: string[];
        switch (character.name) {
            case 'Loop Lord':
                tags = ['loop'];
                break;
            case 'Debugger':
                tags = ['debug'];
                break;
            case 'Array Queen':
                tags = ['array'];
                break;
            case 'Syntax Samurai':
            default:
                tags = ['fundamentals'];
                break;
        }
        return PUZZLES.filter(p => p.tags?.some(t => tags.includes(t)));
    }, []);
    
    const getPuzzlesForConcept = useCallback((conceptTags: string[]) => {
       return PUZZLES.filter(p => p.tags?.some(t => conceptTags.includes(t)));
    }, []);

    const handleStartLearning = (concept: {name: string, tags: string[]}) => {
        soundService.playSound(SoundType.ENTER_TRAINING);
        setSelectedConcept(concept);
        setGamePhase(GamePhase.LEARNING);
    };

    const handleBattle = (character: Character) => {
        soundService.playSound(SoundType.SELECT_CHAR);
        setPlayer(character);
        const availableOpponents = CHARACTERS.filter(c => c.id !== character.id);
        const randomOpponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
        setOpponent(randomOpponent);

        setPlayerHealth(GAME_CONSTANTS.PLAYER_MAX_HEALTH);
        setOpponentHealth(GAME_CONSTANTS.OPPONENT_MAX_HEALTH);
        setPlayerAnimation(AnimationState.INTRO);
        setOpponentAnimation(AnimationState.INTRO);
        setIsPlayerTurn(true);
        setTurnMessage(`${character.name}, prepare for battle!`);
        setGamePhase(GamePhase.BATTLE);

        setTimeout(() => {
            setPlayerAnimation(AnimationState.IDLE);
            setOpponentAnimation(AnimationState.IDLE);
            setTurnMessage("Your turn to attack!");
        }, 2000);
    };

    const handleExitLearning = () => {
        soundService.playSound(SoundType.CLICK);
        setGamePhase(GamePhase.HUB);
        setShowConcepts(true);
        setSelectedConcept(null);
    };

    const resetGame = useCallback(() => {
        soundService.stopBackgroundMusic();
        setGamePhase(GamePhase.HUB);
        setPlayer(null);
        setOpponent(null);
        setFailedPuzzle(null);
        setCurrentPuzzle(null);
        setShowConcepts(false);
    }, []);

    const handleReturnToHub = () => {
        soundService.playSound(SoundType.CLICK);
        resetGame();
    };
    
    const startPlayerAttack = () => {
        if (!isPlayerTurn || !player || gamePhase !== GamePhase.BATTLE) return;
        soundService.playSound(SoundType.CLICK);
        const puzzles = getPuzzlesForCharacter(player);
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        setCurrentPuzzle(randomPuzzle);
    };

    const handleSolvePuzzle = () => {
        soundService.playSound(SoundType.SUCCESS);
        setCurrentPuzzle(null);
        setPlayerAnimation(AnimationState.ATTACKING);

        setTimeout(() => {
            const damage = GAME_CONSTANTS.BASE_ATTACK_DAMAGE + (Math.random() * GAME_CONSTANTS.POWER_ATTACK_BONUS);
            setOpponentHealth(prev => Math.max(0, prev - damage));
            setOpponentAnimation(AnimationState.HIT);
            soundService.playSound(SoundType.OPPONENT_HIT);

            setTimeout(() => {
                setPlayerAnimation(AnimationState.IDLE);
                setOpponentAnimation(AnimationState.IDLE);
                if (opponentHealth - damage > 0) {
                     setIsPlayerTurn(false);
                }
            }, 500);
        }, 500);
    };

    const handleFailPuzzle = () => {
        soundService.playSound(SoundType.FAIL);
        if (currentPuzzle) {
            setFailedPuzzle(currentPuzzle);
        }
        setCurrentPuzzle(null);

        // Player takes damage for failing
        setPlayerAnimation(AnimationState.HIT);
        soundService.playSound(SoundType.PLAYER_HIT);
        setPlayerHealth(prev => Math.max(0, prev - GAME_CONSTANTS.FAIL_DAMAGE));

        setTimeout(() => {
            setPlayerAnimation(AnimationState.IDLE);
            if (playerHealth - GAME_CONSTANTS.FAIL_DAMAGE > 0) {
                 setIsPlayerTurn(false);
            }
        }, 500);
    };
    
    const handleToggleMute = () => {
        setIsMuted(soundService.toggleMute());
    };

    // Background Music Controller
    useEffect(() => {
        if (gamePhase === GamePhase.BATTLE) {
            soundService.playBackgroundMusic();
        } else {
            soundService.stopBackgroundMusic();
        }
        return () => {
            soundService.stopBackgroundMusic();
        };
    }, [gamePhase]);


    // Opponent's turn logic
    useEffect(() => {
        if (gamePhase === GamePhase.BATTLE && !isPlayerTurn && opponentHealth > 0 && playerHealth > 0) {
            setTurnMessage(`${opponent?.name} is preparing an attack...`);
            const opponentTurnTimeout = setTimeout(() => {
                setOpponentAnimation(AnimationState.ATTACKING);
                soundService.playSound(SoundType.ATTACK);
                
                setTimeout(() => {
                    const damage = GAME_CONSTANTS.OPPONENT_ATTACK_DAMAGE;
                    setPlayerHealth(prev => Math.max(0, prev - damage));
                    setPlayerAnimation(AnimationState.HIT);
                    soundService.playSound(SoundType.PLAYER_HIT);

                    setTimeout(() => {
                        setOpponentAnimation(AnimationState.IDLE);
                        setPlayerAnimation(AnimationState.IDLE);
                        setIsPlayerTurn(true);
                        setTurnMessage("Your turn to attack!");
                    }, 500);
                }, 1000);
            }, GAME_CONSTANTS.OPPONENT_TURN_DELAY_MS);

            return () => clearTimeout(opponentTurnTimeout);
        }
    }, [isPlayerTurn, gamePhase, opponent, opponentHealth, playerHealth]);
    
    // Check for game over
    useEffect(() => {
        if ((playerHealth <= 0 || opponentHealth <= 0) && gamePhase === GamePhase.BATTLE) {
            setGamePhase(GamePhase.GAMEOVER);
            if (playerHealth <= 0) {
                setPlayerAnimation(AnimationState.LOSE);
                setOpponentAnimation(AnimationState.WIN);
                setTurnMessage(`${opponent?.name} is victorious!`);
                soundService.playSound(SoundType.LOSE);
            } else {
                setPlayerAnimation(AnimationState.WIN);
                setOpponentAnimation(AnimationState.LOSE);
                setTurnMessage(`${player?.name} is victorious!`);
                soundService.playSound(SoundType.WIN);
            }
        }
    }, [playerHealth, opponentHealth, gamePhase, player, opponent]);

    if (isIntro) {
        return <IntroAnimation onComplete={() => setIsIntro(false)} />;
    }

    const renderContent = () => {
        if (gamePhase === GamePhase.HUB) {
             return (
                <div className="text-center">
                    <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">Code Clash</h1>
                    <h2 className="text-2xl text-gray-300 mb-8">Learn to Code by Fighting with Logic</h2>
                     {!showConcepts ? (
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                            <button onClick={() => { soundService.playSound(SoundType.CLICK); setShowConcepts(true); }} className="px-10 py-5 text-2xl font-bold text-white bg-cyan-600 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.7)] hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105">
                                Learn Concepts
                            </button>
                             <button onClick={() => { soundService.playSound(SoundType.CLICK); setGamePhase(GamePhase.SELECT); }} className="px-10 py-5 text-2xl font-bold text-white bg-red-600 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.7)] hover:bg-red-500 transition-all duration-300 transform hover:scale-105">
                                Challenge Mode
                            </button>
                        </div>
                    ) : (
                        <div className="relative glowing-border p-1 max-w-4xl mx-auto">
                           <div className="bg-black/60 rounded-lg p-6">
                            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Choose a Concept to Master</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {CONCEPTS.map(concept => (
                                    <div key={concept.name} onClick={() => handleStartLearning(concept)}
                                        className="bg-gray-800/70 p-4 rounded-lg border-2 border-cyan-700 hover:bg-cyan-900/50 hover:border-cyan-400 cursor-pointer transition-all duration-300 transform hover:-translate-y-1">
                                        <h4 className="text-xl font-bold text-cyan-400">{concept.name}</h4>
                                        <p className="text-gray-400">{concept.description}</p>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => { soundService.playSound(SoundType.CLICK); setShowConcepts(false); }} className="mt-6 px-6 py-2 text-lg font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700">Back</button>
                           </div>
                        </div>
                    )}
                </div>
             );
        }

        if (gamePhase === GamePhase.SELECT) {
            return (
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-2 text-red-400">Challenge Mode</h1>
                    <h2 className="text-2xl text-gray-300 mb-6">Choose Your Champion</h2>
                    <div className="relative glowing-border p-1 max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 py-8 bg-black/60 rounded-lg">
                            {CHARACTERS.map(char => (
                                <CharacterCard 
                                    key={char.id} 
                                    character={char} 
                                    onBattle={handleBattle}
                                />
                            ))}
                        </div>
                    </div>
                     <button onClick={handleReturnToHub} className="mt-8 px-6 py-2 text-lg font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700">Back to Hub</button>
                </div>
            );
        }

        if (gamePhase === GamePhase.LEARNING && selectedConcept) {
            return (
                <TrainingArena 
                    conceptName={selectedConcept.name}
                    puzzles={getPuzzlesForConcept(selectedConcept.tags)} 
                    onExit={handleExitLearning} 
                />
            );
        }

        if ((gamePhase === GamePhase.BATTLE || gamePhase === GamePhase.GAMEOVER) && player && opponent) {
             const platformColor = (character: Character) => colorMap[character.color] || '#ffffff';
            return (
                <div className="flex flex-col h-full w-full relative z-10">
                    {currentPuzzle && <CodingChallengeModal puzzle={currentPuzzle} onSolve={handleSolvePuzzle} onFail={handleFailPuzzle} />}
                    {failedPuzzle && <PuzzleResultModal puzzle={failedPuzzle} onDismiss={() => setFailedPuzzle(null)} />}
                    
                    <div className="absolute top-4 left-4 right-4 flex justify-between z-30">
                       <button onClick={handleReturnToHub} className="px-4 py-2 text-sm font-bold text-white bg-red-600/80 rounded-lg hover:bg-red-700/80 backdrop-blur-sm transition-colors">
                            Exit
                       </button>
                       <button onClick={handleToggleMute} className="px-3 py-2 text-sm font-bold text-white bg-blue-600/80 rounded-lg hover:bg-blue-700/80 backdrop-blur-sm transition-colors">
                           {isMuted ? 
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                           : 
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                             <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                           </svg>}
                       </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-around pt-12 px-4">
                        {/* Opponent Info */}
                        <div className="flex flex-col items-center">
                             <div className="w-full max-w-sm text-center">
                                <h2 className="text-center text-2xl font-bold mb-2" style={{ color: colorMap[opponent.color], textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{opponent.name}</h2>
                                <HealthBar health={opponentHealth} maxHealth={GAME_CONSTANTS.OPPONENT_MAX_HEALTH} color="bg-red-500" />
                             </div>
                        </div>

                        {/* Arena */}
                        <div className="relative flex items-center justify-around w-full h-80">
                            <div className="relative flex flex-col items-center justify-center h-full">
                               <BattleCharacter character={player} animation={playerAnimation} />
                               <HexPlatform color={platformColor(player)} />
                            </div>
                             <div className="relative flex flex-col items-center justify-center h-full">
                                <BattleCharacter character={opponent} animation={opponentAnimation} isOpponent />
                                <HexPlatform color={platformColor(opponent)} />
                            </div>
                        </div>

                        {/* Player UI */}
                        <div className="flex flex-col items-center">
                           <div className="w-full max-w-sm text-center mb-4">
                               <h2 className="text-2xl font-bold mb-2 mt-4" style={{ color: colorMap[player.color], textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{player.name}</h2>
                               <HealthBar health={playerHealth} maxHealth={GAME_CONSTANTS.PLAYER_MAX_HEALTH} color="bg-green-500" />
                            </div>
                            <div className="text-center min-h-[6rem] flex flex-col justify-center items-center">
                                <p className="text-xl text-yellow-300 font-mono mb-4">{turnMessage}</p>
                                {gamePhase === GamePhase.BATTLE && (
                                    <button
                                        onClick={startPlayerAttack}
                                        disabled={!isPlayerTurn}
                                        className="px-8 py-3 text-xl font-bold text-white bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.8)] hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-600 disabled:shadow-none disabled:cursor-not-allowed"
                                    >
                                        Attack()
                                    </button>
                                )}
                                {gamePhase === GamePhase.GAMEOVER && (
                                     <button onClick={handleReturnToHub} className="mt-4 px-6 py-2 text-lg font-bold text-white bg-fuchsia-600 rounded-lg hover:bg-fuchsia-700">Play Again</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return null;
    };
    
    const isBattlePhase = gamePhase === GamePhase.BATTLE || gamePhase === GamePhase.GAMEOVER;

    return (
        <main 
            className="text-white min-h-screen w-screen flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden"
        >
            <style>{`
                .glowing-border {
                    border-radius: 0.75rem;
                }
                .glowing-border::before,
                .glowing-border::after {
                    content: '';
                    position: absolute;
                    left: -2px;
                    top: -2px;
                    background: linear-gradient(45deg, #e6fb04, #ff6600, #00ff66, #00ffff, #ff00ff, #ff0099, #6e0dd0, #00ffff, #e6fb04);
                    background-size: 400%;
                    width: calc(100% + 4px);
                    height: calc(100% + 4px);
                    z-index: -1;
                    animation: glow 20s linear infinite;
                    border-radius: 0.75rem;
                }
                @keyframes glow {
                    0% { background-position: 0 0; }
                    50% { background-position: 400% 0; }
                    100% { background-position: 0 0; }
                }
                .glowing-border::after {
                    filter: blur(20px);
                }
            `}</style>
           {isBattlePhase ? <BattleBackground /> : <HomeScreenBackground />}
           <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
             {renderContent()}
           </div>
        </main>
    );
};

export default App;