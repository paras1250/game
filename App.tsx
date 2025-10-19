/**
 * Fix: Implement the main App component.
 * This file was previously empty, causing module resolution errors.
 * This implementation provides the main application logic, state management,
 * and renders different game screens based on the game phase.
 */
// FIX: Import useState, useEffect, and useCallback from React to resolve multiple "Cannot find name" errors.
import React, { useState, useEffect, useCallback } from 'react';
import { CHARACTERS, PUZZLES, GAME_CONSTANTS, CONCEPTS } from './constants';
import type { Character, Puzzle, Concept, Difficulty } from './types';
import { GamePhase, AnimationState, SoundType } from './types';
import CharacterCard from './components/CharacterCard';
import TrainingArena from './components/TrainingArena';
import BattleCharacter from './components/BattleCharacter';
import HealthBar from './components/HealthBar';
import CodingChallengeModal from './components/CodingChallengeModal';
import PuzzleResultModal from './components/PuzzleResultModal';
import { audioService } from './services/audioService';
import IntroAnimation from './components/IntroAnimation';
import BuggyEffectOverlay from './components/BuggyEffectOverlay';

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
        <div className="absolute -bottom-2 md:-bottom-4 w-48 h-24 md:w-64 md:h-32" style={{ filter: `drop-shadow(0 0 15px ${color})`}}>
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
    const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
    const [selectedConcept, setSelectedConcept] = useState<Concept|null>(null);
    const [solvedPuzzleIds, setSolvedPuzzleIds] = useState<Set<number>>(() => {
        try {
            const item = window.localStorage.getItem('solvedPuzzleIds');
            // Convert array back to Set
            return item ? new Set(JSON.parse(item)) : new Set();
        } catch (error) {
            console.error("Error reading solved puzzle IDs from localStorage", error);
            return new Set();
        }
    });

    useEffect(() => {
        try {
            // Convert Set to array for JSON serialization
            window.localStorage.setItem('solvedPuzzleIds', JSON.stringify(Array.from(solvedPuzzleIds)));
        } catch (error) {
            console.error("Error saving solved puzzle IDs to localStorage", error);
        }
    }, [solvedPuzzleIds]);

    const [playerHealth, setPlayerHealth] = useState(GAME_CONSTANTS.PLAYER_MAX_HEALTH);
    const [opponentHealth, setOpponentHealth] = useState(GAME_CONSTANTS.OPPONENT_MAX_HEALTH);
    const [playerAnimation, setPlayerAnimation] = useState(AnimationState.IDLE);
    const [opponentAnimation, setOpponentAnimation] = useState(AnimationState.IDLE);
    const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
    const [failedPuzzle, setFailedPuzzle] = useState<Puzzle | null>(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [turnMessage, setTurnMessage] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [showLearningPath, setShowLearningPath] = useState(false);
    const [showBuggyEffect, setShowBuggyEffect] = useState(false);

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

    const markPuzzleAsSolved = useCallback((puzzleId: number) => {
        setSolvedPuzzleIds(prev => new Set(prev).add(puzzleId));
    }, []);

    const handleStartLearning = (concept: Concept) => {
        audioService.playSound(SoundType.ENTER_TRAINING);
        setSelectedConcept(concept);
        setGamePhase(GamePhase.LEARNING);
    };

    const handleBattle = (character: Character) => {
        audioService.playSound(SoundType.SELECT_CHAR);
        setPlayer(character);
        setGamePhase(GamePhase.DIFFICULTY_SELECT);
    };
    
    const handleStartBattle = (selectedDifficulty: Difficulty) => {
        if (!player) return;
        audioService.playSound(SoundType.CLICK);
        setDifficulty(selectedDifficulty);

        const availableOpponents = CHARACTERS.filter(c => c.id !== player.id);
        const randomOpponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];
        setOpponent(randomOpponent);

        setPlayerHealth(GAME_CONSTANTS.PLAYER_MAX_HEALTH);
        setOpponentHealth(GAME_CONSTANTS.OPPONENT_MAX_HEALTH);
        setPlayerAnimation(AnimationState.INTRO);
        setOpponentAnimation(AnimationState.INTRO);
        setIsPlayerTurn(true);
        setTurnMessage(`${player.name}, prepare for a practice match!`);
        setGamePhase(GamePhase.BATTLE);

        setTimeout(() => {
            setPlayerAnimation(AnimationState.IDLE);
            setOpponentAnimation(AnimationState.IDLE);
            setTurnMessage("Your turn to attack!");
        }, 2000);
    };

    const handleExitLearning = () => {
        audioService.playSound(SoundType.CLICK);
        setGamePhase(GamePhase.HUB);
        setShowLearningPath(true);
        setSelectedConcept(null);
    };

    const resetGame = useCallback(() => {
        audioService.stopBackgroundMusic();
        setGamePhase(GamePhase.HUB);
        setPlayer(null);
        setOpponent(null);
        setFailedPuzzle(null);
        setCurrentPuzzle(null);
        setShowLearningPath(false);
    }, []);

    const handleReturnToHub = () => {
        audioService.playSound(SoundType.CLICK);
        resetGame();
    };
    
    const startPlayerAttack = () => {
        if (!isPlayerTurn || !player || gamePhase !== GamePhase.BATTLE) return;
        audioService.playSound(SoundType.CLICK);
        const puzzles = getPuzzlesForCharacter(player);
        const randomPuzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
        setCurrentPuzzle(randomPuzzle);
    };

    const handleSolvePuzzle = () => {
        audioService.playSound(SoundType.SUCCESS);
        if (currentPuzzle) {
            markPuzzleAsSolved(currentPuzzle.id);
        }
        setCurrentPuzzle(null);
        setPlayerAnimation(AnimationState.ATTACKING);
        setTurnMessage(`${player?.name} unleashes a power move!`);

        setTimeout(() => {
            const damage = GAME_CONSTANTS.BASE_ATTACK_DAMAGE + (Math.random() * GAME_CONSTANTS.POWER_ATTACK_BONUS);
            setOpponentHealth(prev => Math.max(0, prev - damage));
            setOpponentAnimation(AnimationState.HIT);
            audioService.playSound(SoundType.OPPONENT_HIT);

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
        audioService.playSound(SoundType.FAIL);
        setShowBuggyEffect(true);
        setTimeout(() => setShowBuggyEffect(false), 2500);

        if (currentPuzzle) {
            setFailedPuzzle(currentPuzzle);
        }
        setCurrentPuzzle(null);
        setTurnMessage(`${player?.name}'s code has a bug!`);

        const failDamage = GAME_CONSTANTS.FAIL_DAMAGE[difficulty];
        setPlayerAnimation(AnimationState.HIT);
        audioService.playSound(SoundType.PLAYER_HIT);
        setPlayerHealth(prev => Math.max(0, prev - failDamage));

        setTimeout(() => {
            setPlayerAnimation(AnimationState.IDLE);
            if (playerHealth - failDamage > 0) {
                 setIsPlayerTurn(false);
            }
        }, 500);
    };
    
    const handleToggleMute = () => {
        setIsMuted(audioService.toggleMute());
    };

    // Background Music Controller
    useEffect(() => {
        if (gamePhase === GamePhase.BATTLE) {
            audioService.playBackgroundMusic();
        } else {
            audioService.stopBackgroundMusic();
        }
        return () => {
            audioService.stopBackgroundMusic();
        };
    }, [gamePhase]);


    // Opponent's turn logic
    useEffect(() => {
        if (gamePhase === GamePhase.BATTLE && !isPlayerTurn && opponentHealth > 0 && playerHealth > 0 && player && opponent) {
            const opponentTurnTimeout = setTimeout(async () => {
                const taunt = await audioService.getBanter(opponent, player, 'taunt');
                setTurnMessage(`"${taunt}"`);

                setTimeout(() => {
                    setOpponentAnimation(AnimationState.ATTACKING);
                    audioService.playSound(SoundType.ATTACK);
                    
                    setTimeout(() => {
                        const damage = GAME_CONSTANTS.OPPONENT_ATTACK_DAMAGE[difficulty];
                        setPlayerHealth(prev => Math.max(0, prev - damage));
                        setPlayerAnimation(AnimationState.HIT);
                        audioService.playSound(SoundType.PLAYER_HIT);

                        setTimeout(() => {
                            setOpponentAnimation(AnimationState.IDLE);
                            setPlayerAnimation(AnimationState.IDLE);
                            setIsPlayerTurn(true);
                            setTurnMessage("Your turn to attack!");
                        }, 500);
                    }, 1000);
                }, 2000); // Wait for user to read taunt
            }, 1000);

            return () => clearTimeout(opponentTurnTimeout);
        }
    }, [isPlayerTurn, gamePhase, opponent, opponentHealth, playerHealth, player, difficulty]);
    
    // Check for game over
    useEffect(() => {
        const handleGameOver = async () => {
            if ((playerHealth <= 0 || opponentHealth <= 0) && gamePhase === GamePhase.BATTLE && player && opponent) {
                setGamePhase(GamePhase.GAMEOVER);
                if (playerHealth <= 0) {
                    setPlayerAnimation(AnimationState.LOSE);
                    setOpponentAnimation(AnimationState.WIN);
                    const victoryQuote = await audioService.getBanter(opponent, player, 'victory');
                    setTurnMessage(`"${victoryQuote}"`);
                    audioService.playSound(SoundType.LOSE);
                } else {
                    setPlayerAnimation(AnimationState.WIN);
                    setOpponentAnimation(AnimationState.LOSE);
                    const victoryQuote = await audioService.getBanter(player, opponent, 'victory');
                    setTurnMessage(`"${victoryQuote}"`);
                    audioService.playSound(SoundType.WIN);
                }
            }
        };
        handleGameOver();
    }, [playerHealth, opponentHealth, gamePhase, player, opponent]);

    if (isIntro) {
        return <IntroAnimation onComplete={() => setIsIntro(false)} />;
    }

    const renderContent = () => {
        if (gamePhase === GamePhase.HUB) {
             return (
                <div className="text-center p-4">
                    <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-400">Code Clash</h1>
                    <h2 className="text-2xl text-gray-300 mb-8">Learn to Code by Fighting with Logic</h2>
                     {!showLearningPath ? (
                        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                            <button onClick={() => { audioService.playSound(SoundType.CLICK); setShowLearningPath(true); }} className="px-8 py-4 md:px-10 md:py-5 text-xl md:text-2xl font-bold text-white bg-cyan-600 rounded-lg shadow-[0_0_20px_rgba(34,211,238,0.7)] hover:bg-cyan-500 transition-all duration-300 transform hover:scale-105">
                                Learning Path
                            </button>
                             <button onClick={() => { audioService.playSound(SoundType.CLICK); setGamePhase(GamePhase.SELECT); }} className="px-8 py-4 md:px-10 md:py-5 text-xl md:text-2xl font-bold text-white bg-red-600 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.7)] hover:bg-red-500 transition-all duration-300 transform hover:scale-105">
                                Practice Arena
                            </button>
                        </div>
                    ) : (
                        <div className="relative glowing-border p-1 max-w-4xl mx-auto">
                           <div className="bg-black/60 rounded-lg p-6">
                            <h3 className="text-3xl font-bold text-cyan-300 mb-6">Your Coding Journey</h3>
                            <div className="flex flex-col items-center gap-2">
                                {CONCEPTS.map((concept, index) => (
                                    <React.Fragment key={concept.name}>
                                        <div onClick={() => handleStartLearning(concept)}
                                            className="w-full bg-gray-800/70 p-4 rounded-lg border-2 border-cyan-700 hover:bg-cyan-900/50 hover:border-cyan-400 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 text-left">
                                            <h4 className="text-xl font-bold text-cyan-400">{index + 1}. {concept.name}</h4>
                                            <p className="text-gray-400">{concept.description}</p>
                                        </div>
                                        {index < CONCEPTS.length - 1 && (
                                            <div className="h-6 w-1 bg-cyan-700/50"></div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                            <button onClick={() => { audioService.playSound(SoundType.CLICK); setShowLearningPath(false); }} className="mt-6 px-6 py-2 text-lg font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700">Back</button>
                           </div>
                        </div>
                    )}
                </div>
             );
        }

        if (gamePhase === GamePhase.SELECT) {
            return (
                <>
                    <style>{`
                        @keyframes rotate-border {
                            from { transform: rotate(0deg); opacity: 0.7; }
                            50% { opacity: 1; }
                            to { transform: rotate(360deg); opacity: 0.7; }
                        }
                        .glowing-container-wrap {
                            position: relative;
                            padding: 3px;
                            border-radius: 0.75rem; /* rounded-xl */
                            overflow: hidden;
                            z-index: 0;
                        }
                        .glowing-container-wrap::after {
                            content: '';
                            position: absolute;
                            inset: -200%;
                            background: conic-gradient(from 0deg, #d946ef, #8b5cf6, #22d3ee, #34d399, #d946ef);
                            animation: rotate-border 8s linear infinite;
                            filter: blur(25px);
                            z-index: -2;
                        }
                        .glowing-container-wrap::before {
                            content: '';
                            position: absolute;
                            inset: -200%;
                            background: conic-gradient(from 0deg, #d946ef, #8b5cf6, #22d3ee, #34d399, #d946ef);
                            animation: rotate-border 8s linear infinite;
                            z-index: -1;
                        }
                        .glowing-container-content {
                            background-color: rgba(2, 6, 23, 0.7);
                            background-image: 
                                radial-gradient(ellipse at center, transparent 50%, rgba(2, 6, 23, 0.8) 100%),
                                linear-gradient(rgba(255, 255, 255, 0.025) 1px, transparent 1px);
                            background-size: 100% 100%, 100% 3px;
                            animation: subtle-scanline 12s linear infinite;
                            backdrop-filter: blur(5px);
                            border-radius: 0.6rem; /* Slightly smaller than wrapper */
                            position: relative;
                            z-index: 1;
                        }
                         @keyframes subtle-scanline {
                            from { background-position: 0 0; }
                            to { background-position: 0 -100px; }
                        }
                    `}</style>
                    <div className="text-center w-full">
                        <h1 className="text-4xl font-bold mb-2 text-red-400">Practice Arena</h1>
                        <h2 className="text-2xl text-gray-300 mb-6">Choose Your Champion to Spar</h2>
                        <div className="max-w-7xl mx-auto">
                            <div className="glowing-container-wrap">
                                <div className="glowing-container-content">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 px-4 py-8">
                                        {CHARACTERS.map(char => (
                                            <CharacterCard 
                                                key={char.id} 
                                                character={char} 
                                                onBattle={handleBattle}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                         <button onClick={handleReturnToHub} className="mt-8 px-6 py-2 text-lg font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700">Back to Hub</button>
                    </div>
                </>
            );
        }
        
        if (gamePhase === GamePhase.DIFFICULTY_SELECT) {
            return (
                 <div className="text-center w-full">
                    <h1 className="text-4xl font-bold mb-2 text-yellow-400">Select Difficulty</h1>
                    <h2 className="text-2xl text-gray-300 mb-8">Choose your challenge level.</h2>
                    <div className="relative glowing-border p-1 max-w-4xl mx-auto">
                        <div className="bg-black/60 rounded-lg p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                             {/* Easy */}
                             <div onClick={() => handleStartBattle('EASY')} className="p-6 bg-green-900/50 rounded-lg border-2 border-green-500 hover:bg-green-800/50 hover:border-green-400 cursor-pointer transition-all transform hover:scale-105">
                                 <h3 className="text-2xl md:text-3xl font-bold text-green-400">EASY</h3>
                                 <p className="mt-2 text-gray-300">Longer timer, easier hints, and less opponent damage. Perfect for learning.</p>
                             </div>
                             {/* Medium */}
                             <div onClick={() => handleStartBattle('MEDIUM')} className="p-6 bg-yellow-900/50 rounded-lg border-2 border-yellow-500 hover:bg-yellow-800/50 hover:border-yellow-400 cursor-pointer transition-all transform hover:scale-105">
                                 <h3 className="text-2xl md:text-3xl font-bold text-yellow-400">MEDIUM</h3>
                                 <p className="mt-2 text-gray-300">The standard experience. Balanced timer, hints, and damage.</p>
                             </div>
                             {/* Hard */}
                             <div onClick={() => handleStartBattle('HARD')} className="p-6 bg-red-900/50 rounded-lg border-2 border-red-500 hover:bg-red-800/50 hover:border-red-400 cursor-pointer transition-all transform hover:scale-105">
                                 <h3 className="text-2xl md:text-3xl font-bold text-red-400">HARD</h3>
                                 <p className="mt-2 text-gray-300">Shorter timer, cryptic hints, and tougher opponents. For seasoned coders.</p>
                             </div>
                        </div>
                    </div>
                    <button onClick={() => setGamePhase(GamePhase.SELECT)} className="mt-8 px-6 py-2 text-lg font-bold text-white bg-gray-600 rounded-lg hover:bg-gray-700">Back to Character Select</button>
                 </div>
            );
        }

        if (gamePhase === GamePhase.LEARNING && selectedConcept) {
            return (
                <TrainingArena 
                    concept={selectedConcept}
                    puzzles={getPuzzlesForConcept(selectedConcept.tags)} 
                    onExit={handleExitLearning} 
                    solvedPuzzleIds={solvedPuzzleIds}
                    onPuzzleSolved={markPuzzleAsSolved}
                />
            );
        }

        if ((gamePhase === GamePhase.BATTLE || gamePhase === GamePhase.GAMEOVER) && player && opponent) {
             const platformColor = (character: Character) => colorMap[character.color] || '#ffffff';
            return (
                <div className="flex flex-col h-full w-full relative z-10">
                    {currentPuzzle && <CodingChallengeModal puzzle={currentPuzzle} onSolve={handleSolvePuzzle} onFail={handleFailPuzzle} solvedPuzzleIds={solvedPuzzleIds} difficulty={difficulty} />}
                    {failedPuzzle && <PuzzleResultModal puzzle={failedPuzzle} onDismiss={() => setFailedPuzzle(null)} />}
                    {showBuggyEffect && <BuggyEffectOverlay />}
                    
                    <div className="absolute top-4 left-4 right-4 flex justify-between z-30">
                       <button onClick={handleReturnToHub} className="px-4 py-2 text-sm font-bold text-white bg-red-600/80 rounded-lg hover:bg-red-700/80 backdrop-blur-sm transition-colors">
                            Exit
                       </button>
                       <button onClick={handleToggleMute} className="px-3 py-2 text-sm font-bold text-white bg-blue-600/80 rounded-lg hover:bg-blue-700/80 backdrop-blur-sm transition-colors">
                           {isMuted ? 
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.093.707z" clipRule="evenodd" /></svg>
                           : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.093.707zm5.828 9.9a1 1 0 01-1.414-1.414L15.586 10l-1.79-1.79a1 1 0 011.413-1.414L17 8.586l1.79-1.79a1 1 0 011.414 1.414L18.414 10l1.79 1.79a1 1 0 01-1.414 1.414L17 11.414l-1.79 1.79z" clipRule="evenodd" /></svg>
                           }
                       </button>
                    </div>

                    <div className="flex-1 w-full flex flex-col md:flex-row justify-around items-center px-2 md:px-8 gap-8 md:gap-0">
                        {/* Player */}
                        <div className="flex flex-col items-center relative">
                             <h2 className="text-2xl md:text-3xl font-bold mb-2 text-cyan-300" style={{ textShadow: '0 0 8px #22d3ee' }}>{player.name}</h2>
                             <div className="w-64 md:w-80"><HealthBar health={playerHealth} maxHealth={GAME_CONSTANTS.PLAYER_MAX_HEALTH} color="bg-green-500" /></div>
                             <div className="mt-4 relative flex items-center justify-center">
                                <BattleCharacter character={player} animation={playerAnimation} />
                                <HexPlatform color={platformColor(player)} />
                             </div>
                        </div>
                        {/* Opponent */}
                        <div className="flex flex-col items-center relative">
                             <h2 className="text-2xl md:text-3xl font-bold mb-2 text-red-400" style={{ textShadow: '0 0 8px #ef4444' }}>{opponent.name}</h2>
                             <div className="w-64 md:w-80"><HealthBar health={opponentHealth} maxHealth={GAME_CONSTANTS.OPPONENT_MAX_HEALTH} color="bg-red-500" /></div>
                             <div className="mt-4 relative flex items-center justify-center">
                                <BattleCharacter character={opponent} animation={opponentAnimation} isOpponent />
                                <HexPlatform color={platformColor(opponent)} />
                             </div>
                        </div>
                    </div>

                    <div className="relative z-20 pb-4 w-full">
                        <div className="max-w-md md:max-w-3xl mx-auto bg-black/50 backdrop-blur-sm border-2 border-gray-600/70 p-3 rounded-xl shadow-lg w-full">
                           <div className="h-20 flex flex-col items-center justify-center text-center px-4">
                             <p className="text-lg md:text-xl font-bold text-yellow-300 mb-2">{turnMessage}</p>
                             {isPlayerTurn && gamePhase === GamePhase.BATTLE && (
                                 <button onClick={startPlayerAttack} className="px-6 py-2 font-bold text-white bg-red-600 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.8)] hover:bg-red-500 transition-all duration-300 transform hover:scale-105">
                                     Attack()
                                 </button>
                             )}
                             {gamePhase === GamePhase.GAMEOVER && (
                                 <button onClick={handleReturnToHub} className="px-6 py-2 font-bold text-white bg-blue-600 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.8)] hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                                     Back to Hub
                                 </button>
                             )}
                           </div>
                        </div>
                    </div>

                </div>
            );
        }

        return <div className="text-white">Loading...</div>; // Fallback
    };
    
    const getBackground = () => {
        switch (gamePhase) {
            case GamePhase.BATTLE:
            case GamePhase.GAMEOVER:
                return <BattleBackground />;
            case GamePhase.HUB:
            case GamePhase.SELECT:
            case GamePhase.DIFFICULTY_SELECT:
            case GamePhase.LEARNING:
            default:
                return <HomeScreenBackground />;
        }
    }

    return (
        <main className="relative font-sans min-h-screen w-screen bg-slate-900 text-white">
            {getBackground()}
            <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-4">
                {renderContent()}
            </div>
        </main>
    );
};
// FIX: Add default export for App component
export default App;