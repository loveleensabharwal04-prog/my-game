import React, { useState, useEffect, useCallback } from 'react';
import { Game, GameState } from './types';
import { onGameUpdate } from './services/gameService';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import Card from './components/ui/Card';

// A simple component for the waiting screen, defined here to avoid creating new files.
const WaitingForPlayerScreen: React.FC<{ gameId: string }> = ({ gameId }) => (
  <Card>
    <div className="text-center p-4">
      <h2 className="text-2xl font-bold text-rose-600 mb-4">Waiting for your partner...</h2>
      <p className="text-gray-700 mb-4">Share this Game ID with them to join:</p>
      <div className="bg-rose-100 p-4 rounded-lg text-4xl font-mono tracking-widest text-rose-800">
        {gameId}
      </div>
      <p className="mt-4 text-sm text-gray-500">The game will start automatically when they join.</p>
    </div>
  </Card>
);

const App: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // As per guidelines, check for API Key on startup.
  useEffect(() => {
    if (!process.env.API_KEY) {
      setError("Configuration error: The app is missing a required API key and cannot start.");
    }
  }, []);

  useEffect(() => {
    if (!gameId) return;

    const unsubscribe = onGameUpdate(gameId, (updatedGame) => {
      setGame(updatedGame);
    });

    return () => unsubscribe();
  }, [gameId]);
  
  const handleJoinGame = useCallback((newGameId: string, newPlayerId: number) => {
    setGameId(newGameId.toUpperCase());
    setPlayerId(newPlayerId);
  }, []);

  const handleRestart = useCallback(() => {
    setGameId(null);
    setPlayerId(null);
    setGame(null);
  }, []);

  const renderContent = () => {
    if (error) {
      return <Card><p className="text-red-500 font-bold text-center p-4">{error}</p></Card>;
    }

    if (!gameId || playerId === null) {
      return <LobbyScreen onJoinGame={handleJoinGame} />;
    }

    if (!game) {
      return <Card><p className="text-center p-4">Loading game...</p></Card>;
    }

    switch (game.gameState) {
      case GameState.WaitingForPlayer:
        return <WaitingForPlayerScreen gameId={gameId} />;
      case GameState.Game:
        return <GameScreen game={game} currentPlayerId={playerId} />;
      case GameState.End:
        return <EndScreen players={game.players} onRestart={handleRestart} />;
      default:
        return <Card><p className="text-center p-4">An unknown error occurred.</p></Card>;
    }
  };

  return (
    <div className="bg-rose-100 min-h-screen font-sans p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-rose-800 drop-shadow-lg">
            Compatibility Challenge
          </h1>
          <p className="text-rose-600">How well do you know your partner?</p>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
