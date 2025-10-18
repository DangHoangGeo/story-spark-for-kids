import React, { useState } from 'react';

interface LandingScreenProps {
  onCreateStory: (prompt: string) => void;
  error: string | null;
  onBack: () => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onCreateStory, error, onBack }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onCreateStory(prompt.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl text-center p-8 bg-white rounded-2xl shadow-lg animate-fade-in">
       <button onClick={onBack} className="text-sm text-amber-600 hover:underline mb-4">&larr; Back to Explore</button>
      <h1 className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">Story Spark</h1>
      <p className="text-lg text-gray-600 mb-8">Let's create a magical story together!</p>
      <form onSubmit={handleSubmit} className="flex flex-col items-center">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A story about a curious little fox named Finn..."
          className="w-full p-4 border-2 border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition duration-300 resize-none h-28"
        />
        <button
          type="submit"
          disabled={!prompt.trim()}
          className="px-8 py-4 bg-amber-500 text-white font-bold text-lg rounded-full hover:bg-amber-600 transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:scale-100"
        >
          Create Story
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default LandingScreen;
