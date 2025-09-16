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
    MindMeld,
    DareOrTruth
}

// State for each round
export interface ThisOrThatState {
    turn: number;
    answer: string | null;
    guess: string | null;
    showResult: boolean;
}

export interface MindMeldState {
    promptIndex: number;
    answers: { [playerId: number]: string };
    showResult: boolean;
}

export interface DareOrTruthState {
    turn: number; // 0 or 1 to decide who chooses
    choice: 'dare' | 'truth' | null;
    content: string;
    isLoading: boolean;
}

// The main game object stored in Firebase
export interface Game {
    id: string;
    players: [Player, Player];
    gameState: GameState;
    currentRound: GameRound;
    roundState: {
        thisOrThat: ThisOrThatState;
        mindMeld: MindMeldState;
        dareOrTruth: DareOrTruthState;
    }
}