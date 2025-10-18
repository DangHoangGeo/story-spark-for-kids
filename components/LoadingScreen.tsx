
import React, { useState, useEffect } from 'react';

const messages = [
  "Dreaming up a wonderful tale...",
  "Gathering stardust and moonbeams...",
  "Painting the pictures with magic colors...",
  "Warming up our storytelling voice...",
  "Unfolding the adventure map...",
  "Your story is almost ready!"
];

const LoadingScreen: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 border-4 border-t-amber-500 border-gray-200 rounded-full animate-spin mb-6"></div>
      <h2 className="text-2xl font-semibold text-amber-600">{messages[messageIndex]}</h2>
    </div>
  );
};

export default LoadingScreen;
