import React, { useState } from 'react';
import Button from './ui/Button.tsx';
import Input from './ui/Input.tsx';
import Card from './ui/Card.tsx';
import { createGame, joinGame } from '../services/gameService.ts';

interface LobbyScreenProps {
  onJoinGame: (gameId: string, playerId: number) => void;
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({ onJoinGame }) => {
  const [playerName, setPlayerName] = useState('');
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
        setError('Please enter your name.');
        return;
    }
    setIsLoading(true);
    setError('');
    try {
        const { gameId, playerId } = await createGame(playerName.trim());
        onJoinGame(gameId, playerId);
    } catch (e) {
        setError('Could not create game. Please try again.');
        setIsLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameIdToJoin.trim()) {
        setError('Please enter your name and a Game ID.');
        return;
    }
    setIsLoading(true);
    setError('');
    try {
        const result = await joinGame(gameIdToJoin.trim().toUpperCase(), playerName.trim());
        if(result.success && result.playerId !== undefined) {
            onJoinGame(gameIdToJoin.trim().toUpperCase(), result.playerId);
        } else {
            setError(result.message || 'Could not join game.');
            setIsLoading(false);
        }
    } catch (e) {
        setError('Could not join game. Please try again.');
        setIsLoading(false);
    }
  };
  
  return (
    <div className="text-center animate-fade-in">
      <Card>
        <h2 className="text-3xl font-bold text-rose-600 mb-6">Welcome, Buddies!</h2>
        <div className="space-y-4">
           <Input 
            type="text" 
            placeholder="Enter Your Name" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            aria-label="Your Name"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {!isJoining ? (
            <div className="mt-6 space-y-4">
                <Button onClick={handleCreateGame} disabled={isLoading || !playerName.trim()} className="w-full">
                    {isLoading ? 'Creating...' : 'Create New Game'}
                </Button>
                <Button onClick={() => setIsJoining(true)} variant="ghost" className="w-full">
                    Join a Game
                </Button>
            </div>
        ) : (
             <div className="mt-6 space-y-4">
                <Input 
                    type="text" 
                    placeholder="Enter Game ID" 
                    value={gameIdToJoin}
                    onChange={(e) => setGameIdToJoin(e.target.value)}
                    aria-label="Game ID"
                    maxLength={4}
                    style={{textTransform: 'uppercase'}}
                />
                 <Button onClick={handleJoinGame} disabled={isLoading || !playerName.trim() || !gameIdToJoin.trim()} className="w-full">
                    {isLoading ? 'Joining...' : 'Join Game'}
                </Button>
                <Button onClick={() => setIsJoining(false)} variant="ghost" className="w-full">
                    Back
                </Button>
            </div>
        )}
      </Card>
    </div>
  );
};

export default LobbyScreen;