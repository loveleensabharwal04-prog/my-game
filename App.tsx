import React, { useState, useEffect } from 'react';
import LobbyScreen from './components/LobbyScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import { Game, GameState } from './types';
import { onGameUpdate } from './services/gameService';
import { firebaseInitialized } from './services/firebase';
import { useSound } from './contexts/SoundContext';

const FirebaseConfigGuide = () => (
  <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-lg max-w-3xl mx-auto my-10 animate-fade-in">
    <h2 className="font-bold text-2xl mb-3">Firebase Configuration Missing</h2>
    <p className="mb-4">
      This online multiplayer game requires a Firebase backend to function. Please follow these steps to set it up (it's free!):
    </p>
    <ol className="list-decimal list-inside mt-2 space-y-2 text-left">
      <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-red-900">Firebase Console</a> and create a new project.</li>
      <li>From your project dashboard, go to <strong>Build &gt; Realtime Database</strong>. Click "Create database" and start it in <strong>test mode</strong>.</li>
      <li>Go back to your project dashboard, click the <strong>gear icon ⚙️ &gt; Project settings</strong>.</li>
      <li>In the "Your apps" section, click the web icon ( <strong>&lt;/&gt;</strong> ) to register a new web app.</li>
      <li>After registering, Firebase will give you a `firebaseConfig` object. Click "Copy".</li>
      <li>Open the file <code className="bg-red-200 p-1 rounded font-mono">services/firebase.ts</code> in the code editor.</li>
      <li>Paste your copied config object into the `firebaseConfig` variable as instructed in the file. The app will then reload and work correctly.</li>
    </ol>
  </div>
);


const App: React.FC = () => {
  const [gameId, setGameId] = useState<string | null>(localStorage.getItem('gameId'));
  const [playerId, setPlayerId] = useState<number | null>(() => {
      const stored = localStorage.getItem('playerId');
      return stored ? parseInt(stored, 10) : null;
  });
  const [game, setGame] = useState<Game | null>(null);
  const { isMuted, toggleMute } = useSound();

  useEffect(() => {
    if (gameId && firebaseInitialized) {
      const unsubscribe = onGameUpdate(gameId, (newGame) => {
        setGame(newGame);
      });
      return () => unsubscribe();
    }
  }, [gameId]);

  const handleJoinGame = (newGameId: string, newPlayerId: number) => {
    localStorage.setItem('gameId', newGameId);
    localStorage.setItem('playerId', newPlayerId.toString());
    setGameId(newGameId);
    setPlayerId(newPlayerId);
  };
  
  const handleLeaveGame = () => {
    localStorage.removeItem('gameId');
    localStorage.removeItem('playerId');
    setGameId(null);
    setPlayerId(null);
    setGame(null);
  };
  
  const renderContent = () => {
    if (!gameId || !game) {
      return <LobbyScreen onJoinGame={handleJoinGame} />;
    }
    
    switch (game.gameState) {
      case GameState.WaitingForPlayer:
        return (
          <div className="text-center p-8 space-y-4">
              <h2 className="text-2xl font-bold text-rose-600">Waiting for your friend...</h2>
              <p className="text-gray-600">Share this Game ID with them:</p>
              <div className="bg-rose-100 text-rose-800 font-mono text-2xl p-4 rounded-lg tracking-widest cursor-pointer" onClick={() => navigator.clipboard.writeText(gameId)}>
                  {gameId}
              </div>
              <p className="text-sm text-gray-500">(Click to copy)</p>
          </div>
        )
      case GameState.Game:
        if (playerId === null) return <div>Error: Player not identified.</div>;
        return <GameScreen game={game} currentPlayerId={playerId} />;
      case GameState.End:
        return <EndScreen players={game.players} onRestart={handleLeaveGame} />;
      default:
        return <LobbyScreen onJoinGame={handleJoinGame} />;
    }
  };
  
  const renderApp = () => {
    if (!firebaseInitialized) {
      return <FirebaseConfigGuide />;
    }
    return (
       <>
        <main className="bg-white/70 backdrop-blur-lg rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-500">
            {renderContent()}
        </main>
         {gameId && (
            <div className="text-center mt-4">
              <button onClick={handleLeaveGame} className="text-rose-400 hover:text-rose-600 text-sm">Leave Game</button>
            </div>
          )}
      </>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-rose-200 min-h-screen text-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-lg mx-auto relative">
        <button 
          onClick={toggleMute}
          className="absolute top-0 right-0 mt-2 mr-2 p-2 rounded-full bg-white/50 hover:bg-white/80 transition-colors"
          aria-label={isMuted ? 'Unmute sounds' : 'Mute sounds'}
        >
          {isMuted ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707a1 1 0 011.414 0v14.142a1 1 0 01-1.414 0L5.586 15z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M1 1l22 22" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M19 4.01C19 3.453 18.547 3 18 3s-1 .453-1 1.01V20.99c0 .557.453 1.01 1 1.01s1-.453 1-1.01V4.01zM11.586 15H10a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707a1 1 0 011.414 0v14.142a1 1 0 01-1.414 0L11.586 15z" />
            </svg>
          )}
        </button>

        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-rose-500">Compatibility Challenge</h1>
            <p className="text-rose-400 mt-2">How well do you know your friend?</p>
        </div>
        {renderApp()}
      </div>
    </div>
  );
};

export default App;