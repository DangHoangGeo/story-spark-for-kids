import React, { useState, useEffect } from 'react';
import { SequencingGameData } from '../types';
import Celebration from './Celebration';

// A simple but effective shuffle utility
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

interface SequencingGameScreenProps {
  game: SequencingGameData;
  onFinish: () => void;
}

const SequencingGameScreen: React.FC<SequencingGameScreenProps> = ({ game, onFinish }) => {
  const [userOrder, setUserOrder] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setUserOrder(shuffleArray([...game.events]));
  }, [game.events]);

  const handleDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (index !== dropTargetIndex) {
        setDropTargetIndex(index);
    }
  };
  
  const handleDragLeave = () => {
    setDropTargetIndex(null);
  }

  const handleDrop = (dropIndex: number) => {
    if (draggedItemIndex === null || draggedItemIndex === dropIndex) {
      setDraggedItemIndex(null);
      setDropTargetIndex(null);
      return;
    }

    const newUserOrder = [...userOrder];
    const draggedItem = newUserOrder.splice(draggedItemIndex, 1)[0];
    newUserOrder.splice(dropIndex, 0, draggedItem);
    
    setUserOrder(newUserOrder);
    setDraggedItemIndex(null);
    setDropTargetIndex(null);
  };

  const handleCheckAnswer = () => {
    if (isAnswered) return;
    const correct = userOrder.join('') === game.events.join('');
    setIsCorrect(correct);
    setIsAnswered(true);
  };

  const getBorderClass = () => {
    if (!isAnswered) return "border-gray-300";
    return isCorrect ? "border-green-500" : "border-red-500";
  };
  
  return (
    <div className="w-full max-w-2xl text-center p-8 bg-white rounded-2xl shadow-lg relative animate-fade-in">
        {isCorrect && <Celebration emojis={['✅', '👍', '📚', '⭐']} />}
        <h2 className="text-3xl font-bold text-amber-600 mb-2">Story Sequence</h2>
        <p className="text-lg text-gray-600 mb-8">Can you put the story back in order? Drag and drop the events!</p>
        
        <div className={`space-y-3 border-2 ${getBorderClass()} p-4 rounded-lg transition-colors`}>
            {userOrder.map((event, index) => (
                <div 
                    key={event + index}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={() => handleDrop(index)}
                >
                    {dropTargetIndex === index && (
                       <div className="h-2 bg-amber-200 rounded-full my-1 transition-all"></div>
                    )}
                    <div
                        draggable={!isAnswered}
                        onDragStart={() => handleDragStart(index)}
                        className={`w-full p-4 rounded-lg text-lg font-semibold transition-all duration-300 cursor-grab active:cursor-grabbing ${isAnswered ? 'bg-gray-200 text-gray-500' : 'bg-white shadow-sm hover:bg-amber-50'} ${draggedItemIndex === index ? 'opacity-50' : 'opacity-100'}`}
                    >
                        {event}
                    </div>
                </div>
            ))}
            {dropTargetIndex === userOrder.length && (
                 <div className="h-2 bg-amber-200 rounded-full my-1 transition-all"></div>
            )}
        </div>

        {!isAnswered && (
            <button
                onClick={handleCheckAnswer}
                className="mt-8 px-8 py-3 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition-transform transform hover:scale-105"
            >
                Check My Answer
            </button>
        )}

        {isAnswered && (
            <div className="mt-8 animate-fade-in">
                <p className="text-2xl font-bold mb-4">
                    {isCorrect ? 'Perfect! You remembered the story so well!' : 'Not quite! That was a tricky one.'}
                </p>
                <button
                    onClick={onFinish}
                    className="px-8 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-transform transform hover:scale-105"
                >
                    Finish & Share Your Story!
                </button>
            </div>
        )}
    </div>
  );
};

export default SequencingGameScreen;