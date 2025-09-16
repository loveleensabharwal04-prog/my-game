import React from 'react';
import Button from '../ui/Button';
import { generateDare, generateTruth } from '../../services/geminiService';
import Card from '../ui/Card';
import { Game, GameRound, GameState } from '../../types';
import { updateGame } from '../../services/gameService';

interface DareOrTruthRoundProps {
    game: Game;
    currentPlayerId: number;
}

const MAX_TASKS = 3;

const DareOrTruthRound: React.FC<DareOrTruthRoundProps> = ({ game, currentPlayerId }) => {
    const { turn, choice, content, isLoading } = game.roundState.dareOrTruth;
    
    const activePlayerIndex = turn % 2;
    const isMyTurn = currentPlayerId === activePlayerIndex;

    const handleChoice = async (selectedChoice: 'dare' | 'truth') => {
        if (!isMyTurn) return;
        
        await updateGame(game.id, {
            'roundState/dareOrTruth/choice': selectedChoice,
            'roundState/dareOrTruth/isLoading': true,
            'roundState/dareOrTruth/content': '',
        });

        const newContent = selectedChoice === 'dare' ? await generateDare() : await generateTruth();
        
        await updateGame(game.id, {
            'roundState/dareOrTruth/content': newContent,
            'roundState/dareOrTruth/isLoading': false,
        });
    };
    
    const handleNext = () => {
        // Only the active player can advance
        if (!isMyTurn) return;

        const nextTask = turn + 1;
        if(nextTask >= MAX_TASKS) {
            updateGame(game.id, { gameState: GameState.End });
        } else {
            updateGame(game.id, {
                'roundState/dareOrTruth/turn': nextTask,
                'roundState/dareOrTruth/choice': null,
                'roundState/dareOrTruth/content': '',
            });
        }
    }

    const renderContent = () => {
        if (isLoading) {
            return <div className="text-center p-8 text-rose-500 animate-pulse">Generating a good one...</div>;
        }
        if (content) {
            return (
                <div className="text-center space-y-6 animate-fade-in">
                    <Card className="bg-rose-100">
                        <h3 className="text-2xl font-bold capitalize text-rose-600">{choice} for {game.players[activePlayerIndex].name}</h3>
                        <p className="mt-4 text-lg text-gray-700">{content}</p>
                    </Card>
                    {isMyTurn && (
                      <Button onClick={handleNext}>
                          {turn + 1 >= MAX_TASKS ? 'Finish Game' : 'Done! Next...'}
                      </Button>
                    )}
                    {!isMyTurn && (
                        <p className="text-sm text-gray-500 mt-4">Waiting for {game.players[activePlayerIndex].name} to finish...</p>
                    )}
                </div>
            );
        }
        return (
            <div className="text-center space-y-4">
                <p className="text-lg font-semibold text-gray-700">
                    {isMyTurn ? "Your turn!" : `Waiting for ${game.players[activePlayerIndex].name}...`}
                </p>
                <p>{game.players[activePlayerIndex].name}, choose your fate!</p>
                <div className="flex justify-center gap-4 pt-4">
                    <Button onClick={() => handleChoice('truth')} variant="secondary" disabled={!isMyTurn}>Truth</Button>
                    <Button onClick={() => handleChoice('dare')} disabled={!isMyTurn}>Dare</Button>
                </div>
            </div>
        );
    };


    return (
        <div className="p-4 bg-rose-50 rounded-xl space-y-4 animate-fade-in">
            <h2 className="text-center text-2xl font-bold text-rose-500 mb-2">Final Round: Dare or Truth?</h2>
            {renderContent()}
        </div>
    );
};

export default DareOrTruthRound;