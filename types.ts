export enum GameState {
  WaitingForPlayer,
  Game,
  End,
}

export interface Player {
  name: string;
  score: number;
}

export enum GameRound {
    ThisOrThat,
    HowWellDoYouKnowMe,
    NitroRider
}

// State for each round
export interface ThisOrThatState {
    turn: number;
    answer: string | null;
    guess: string | null;
    showResult: boolean;
}

export interface HowWellDoYouKnowMeState {
    turn: number; // 0-9
    guess: string | null;
    judgement: 'correct' | 'incorrect' | null;
    phase: 'answering' | 'judging' | 'result';
}

export interface NitroRiderState {
    status: 'intro' | 'playing' | 'round-end' | 'finished';
    currentRace: number; // 1 to 3
    wins: { [playerId: number]: number };
    positions: { [playerId: number]: number }; // 0 to 100
    heats: { [playerId: number]: number }; // 0 to 100
    overheated: { [playerId: number]: boolean };
    roundWinner: 0 | 1 | null;
}


// The main game object stored in Firebase
export interface Game {
    id: string;
    players: [Player, Player];
    gameState: GameState;
    currentRound: GameRound;
    roundState: {
        thisOrThat: ThisOrThatState;
        howWellDoYouKnowMe: HowWellDoYouKnowMeState;
        nitroRider: NitroRiderState;
    }
}