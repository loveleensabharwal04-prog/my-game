import React, { useState, useEffect } from 'react';
import { Game, GameRound } from '../../types';
import Button from '../ui/Button';
import { updateGame } from '../../services/gameService';
import Input from '../ui/Input';
import { useSound } from '../../contexts/SoundContext';

interface MindMeldRoundProps {
    game: Game;
    currentPlayerId: number;
}

const prompts = [
    "A pizza topping",
    "A type of fruit",
    "A color in the rainbow",
    "Something you find at the beach",
    "A popular movie superhero",
    "A farm animal"
];

const MindMeldRound: React.FC<MindMeldRoundProps> = ({ game, currentPlayerId }) => {
    const { playSound } = useSound();
    const { promptIndex, answers, showResult } = game.roundState.mindMeld;
    const [myAnswer, setMyAnswer] = useState(answers?.[currentPlayerId] || '');
    
    const currentPrompt = prompts[promptIndex];
    const player1Answer = answers?.[0]?.trim().toLowerCase() || '';
    const player2Answer = answers?.[1]?.trim().toLowerCase() || '';
    
    useEffect(() => {
        // Reset local answer when prompt changes
        setMyAnswer(answers?.[currentPlayerId] || '');
    }, [promptIndex, currentPlayerId, answers]);
    
    const handleAnswerSubmit = () => {
        if (!myAnswer.trim()) return;
        updateGame(game.id, { [`roundState/mindMeld/answers/${currentPlayerId}`]: myAnswer.trim() });
    }

    const handleNext = () => {
        if (currentPlayerId !== 0) return; // Only player 0 can advance

        if (promptIndex + 1 >= prompts.length) {
            updateGame(game.id, { currentRound: GameRound.DareOrTruth });
        } else {
            updateGame(game.id, {
                'roundState/mindMeld/promptIndex': promptIndex + 1,
                'roundState/mindMeld/answers': {},
                'roundState/mindMeld/showResult': false,
            });
        }
    };
    
    const bothPlayersAnswered = !!(answers?.[0] && answers?.[1]);
    const isMatch = bothPlayersAnswered && player1Answer === player2Answer;

    // Automatically show results when both players have answered.
    useEffect(() => {
        if (bothPlayersAnswered && !showResult && currentPlayerId === 0) {
            const updates: any = { 'roundState/mindMeld/showResult': true };
            if (isMatch) {
                playSound('correct');
                updates['players/0/score'] = game.players[0].score + 20;
                updates['players/1/score'] = game.players[1].score + 20;
            }
            updateGame(game.id, updates);
        }
    }, [bothPlayersAnswered, showResult, currentPlayerId, game.id, isMatch, game.players, playSound]);


    if (showResult) {
        return (
             <div className="p-4 bg-rose-50 rounded-xl text-center space-y-4 animate-fade-in">
                <h3 className={`text-3xl font-bold ${isMatch ? 'text-green-500' : 'text-orange-500'}`}>
                    {isMatch ? "It's a Mind Meld!" : "No Match!"}
                </h3>
                <div className="space-y-3 text-left bg-white p-4 rounded-lg">
                    <p><strong className="text-rose-600">{game.players[0].name} wrote:</strong> {answers[0]}</p>
                    <p><strong className="text-rose-600">{game.players[1].name} wrote:</strong> {answers[1]}</p>
                </div>
                 {currentPlayerId === 0 && (
                    <Button onClick={handleNext}>
                        {promptIndex + 1 >= prompts.length ? 'Next Round' : 'Next Prompt'}
                    </Button>
                 )}
                 {currentPlayerId !== 0 && (
                    <p className="text-gray-600 text-sm">Waiting for {game.players[0].name} to continue...</p>
                 )}
             </div>
        )
    }

    const iHaveAnswered = !!answers?.[currentPlayerId];

    return (
        <div className="p-4 bg-rose-50 rounded-xl space-y-6 animate-fade-in">
            <h2 className="text-center text-2xl font-bold text-rose-500 mb-2">Round 2: Mind Meld</h2>
            <p className="text-center text-lg font-semibold text-gray-700">Category: <span className="text-rose-600">{currentPrompt}</span></p>

            {iHaveAnswered ? (
                <div className="text-center text-gray-600 py-8">
                    <p className="font-semibold text-lg">Your answer is locked in!</p>
                    <p>Waiting for {game.players[(currentPlayerId + 1) % 2].name}...</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <Input 
                        id="player_answer" 
                        value={myAnswer} 
                        onChange={(e) => setMyAnswer(e.target.value)} 
                        placeholder="Type your word here..."
                        aria-label="Your answer"
                    />
                    <Button onClick={handleAnswerSubmit} disabled={!myAnswer.trim()} className="w-full">
                        Lock in Answer
                    </Button>
                </div>
            )}
        </div>
    );
};

export default MindMeldRound;