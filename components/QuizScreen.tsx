import React, { useState } from 'react';
import { QuizData, StoryData } from '../types';
import { exportStoryAsJson } from '../utils/exportUtils';

interface QuizScreenProps {
  quiz: QuizData;
  story: StoryData;
  onFinish: () => void;
}

const Celebration: React.FC = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => {
            const style = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `scale(${Math.random() * 0.8 + 0.5})`,
            };
            const emoji = ['✨', '🎉', '🎈', '⭐'][Math.floor(Math.random() * 4)];
            return <div key={i} className="sparkle-emoji" style={style}>{emoji}</div>;
        })}
    </div>
);

const QuizScreen: React.FC<QuizScreenProps> = ({ quiz, story, onFinish }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
  };
  
  const handleSave = () => {
    exportStoryAsJson(story);
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return "bg-white hover:bg-amber-100";
    }
    if (index === quiz.correctAnswerIndex) {
      return "bg-green-500 text-white";
    }
    if (index === selectedAnswer) {
      return "bg-red-500 text-white";
    }
    return "bg-gray-200 text-gray-500";
  };
  
  return (
    <div className="w-full max-w-2xl text-center p-8 bg-white rounded-2xl shadow-lg relative">
      {isAnswered && selectedAnswer === quiz.correctAnswerIndex && <Celebration />}
      <h2 className="text-3xl font-bold text-amber-600 mb-6">Quiz Time!</h2>
      <p className="text-xl text-gray-700 mb-8">{quiz.question}</p>
      <div className="space-y-4">
        {quiz.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={isAnswered}
            className={`w-full p-4 rounded-lg text-lg font-semibold transition-all duration-300 ${getButtonClass(index)}`}
          >
            {option}
          </button>
        ))}
      </div>
      {isAnswered && (
        <div className="mt-8 animate-fade-in">
            <p className="text-2xl font-bold mb-4">
                {selectedAnswer === quiz.correctAnswerIndex ? '🎉 You got it! Well done! 🎉' : 'Oops! Good try!'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                    onClick={handleSave}
                    className="px-8 py-3 bg-gray-500 text-white font-bold rounded-full hover:bg-gray-600 transition-transform transform hover:scale-105"
                >
                    Save Story
                </button>
                <button
                    onClick={onFinish}
                    className="px-8 py-3 bg-amber-500 text-white font-bold rounded-full hover:bg-amber-600 transition-transform transform hover:scale-105"
                >
                    Share Your Story!
                </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizScreen;