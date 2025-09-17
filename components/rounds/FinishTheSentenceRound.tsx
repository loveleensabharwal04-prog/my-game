import React, { useState } from 'react';
import { Game, GameRound } from '../../types';
import Button from '../ui/Button';
import { updateGame } from '../../services/gameService';
import Input from '../ui/Input';
import { useSound } from '../../contexts/SoundContext';

interface HowWellDoYouKnowMeRoundProps {
    game: Game;
    currentPlayerId: number;
}

const questions = [
    "Where did we first meet?",
    "What is my favorite car?",
    "When did we first meet? (date)",
    "Gym with me or go to cafes with me, which one would I prefer?",
    "What is my dream honeymoon destination?"
];
const TOTAL_TURNS = questions.length * 2;

const HowWellDoYouKnowMeRound: React.FC<HowWellDoYouKnowMeRoundProps> = ({ game, currentPlayerId }) => {
    const { playSound } = useSound();
    const { turn, guess, phase, judgement } = game.roundState.howWellDoYouKnowMe;
    const [myGuess, setMyGuess] = useState('');

    const askingPlayerIndex = turn % 2;
    const guessingPlayerIndex = (turn + 1) % 2;
    const questionIndex = Math.floor(turn / 2);

    const askingPlayer = game.players[askingPlayerIndex];
    const guessingPlayer = game.players[guessingPlayerIndex];
    
    // Personalize question
    const rawQuestion = questions[questionIndex];
    const currentQuestion = rawQuestion
        .replace('my', `${askingPlayer.name}'s`)
        .replace('I prefer', `${askingPlayer.name} prefer`);


    const isMyTurnToGuess = currentPlayerId === guessingPlayerIndex;
    const isMyTurnToAsk = currentPlayerId === askingPlayerIndex;

    const handleAnswerSubmit = () => {
        if (!myGuess.trim()) return;
        updateGame(game.id, {
            'roundState/howWellDoYouKnowMe/guess': myGuess.trim(),
            'roundState/howWellDoYouKnowMe/phase': 'judging',
        });
    };

    const handleJudgement = (judgement: 'correct' | 'incorrect') => {
        if (!isMyTurnToAsk) return;
        
        const updates: any = {
            'roundState/howWellDoYouKnowMe/judgement': judgement,
            'roundState/howWellDoYouKnowMe/phase': 'result'
        };

        if (judgement === 'correct') {
            playSound('correct');
            updates[`players/${guessingPlayerIndex}/score`] = game.players[guessingPlayerIndex].score + 20;
        }
        updateGame(game.id, updates);
    };

    const handleNext = () => {
        if (currentPlayerId !== 0) return; // Only player 0 can advance

        if (turn + 1 >= TOTAL_TURNS) {
            updateGame(game.id, { currentRound: GameRound.NitroRider });
        } else {
            setMyGuess('');
            updateGame(game.id, {
                'roundState/howWellDoYouKnowMe/turn': turn + 1,
                'roundState/howWellDoYouKnowMe/guess': null,
                'roundState/howWellDoYouKnowMe/judgement': null,
                'roundState/howWellDoYouKnowMe/phase': 'answering',
            });
        }
    };

    const renderContent = () => {
        if (phase === 'result') {
            const wasCorrect = judgement === 'correct';
            return (
                <div className="text-center space-y-4">
                    <h3 className={`text-3xl font-bold ${wasCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {wasCorrect ? 'Correct! (+20 pts)' : 'Incorrect!'}
                    </h3>
                    <p className="text-lg">The question was: "{currentQuestion}"</p>
                    <p className="text-lg">{guessingPlayer.name}'s answer was: <span className="font-bold text-rose-600">"{guess}"</span></p>
                    {currentPlayerId === 0 && (
                        <Button onClick={handleNext}>
                            {turn + 1 >= TOTAL_TURNS ? 'Next Round' : 'Next Question'}
                        </Button>
                    )}
                </div>
            );
        }

        if (phase === 'judging') {
            return (
                <div className="text-center space-y-4">
                    <p className="text-lg">The question was: "{currentQuestion}"</p>
                    <p className="text-xl">{guessingPlayer.name} answered: <br/> <span className="font-bold text-rose-700 text-2xl">"{guess}"</span></p>
                    {isMyTurnToAsk ? (
                        <>
                            <p className="font-semibold">Is this answer correct?</p>
                            <div className="flex justify-center gap-4">
                                <Button onClick={() => handleJudgement('correct')} className="bg-green-500 hover:bg-green-600">✅ Correct</Button>
                                <Button onClick={() => handleJudgement('incorrect')} className="bg-red-500 hover:bg-red-600">❌ Incorrect</Button>
                            </div>
                        </>
                    ) : (
                        <p className="text-gray-600">Waiting for {askingPlayer.name} to judge the answer...</p>
                    )}
                </div>
            );
        }

        // Answering phase
        return (
            <div className="space-y-4">
                <h3 className="text-center text-2xl font-bold text-rose-700 mb-4">{currentQuestion}</h3>
                {isMyTurnToGuess ? (
                    <>
                        <Input
                            type="text"
                            placeholder={`Your answer about ${askingPlayer.name}...`}
                            value={myGuess}
                            onChange={(e) => setMyGuess(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAnswerSubmit()}
                        />
                        <Button onClick={handleAnswerSubmit} disabled={!myGuess.trim()} className="w-full">
                            Submit Answer
                        </Button>
                    </>
                ) : (
                    <p className="text-center text-gray-600">Waiting for {guessingPlayer.name} to answer...</p>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 bg-rose-50 rounded-xl animate-fade-in">
            <h2 className="text-center text-2xl font-bold text-rose-500 mb-2">Round 2: How Well Do You Know Me?</h2>
            <p className="text-center text-gray-500 mb-4">Turn {turn + 1}/{TOTAL_TURNS}</p>
            {renderContent()}
        </div>
    );
};

export default HowWellDoYouKnowMeRound;