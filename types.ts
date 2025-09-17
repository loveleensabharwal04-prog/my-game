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
    PixelJumper
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

export interface PlayerPhysicsState {
    y: number; // Vertical position from the ground
    isAlive: boolean;
}

export interface Obstacle {
    x: number; // position along the track
    height: number;
}

export interface PixelJumperState {
    status: 'intro' | 'playing' | 'round-end' | 'finished';
    currentRace: number; // 1 to 3
    wins: { [playerId: number]: number };
    lives: { [playerId: number]: number };
    playerStates: { [playerId: number]: PlayerPhysicsState };
    distance: number;
    obstacles: Obstacle[];
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
        pixelJumper: PixelJumperState;
    }
}
