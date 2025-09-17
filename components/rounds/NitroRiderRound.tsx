import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Game, GameState, Obstacle } from '../../types.ts';
import { updateGame } from '../../services/gameService.ts';
import Button from '../ui/Button.tsx';
import { useSound } from '../../contexts/SoundContext.tsx';

// --- Game Constants ---
const GRAVITY = -1.2;
const JUMP_FORCE = 18;
const GROUND_Y = 0;
const RACE_LENGTH = 3500;
const PLAYER_X_POSITION = 50; // Player's fixed horizontal position on screen
const PLAYER_HEIGHT = 40; // in pixels
const PLAYER_WIDTH = 30;
const OBSTACLE_WIDTH = 40;
const GAME_SPEED = 5;
const INVULNERABILITY_MS = 1500; // Time in ms after getting hit

// --- Helper Functions and Components ---

// Generates a predictable set of obstacles for a race based on a seed
const generateObstacles = (raceNum: number): Obstacle[] => {
    const obs: Obstacle[] = [];
    let seed = raceNum;
    function pseudoRandom() {
        var x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    for (let i = 700; i < RACE_LENGTH - 500; i += pseudoRandom() * 250 + 380) {
        obs.push({ x: i, height: 45 + pseudoRandom() * 25 });
    }
    return obs;
};

const PlayerSprite: React.FC<{ y: number; name: string; isMe: boolean, isAlive: boolean }> = React.memo(({ y, name, isMe, isAlive }) => (
    <div style={{
        position: 'absolute',
        bottom: `${y}px`,
        left: `${PLAYER_X_POSITION}px`,
        transition: 'bottom 0.05s linear',
        opacity: isAlive ? (isMe ? 1 : 0.7) : 0.3,
        filter: isMe ? '' : 'grayscale(50%)'
    }}>
        <div className="text-center relative">
            <span style={{ fontSize: '30px' }} className={!isAlive ? 'transform -scale-y-100' : ''}>
              {isAlive ? '🏃' : '👻'}
            </span>
            <p className="text-xs font-bold bg-white/70 rounded px-1 absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap">{name}</p>
        </div>
    </div>
));

const ObstacleSprite: React.FC<{ obstacle: Obstacle; distance: number }> = React.memo(({ obstacle, distance }) => (
    <div style={{
        position: 'absolute',
        bottom: `${GROUND_Y}px`,
        left: `${obstacle.x - distance}px`,
        width: `${OBSTACLE_WIDTH}px`,
        height: `${obstacle.height}px`,
    }}>
       <span style={{fontSize: '35px'}}>🧱</span>
    </div>
));

const LivesDisplay: React.FC<{ lives: number }> = ({ lives }) => (
    <div className="flex gap-1">
        {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-2xl transition-opacity duration-300 ${i < lives ? 'text-red-500' : 'text-gray-400 opacity-30'}`}>❤️</span>
        ))}
    </div>
);


// --- Main Component ---
const PixelJumperRound: React.FC<{ game: Game; currentPlayerId: number; }> = ({ game, currentPlayerId }) => {
    const { status, roundWinner, currentRace, wins, lives, playerStates, distance, obstacles } = game.roundState.pixelJumper;
    
    const localPhysics = useRef({ y: GROUND_Y, vy: 0 });
    const animationFrameId = useRef<number | null>(null);
    const lastUpdate = useRef(0);
    const [isInvulnerable, setIsInvulnerable] = useState(false);
    
    const { playSound } = useSound();

    const myPlayerState = playerStates[currentPlayerId];
    const opponentId = (currentPlayerId + 1) % 2;
    const opponentPlayerState = playerStates[opponentId];
    
    // --- Handlers for Game State Changes ---
    const handleStart = () => {
        if (currentPlayerId !== 0 || status !== 'intro') return;
        const newObstacles = generateObstacles(currentRace);
        updateGame(game.id, { 
            'roundState/pixelJumper/status': 'playing',
            'roundState/pixelJumper/obstacles': newObstacles
        });
    };

    const handleNextRace = () => {
        if (currentPlayerId !== 0) return;
        
        if (wins[0] >= 2 || wins[1] >= 2) {
             const winnerId = wins[0] >= 2 ? 0 : 1;
             playSound('celebrate');
             updateGame(game.id, {
                'roundState/pixelJumper/status': 'finished',
                [`players/${winnerId}/score`]: game.players[winnerId].score + 50
            });
        } else {
            localPhysics.current = { y: GROUND_Y, vy: 0 };
            updateGame(game.id, {
                'roundState/pixelJumper/status': 'playing', // Go straight to playing for next race
                'roundState/pixelJumper/currentRace': currentRace + 1,
                'roundState/pixelJumper/lives': { 0: 3, 1: 3 },
                'roundState/pixelJumper/playerStates': { 0: {y: GROUND_Y, isAlive: true }, 1: {y: GROUND_Y, isAlive: true } },
                'roundState/pixelJumper/distance': 0,
                'roundState/pixelJumper/roundWinner': null,
                'roundState/pixelJumper/obstacles': generateObstacles(currentRace + 1),
            });
        }
    };
    
    const handleFinishGame = () => {
        if (currentPlayerId !== 0) return;
        updateGame(game.id, { gameState: GameState.End });
    };

    const handleJump = useCallback(() => {
        if (status === 'playing' && myPlayerState.isAlive && localPhysics.current.y <= GROUND_Y) {
            localPhysics.current.vy = JUMP_FORCE;
        }
    }, [status, myPlayerState.isAlive]);


    // --- Main Game Loop ---
    const gameLoop = useCallback(() => {
        const state = localPhysics.current;
        state.vy += GRAVITY;
        state.y += state.vy;

        if (state.y < GROUND_Y) {
            state.y = GROUND_Y;
            state.vy = 0;
        }

        // Collision detection
        if (!isInvulnerable) {
            for (const obs of obstacles) {
                const playerRect = { left: PLAYER_X_POSITION, right: PLAYER_X_POSITION + PLAYER_WIDTH, bottom: state.y, top: state.y + PLAYER_HEIGHT };
                const obsRect = { left: obs.x - distance, right: obs.x - distance + OBSTACLE_WIDTH, bottom: GROUND_Y, top: GROUND_Y + obs.height };
                
                if (playerRect.right > obsRect.left && playerRect.left < obsRect.right && playerRect.bottom < obsRect.top) {
                    setIsInvulnerable(true);
                    const newLives = Math.max(0, lives[currentPlayerId] - 1);
                    const updates: any = { [`roundState/pixelJumper/lives/${currentPlayerId}`]: newLives };
                    if (newLives === 0) {
                        updates[`roundState/pixelJumper/playerStates/${currentPlayerId}/isAlive`] = false;
                    }
                    updateGame(game.id, updates);
                    setTimeout(() => setIsInvulnerable(false), INVULNERABILITY_MS);
                    break;
                }
            }
        }
        
        const now = Date.now();
        if (now - lastUpdate.current > 100) {
            const updates: any = { [`roundState/pixelJumper/playerStates/${currentPlayerId}/y`]: state.y };
            if (currentPlayerId === 0) {
                updates['roundState/pixelJumper/distance'] = Math.min(distance + GAME_SPEED * (100 / 16.67), RACE_LENGTH);
            }
            updateGame(game.id, updates);
            lastUpdate.current = now;
        }
        
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [obstacles, distance, currentPlayerId, game.id, lives, isInvulnerable]);
    
    // --- Lifecycle and Sync Effects ---
    useEffect(() => {
        if (status === 'playing' && myPlayerState.isAlive) {
            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [status, myPlayerState.isAlive, gameLoop]);
    
    useEffect(() => {
        if (status !== 'playing' || currentPlayerId !== 0) return;

        let winner: number | null = null;
        const p0Alive = playerStates[0].isAlive;
        const p1Alive = playerStates[1].isAlive;

        if (!p0Alive && p1Alive) winner = 1;
        else if (p0Alive && !p1Alive) winner = 0;
        else if (distance >= RACE_LENGTH) winner = -1; // Tie

        if (winner !== null) {
            if (winner !== -1) playSound('correct');
            const newWins = {...wins};
            if(winner !== null && winner !== -1) newWins[winner]++;
            
            updateGame(game.id, {
                'roundState/pixelJumper/status': 'round-end',
                'roundState/pixelJumper/roundWinner': winner === -1 ? null : winner,
                'roundState/pixelJumper/wins': newWins
            });
        }
    }, [playerStates, distance, status, currentPlayerId]);

    // --- Render Logic ---
    if (status === 'intro') {
        return (
            <div className="text-center p-4 bg-rose-50 rounded-xl space-y-4 animate-fade-in">
                <h2 className="text-center text-2xl font-bold text-rose-500 mb-2">Final Round: Pixel Jumper!</h2>
                <p className="text-gray-700">It's a best of 3 race! Jump over the obstacles. You each have 3 lives. The last one standing wins the race. Win 2 races for a <span className="font-bold text-rose-500">50 point bonus!</span></p>
                {currentPlayerId === 0 ? (
                    <Button onClick={handleStart}>Start Race {currentRace}</Button>
                ) : (
                    <p className="text-gray-500 text-sm">Waiting for {game.players[0].name} to start...</p>
                )}
            </div>
        );
    }
    
    if (status === 'round-end') {
        const winnerName = roundWinner !== null ? game.players[roundWinner].name : '';
        const message = roundWinner !== null ? `${winnerName} wins Race ${currentRace}!` : `Race ${currentRace} is a tie!`;
        return (
            <div className="text-center p-4 bg-rose-50 rounded-xl space-y-4 animate-fade-in">
                <h2 className="text-center text-3xl font-bold text-rose-500 mb-2">{message}</h2>
                <p className="text-xl font-semibold">Score: {wins[0]} - {wins[1]}</p>
                 {currentPlayerId === 0 ? (
                    <Button onClick={handleNextRace}>
                        {wins[0] >= 2 || wins[1] >= 2 ? 'Finish Challenge' : 'Next Race'}
                    </Button>
                ) : (
                    <p className="text-gray-500 text-sm">Waiting for {game.players[0].name} to continue...</p>
                )}
            </div>
        )
    }
    
    if (status === 'finished') {
       const overallWinnerId = wins[0] >= 2 ? 0 : (wins[1] >= 2 ? 1 : null);
       const winnerName = overallWinnerId !== null ? game.players[overallWinnerId].name : "Nobody";
       const resultMessage = `${winnerName} won the Pixel Jumper challenge and gets 50 bonus points!`;
       
        return (
             <div className="text-center p-4 bg-rose-50 rounded-xl space-y-4 animate-fade-in">
                <h2 className="text-center text-3xl font-bold text-rose-500 mb-2">Challenge Over!</h2>
                <p className="text-xl font-semibold text-green-600">{resultMessage}</p>
                {currentPlayerId === 0 ? (
                    <Button onClick={handleFinishGame}>See Final Scores</Button>
                ) : (
                    <p className="text-gray-500 text-sm">Waiting for {game.players[0].name} to end the game...</p>
                )}
            </div>
        )
    }

    // --- Main Game View ---
    return (
        <div className="p-4 bg-rose-50 rounded-xl space-y-2 animate-fade-in select-none" onMouseDown={handleJump} onTouchStart={(e)=>{e.preventDefault(); handleJump();}}>
            <div className="flex justify-between items-center px-2">
                <div className="text-center">
                    <p className="font-bold text-rose-700">{game.players[0].name}</p>
                    <LivesDisplay lives={lives[0]} />
                </div>
                 <h3 className="text-xl font-bold text-rose-600">Race {currentRace} <span className="text-lg">({wins[0]}-{wins[1]})</span></h3>
                 <div className="text-center">
                    <p className="font-bold text-rose-700">{game.players[1].name}</p>
                    <LivesDisplay lives={lives[1]} />
                </div>
            </div>

            <div className="w-full h-48 bg-gradient-to-b from-cyan-200 to-cyan-400 rounded-lg overflow-hidden relative border-b-8 border-green-600">
                <PlayerSprite y={myPlayerState.y} name="You" isMe={true} isAlive={myPlayerState.isAlive}/>
                <PlayerSprite y={opponentPlayerState.y} name={game.players[opponentId].name} isMe={false} isAlive={opponentPlayerState.isAlive}/>

                {obstacles.map(obs => <ObstacleSprite key={obs.x} obstacle={obs} distance={distance} />)}
                <div className="absolute top-2 right-2 text-white font-bold text-sm">FINISH</div>
                <div className="absolute top-6 right-2 h-36 w-2 bg-white" style={{ left: `${RACE_LENGTH - distance}px`}} />
            </div>
            
            <Button onClick={handleJump} className="w-full text-2xl py-4" disabled={status !== 'playing' || !myPlayerState.isAlive}>
                JUMP!
            </Button>
        </div>
    );
};

export default PixelJumperRound;
