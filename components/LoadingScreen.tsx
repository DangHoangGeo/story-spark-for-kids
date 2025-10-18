import React, { useState, useEffect } from 'react';

const messages = [
  "Dreaming up a wonderful tale...",
  "Gathering stardust and moonbeams...",
  "Painting the pictures with magic colors...",
  "Warming up our storytelling voice...",
  "Unfolding the adventure map...",
  "Your 1-minute story is almost ready!"
];

const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 2500); // Synced with animation speed

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="relative w-[60px] h-[80px] mb-8 book">
          <div className="book__pg-shadow"></div>
          <div className="book__pg"></div>
          <div className="book__pg book__pg--2"></div>
          <div className="book__pg book__pg--3"></div>
          <div className="book__pg book__pg--4"></div>
          <div className="book__pg book__pg--5"></div>
      </div>
      <h2 className="text-2xl font-semibold text-amber-600">{messages[messageIndex]}</h2>
    </div>
  );
};

export default LoadingScreen;