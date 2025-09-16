import React, { useEffect } from 'react';
import { Player } from '../types';
import Button from './ui/Button';
import Card from './ui/Card';
import { useSound } from '../contexts/SoundContext';

interface EndScreenProps {
  players: [Player, Player];
  onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ players, onRestart }) => {
  const { playSound } = useSound();
  // Sort players by score to determine winner and loser
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isTie = players[0].score === players[1].score;

  useEffect(() => {
    playSound('celebrate');
  }, [playSound]);


  return (
    <div className="text-center animate-fade-in">
      <Card>
        <h2 className="text-4xl font-bold text-rose-600 mb-4">Game Over!</h2>
        {isTie ? (
           <p className="text-xl text-gray-700 mb-6">It's a tie! You both know each other so well!</p>
        ) : (
          <p className="text-xl text-gray-700 mb-6">Congratulations, <span className="font-bold text-rose-500">{winner.name}</span>! You're the winner!</p>
        )}
        
        <div className="space-y-4 my-8">
            <div className="text-left bg-rose-50 p-4 rounded-lg">
                <p className="text-lg"><strong className="text-rose-600">{players[0].name}'s Score:</strong> {players[0].score}</p>
            </div>
            <div className="text-left bg-rose-50 p-4 rounded-lg">
                <p className="text-lg"><strong className="text-rose-600">{players[1].name}'s Score:</strong> {players[1].score}</p>
            </div>
        </div>

        <Button onClick={onRestart} className="w-full">
          Play Again
        </Button>
      </Card>
    </div>
  );
};

export default EndScreen;
