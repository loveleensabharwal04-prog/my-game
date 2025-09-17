import { db } from './firebase.ts';
import { Game, GameState, GameRound, Player } from '../types.ts';

// Helper to generate a random 4-letter ID
const generateGameId = (): string => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// Get a reference to a specific game in the database
const getGameRef = (gameId: string) => db.ref(`games/${gameId}`);

export const createGame = async (player1Name: string): Promise<{ gameId: string, playerId: number }> => {
    const gameId = generateGameId();
    const gameRef = getGameRef(gameId);

    const player1: Player = { name: player1Name, score: 0 };
    const player2: Player = { name: 'Waiting...', score: 0 };

    const newGame: Game = {
        id: gameId,
        players: [player1, player2],
        gameState: GameState.WaitingForPlayer,
        currentRound: GameRound.ThisOrThat,
        roundState: {
            thisOrThat: { turn: 0, answer: null, guess: null, showResult: false },
            howWellDoYouKnowMe: { turn: 0, guess: null, judgement: null, phase: 'answering' },
            pixelJumper: { 
                status: 'intro', 
                currentRace: 1,
                wins: { 0: 0, 1: 0 },
                lives: { 0: 3, 1: 3 },
                playerStates: { 
                    0: { y: 0, isAlive: true }, 
                    1: { y: 0, isAlive: true }
                },
                distance: 0,
                obstacles: [],
                roundWinner: null
            },
        }
    };
    
    await gameRef.set(newGame);
    return { gameId, playerId: 0 };
};

export const joinGame = async (gameId: string, player2Name: string): Promise<{ success: boolean, playerId?: number, message?: string }> => {
    const gameRef = getGameRef(gameId);
    const snapshot = await gameRef.get();

    if (!snapshot.exists()) {
        return { success: false, message: 'Game not found.' };
    }

    const game: Game = snapshot.val();
    if (game.gameState !== GameState.WaitingForPlayer) {
        return { success: false, message: 'Game is already full.' };
    }
    
    await gameRef.update({
        'players/1/name': player2Name,
        'gameState': GameState.Game
    });
    
    return { success: true, playerId: 1 };
};

export const updateGame = (gameId: string, updates: object) => {
    const gameRef = getGameRef(gameId);
    return gameRef.update(updates);
};

export const onGameUpdate = (gameId: string, callback: (game: Game) => void): (() => void) => {
    const gameRef = getGameRef(gameId);
    const listener = gameRef.on('value', (snapshot) => {
        if (snapshot.exists()) {
            callback(snapshot.val());
        }
    });

    // Return an unsubscribe function
    return () => gameRef.off('value', listener);
};
