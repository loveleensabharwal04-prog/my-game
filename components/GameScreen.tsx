import React from 'react';
import { Game, GameRound } from '../types.ts';
import ThisOrThatRound from './rounds/ThisOrThatRound.tsx';
import HowWellDoYouKnowMeRound from './rounds/FinishTheSentenceRound.tsx';
import PixelJumperRound from './rounds/NitroRiderRound.tsx';
import Scoreboard from './Scoreboard.tsx';
import { updateGame } from '../services/gameService.ts';

interface GameScreenProps {
  game: Game;
  currentPlayerId: number;
}

const GameScreen: React.FC<GameScreenProps> = ({ game, currentPlayerId }) => {

  const renderRound = () => {
    switch (game.currentRound) {
      case GameRound.ThisOrThat:
        return (
          <ThisOrThatRound
            game={game}
            currentPlayerId={currentPlayerId}
          />
        );
      case GameRound.HowWellDoYouKnowMe:
        return (
          <HowWellDoYouKnowMeRound
            game={game}
            currentPlayerId={currentPlayerId}
          />
        );
      case GameRound.PixelJumper:
        return (
            <PixelJumperRound
                game={game}
                currentPlayerId={currentPlayerId}
            />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
        <Scoreboard players={game.players} />
        {renderRound()}
    </div>
  );
};

export default GameScreen;
