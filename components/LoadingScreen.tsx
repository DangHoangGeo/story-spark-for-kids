import React from 'react';

const defaultMessages = [
  "Dreaming up a wonderful tale...",
  "Gathering stardust and moonbeams...",
  "Painting with magic colors...",
  "Warming up our storytelling voice...",
  "Unfolding the adventure map...",
];

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const displayMessage = message || defaultMessages[Math.floor(Math.random() * defaultMessages.length)];

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
      <div className="relative w-[60px] h-[80px] mb-8 book">
          <div className="book__pg-shadow"></div>
          <div className="book__pg"></div>
          <div className="book__pg book__pg--2"></div>
          <div className="book__pg book__pg--3"></div>
          <div className="book__pg book__pg--4"></div>
          <div className="book__pg book__pg--5"></div>
      </div>
      <h2 className="text-2xl font-semibold text-amber-600 transition-all duration-500">{displayMessage}</h2>
    </div>
  );
};

export default LoadingScreen;