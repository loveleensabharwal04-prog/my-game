import React from 'react';
import { Game, GameRound } from '../types';
import ThisOrThatRound from './rounds/ThisOrThatRound';
import HowWellDoYouKnowMeRound from './rounds/FinishTheSentenceRound';
import NitroRiderRound from './rounds/NitroRiderRound';
import Scoreboard from './Scoreboard';
import { updateGame } from '../services/gameService';

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
      case GameRound.NitroRider:
        return (
            <NitroRiderRound
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