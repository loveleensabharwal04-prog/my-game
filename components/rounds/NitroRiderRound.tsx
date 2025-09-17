import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Game, GameState } from '../../types.ts';
import { updateGame } from '../../services/gameService.ts';
import Button from '../ui/Button.tsx';
import { useSound } from '../../contexts/SoundContext.tsx';

interface NitroRiderRoundProps {
    game: Game;
    currentPlayerId: number;
}

const FINISH_LINE = 100;
const HEAT_INCREASE = 0.8;
const HEAT_DECREASE = 0.5;
const MAX_SPEED = 2.5;
const FRICTION = 0.98;
const OVERHEAT_THRESHOLD = 100;
const COOLDOWN_THRESHOLD = 20;
const UPDATE_INTERVAL = 100; // ms

const RaceTrack: React.FC<{ name: string; position: number, isOverheated: boolean }> = ({ name, position, isOverheated }) => {
    const progress = Math.min((position / FINISH_LINE) * 100, 100);
    return (
        <div>
            <p className="font-semibold text-rose-700 mb-1">{name}</p>
            <div className="w-full bg-rose-200 rounded-full h-10 relative overflow-hidden">
                <div 
                    className={`absolute top-0 left-0 h-full transition-all duration-100 ease-linear flex items-center ${isOverheated ? 'animate-pulse' : ''}`}
                    style={{ width: `${progress}%` }}
                >
                   <span className={`text-4xl ${isOverheated ? 'opacity-50' : ''}`}>🏍️</span>
                </div>
                 <div className="absolute top-0 right-2 h-full flex items-center text-4xl">🏁</div>
            </div>
        </div>
    )
}

const HeatGauge: React.FC<{ heat: number }> = ({ heat }) => {
    const height = Math.min((heat / OVERHEAT_THRESHOLD) * 100, 100);
    const color = heat > 80 ? 'bg-red-500' : heat > 50 ? 'bg-yellow-400' : 'bg-green-500';
    return (
        <div className="w-10 h-40 bg-gray-300 rounded-lg overflow-hidden border-2 border-gray-400">
            <div
                className={`w-full ${color} transition-all duration-100 ease-linear`}
                style={{ height: `${height}%`, marginTop: `${100 - height}%` }}
            />
        </div>
    );
}

const NitroRiderRound: React.FC<NitroRiderRoundProps> = ({ game, currentPlayerId }) => {
    const { status, roundWinner, currentRace, wins } = game.roundState.nitroRider;
    const { playSound } = useSound();
    
    const [isAccelerating, setIsAccelerating] = useState(false);
    const localState = useRef({
        position: game.roundState.nitroRider.positions[currentPlayerId],
        speed: 0,
        heat: game.roundState.nitroRider.heats[currentPlayerId],
        overheated: game.roundState.nitroRider.overheated[currentPlayerId]
    });
    const lastUpdateTime = useRef(0);
    const animationFrameId = useRef<number | null>(null);

    const handleStart = () => {
        if (currentPlayerId !== 0 || status !== 'intro') return;
        updateGame(game.id, { 'roundState/nitroRider/status': 'playing' });
    };

    const handleNextRace = () => {
        if (currentPlayerId !== 0) return;

        const player0Wins = wins[0];
        const player1Wins = wins[1];
        
        if (player0Wins === 2 || player1Wins === 2) {
            const overallWinnerId = player0Wins === 2 ? 0 : 1;
            updateGame(game.id, {
                'roundState/nitroRider/status': 'finished',
                [`players/${overallWinnerId}/score`]: game.players[overallWinnerId].score + 50
            });
        } else {
            updateGame(game.id, {
                'roundState/nitroRider/status': 'playing',
                'roundState/nitroRider/currentRace': currentRace + 1,
                'roundState/nitroRider/positions': { 0: 0, 1: 0 },
                'roundState/nitroRider/heats': { 0: 0, 1: 0 },
                'roundState/nitroRider/overheated': { 0: false, 1: false },
                'roundState/nitroRider/roundWinner': null,
            });
        }
    };
    
    const handleFinishGame = () => {
        if (currentPlayerId !== 0) return;
        updateGame(game.id, { gameState: GameState.End });
    };

    const gameLoop = useCallback(() => {
        const state = localState.current;
        
        if (isAccelerating && !state.overheated) {
            state.heat = Math.min(state.heat + HEAT_INCREASE, OVERHEAT_THRESHOLD + 10);
            state.speed = Math.min(state.speed + 0.1, MAX_SPEED);
            if (state.heat >= OVERHEAT_THRESHOLD) {
                state.overheated = true;
            }
        } else {
            state.heat = Math.max(state.heat - HEAT_DECREASE, 0);
            if (state.overheated && state.heat < COOLDOWN_THRESHOLD) {
                state.overheated = false;
            }
        }
        
        state.speed *= FRICTION;
        if(state.speed < 0.01) state.speed = 0;

        if (!state.overheated) {
            state.position += state.speed / 10;
        }

        if (state.position >= FINISH_LINE && roundWinner === null) {
            const newWins = { ...wins };
            newWins[currentPlayerId]++;
            
            const updates: any = {
                'roundState/nitroRider/status': 'round-end',
                'roundState/nitroRider/roundWinner': currentPlayerId,
                'roundState/nitroRider/wins': newWins,
                [`roundState/nitroRider/positions/${currentPlayerId}`]: FINISH_LINE,
            };
            updateGame(game.id, updates);
            cancelAnimationFrame(animationFrameId.current!);
            return;
        }

        const now = Date.now();
        if (now - lastUpdateTime.current > UPDATE_INTERVAL) {
            updateGame(game.id, {
                [`roundState/nitroRider/positions/${currentPlayerId}`]: state.position,
                [`roundState/nitroRider/heats/${currentPlayerId}`]: state.heat,
                [`roundState/nitroRider/overheated/${currentPlayerId}`]: state.overheated,
            });
            lastUpdateTime.current = now;
        }
        
        animationFrameId.current = requestAnimationFrame(gameLoop);
    }, [isAccelerating, currentPlayerId, game.id, roundWinner, wins]);

    useEffect(() => {
        if (status === 'playing' && roundWinner === null) {
            localState.current.position = game.roundState.nitroRider.positions[currentPlayerId];
            localState.current.heat = game.roundState.nitroRider.heats[currentPlayerId];
            localState.current.overheated = game.roundState.nitroRider.overheated[currentPlayerId];

            animationFrameId.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [status, roundWinner, gameLoop, game.roundState.nitroRider.positions, game.roundState.nitroRider.heats, game.roundState.nitroRider.overheated, currentPlayerId]);


    if (status === 'intro') {
        return (
            <div className="text-center p-4 bg-rose-50 rounded-xl space-y-4 animate-fade-in">
                <h2 className="text-center text-2xl font-bold text-rose-500 mb-2">Final Round: Nitro Rider!</h2>
                <p className="text-gray-700">It's a best of 3 race! Hold 'Accelerate' to speed up, but release before you overheat! Win 2 races to get a <span className="font-bold text-rose-500">50 point bonus!</span></p>
                {currentPlayerId === 0 ? (
                    <Button onClick={handleStart}>Start Race</Button>
                ) : (
                    <p className="text-gray-500 text-sm">Waiting for {game.players[0].name} to start...</p>
                )}
            </div>
        );
    }

    if (status === 'round-end') {
        const winnerName = roundWinner !== null ? game.players[roundWinner].name : '';
        return (
            <div className="text-center p-4 bg-rose-50 rounded-xl space-y-4 animate-fade-in">
                <h2 className="text-center text-3xl font-bold text-rose-500 mb-2">{winnerName} wins Race {currentRace}!</h2>
                <p className="text-xl font-semibold">Score: {wins[0]} - {wins[1]}</p>
                 {currentPlayerId === 0 ? (
                    <Button onClick={handleNextRace}>
                        {wins[0] === 2 || wins[1] === 2 ? 'Finish Challenge' : 'Next Race'}
                    </Button>
                ) : (
                    <p className="text-gray-500 text-sm">Waiting for {game.players[0].name} to continue...</p>
                )}
            </div>
        )
    }
    
    if (status === 'finished') {
        const overallWinnerId = wins[0] === 2 ? 0 : (wins[1] === 2 ? 1 : null);
        let resultMessage = "The race is over!";
        if(overallWinnerId !== null){
             playSound('celebrate');
             const winnerName = game.players[overallWinnerId].name;
             resultMessage = `${winnerName} won the challenge and gets 50 bonus points!`;
        }
       
        return (
             <div className="text-center p-4 bg-rose-50 rounded-xl space-y-4 animate-fade-in">
                <h2 className="text-center text-3xl font-bold text-rose-500 mb-2">Challenge Over!</h2>
                <p className="text-xl font-semibold text-green-600">{resultMessage}</p>
                {currentPlayerId === 0 ? (
                    <Button onClick={handleFinishGame}>Finish Game</Button>
                ) : (
                    <p className="text-gray-500 text-sm">Waiting for {game.players[0].name} to end the game...</p>
                )}
            </div>
        )
    }

    const { positions, heats, overheated } = game.roundState.nitroRider;
    const myHeat = heats[currentPlayerId];
    const isMyBikeOverheated = overheated[currentPlayerId];

    return (
        <div className="p-6 bg-rose-50 rounded-xl space-y-4 animate-fade-in">
             <div className="text-center">
                <h3 className="text-xl font-bold text-rose-600">Race {currentRace} of 3</h3>
                <p className="text-lg font-semibold">🏆 {wins[0]} - {wins[1]} 🏆</p>
            </div>
            <div className="space-y-4">
                <RaceTrack name={game.players[0].name} position={positions[0]} isOverheated={overheated[0]} />
                <RaceTrack name={game.players[1].name} position={positions[1]} isOverheated={overheated[1]} />
            </div>
            
            <div className="flex items-center justify-around pt-4">
                <div className="text-center">
                    <Button
                        onMouseDown={() => setIsAccelerating(true)}
                        onMouseUp={() => setIsAccelerating(false)}
                        onMouseLeave={() => setIsAccelerating(false)}
                        onTouchStart={(e) => { e.preventDefault(); setIsAccelerating(true); }}
                        onTouchEnd={(e) => { e.preventDefault(); setIsAccelerating(false); }}
                        className={`py-8 px-12 text-2xl select-none ${isAccelerating && !isMyBikeOverheated ? 'bg-green-600' : ''}`}
                        disabled={isMyBikeOverheated}
                    >
                        {isMyBikeOverheated ? "Overheated!" : "Accelerate"}
                    </Button>
                </div>
                 <div>
                    <p className="text-center font-bold mb-1 text-rose-800">Engine Heat</p>
                    <HeatGauge heat={myHeat} />
                </div>
            </div>
        </div>
    );
};

export default NitroRiderRound;