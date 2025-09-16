import React, { useMemo } from 'react';
import { Game, GameRound, GameState } from '../../types';
import Button from '../ui/Button';
import { updateGame } from '../../services/gameService';
import { useSound } from '../../contexts/SoundContext';

interface ThisOrThatRoundProps {
  game: Game;
  currentPlayerId: number;
}

const questions = [
  { option1: 'Coffee', option2: 'Tea' },
  { option1: 'Mountains', option2: 'Beach' },
  { option1: 'Movie Night In', option2: 'Night Out' },
  { option1: 'Sweet', option2: 'Salty' },
  { option1: 'Early Bird', option2: 'Night Owl' },
];
const TOTAL_QUESTIONS_PER_PLAYER = questions.length;
const TOTAL_TURNS = TOTAL_QUESTIONS_PER_PLAYER * 2;

const ThisOrThatRound: React.FC<ThisOrThatRoundProps> = ({ game, currentPlayerId }) => {
  const { playSound } = useSound();
  const { turn, answer, guess, showResult } = game.roundState.thisOrThat;

  const answeringPlayerIndex = useMemo(() => Math.floor(turn / TOTAL_QUESTIONS_PER_PLAYER) % 2, [turn]);
  const guessingPlayerIndex = useMemo(() => (answeringPlayerIndex + 1) % 2, [answeringPlayerIndex]);
  const currentQuestionIndex = useMemo(() => turn % TOTAL_QUESTIONS_PER_PLAYER, [turn]);

  const answeringPlayer = game.players[answeringPlayerIndex];
  const guessingPlayer = game.players[guessingPlayerIndex];
  const question = questions[currentQuestionIndex];
  
  const isMyTurnToAnswer = currentPlayerId === answeringPlayerIndex;
  const isMyTurnToGuess = currentPlayerId === guessingPlayerIndex;

  const handleAnswer = (selectedOption: string) => {
    if (!isMyTurnToAnswer) return;
    updateGame(game.id, { 'roundState/thisOrThat/answer': selectedOption });
  };

  const handleGuess = (selectedOption: string) => {
    if (!isMyTurnToGuess) return;
    
    const updates: any = {
      'roundState/thisOrThat/guess': selectedOption,
      'roundState/thisOrThat/showResult': true,
    };

    if (selectedOption === answer) {
        playSound('correct');
        const newScore = game.players[guessingPlayerIndex].score + 10;
        updates[`players/${guessingPlayerIndex}/score`] = newScore;
    }
    updateGame(game.id, updates);
  };

  const handleNext = () => {
    // Only player 0 can advance the game state to avoid race conditions
    if (currentPlayerId !== 0) return;

    if (turn + 1 >= TOTAL_TURNS) {
      // FIX: Corrected the next round to GameRound.MindMeld, as GameRound.FinishTheSentence does not exist.
      updateGame(game.id, { currentRound: GameRound.MindMeld });
    } else {
      updateGame(game.id, { 
          'roundState/thisOrThat/turn': turn + 1,
          'roundState/thisOrThat/answer': null,
          'roundState/thisOrThat/guess': null,
          'roundState/thisOrThat/showResult': false
       });
    }
  };
  
  const renderPhase = () => {
    if (showResult) {
      const isCorrect = answer === guess;
      return (
        <div className="text-center space-y-4">
          <h3 className={`text-3xl font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? 'Correct!' : 'Oops!'}
          </h3>
          <p className="text-lg">{answeringPlayer.name}'s choice was <span className="font-bold">{answer}</span>.</p>
          <p className="text-gray-600 text-sm">Waiting for {game.players[0].name} to continue...</p>
          {currentPlayerId === 0 && (
             <Button onClick={handleNext}>
                {turn + 1 >= TOTAL_TURNS ? 'Next Round' : 'Next Question'}
             </Button>
          )}
        </div>
      );
    }

    if (!answer) { // Answering Phase
      return (
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">{isMyTurnToAnswer ? "Your turn!" : `Waiting for ${answeringPlayer.name}...`}</p>
          <p className="text-lg">{answeringPlayer.name}, make your choice secretly!</p>
          <h2 className="text-3xl font-bold text-rose-700">{question.option1} or {question.option2}?</h2>
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={() => handleAnswer(question.option1)} variant="secondary" disabled={!isMyTurnToAnswer}>{question.option1}</Button>
            <Button onClick={() => handleAnswer(question.option2)} variant="secondary" disabled={!isMyTurnToAnswer}>{question.option2}</Button>
          </div>
        </div>
      );
    } else { // Guessing Phase
      return (
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">{isMyTurnToGuess ? "Your turn to guess!" : `Waiting for ${guessingPlayer.name}...`}</p>
          <p className="text-lg">{guessingPlayer.name}, what did {answeringPlayer.name} choose?</p>
          <h2 className="text-3xl font-bold text-rose-700">{question.option1} or {question.option2}?</h2>
           <div className="flex justify-center gap-4 pt-4">
            <Button onClick={() => handleGuess(question.option1)} disabled={!isMyTurnToGuess}>{question.option1}</Button>
            <Button onClick={() => handleGuess(question.option2)} disabled={!isMyTurnToGuess}>{question.option2}</Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="p-4 bg-rose-50 rounded-xl animate-fade-in">
        <h2 className="text-center text-2xl font-bold text-rose-500 mb-2">Round 1: This or That?</h2>
        {renderPhase()}
    </div>
  );
};

export default ThisOrThatRound;
