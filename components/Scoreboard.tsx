
import React from 'react';
import { Player } from '../types';

interface ScoreboardProps {
    players: [Player, Player];
}

const Scoreboard: React.FC<ScoreboardProps> = ({ players }) => {
    return (
        <div className="flex justify-around items-center bg-rose-100 p-4 rounded-xl shadow-inner">
            <div className="text-center">
                <div className="text-lg font-bold text-rose-600">{players[0].name}</div>
                <div className="text-2xl font-black text-rose-800">{players[0].score}</div>
            </div>
            <div className="text-4xl text-rose-400">💖</div>
            <div className="text-center">
                <div className="text-lg font-bold text-rose-600">{players[1].name}</div>
                <div className="text-2xl font-black text-rose-800">{players[1].score}</div>
            </div>
        </div>
    );
}

export default Scoreboard;
