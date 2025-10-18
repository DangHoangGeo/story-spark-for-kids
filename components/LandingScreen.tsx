import React, { useState } from 'react';

interface LandingScreenProps {
  onCreateStory: (prompt: string, audience: string, voice: string) => void;
  error: string | null;
  onBack: () => void;
}

const audiences = ["Toddlers (2-3 years)", "Preschoolers (4-5 years)", "Early Readers (6-7 years)"];
const voices = ['Leo (Warm & Friendly)', 'Nova (Bright & Cheerful)', 'Atlas (Calm & Soothing)', 'Luna (Gentle & Sweet)'];
const examplePrompts = [
    "A shy cloud who is afraid of heights.",
    "A magical paintbrush that brings drawings to life.",
    "A friendly robot who learns how to make friends.",
    "The secret life of garden gnomes after dark."
];

const LandingScreen: React.FC<LandingScreenProps> = ({ onCreateStory, error, onBack }) => {
  const [prompt, setPrompt] = useState('');
  const [audience, setAudience] = useState(audiences[1]);
  const [voice, setVoice] = useState(voices[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onCreateStory(prompt.trim(), audience, voice);
    }
  };
  
  const handleExampleClick = (example: string) => {
      setPrompt(example);
  }

  return (
    <div className="w-full max-w-2xl text-center p-8 bg-white rounded-2xl shadow-lg animate-fade-in">
       <button onClick={onBack} className="text-sm text-amber-600 hover:underline mb-4">&larr; Back to Explore</button>
      <h1 className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">Story Spark</h1>
      <p className="text-lg text-gray-600 mb-8">Let's create a magical 1-minute story together!</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center text-left">
        <div className="w-full mb-4">
            <label className="font-semibold text-gray-700 mb-2 flex items-center" htmlFor="story-prompt">
                <span className="text-2xl mr-2">✏️</span> Your Story Idea
            </label>
            <textarea
              id="story-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A story about a curious little fox named Finn..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition duration-300 resize-none h-28"
            />
            <div className="text-xs text-gray-500 mt-1">Need inspiration? Try one of these:</div>
            <div className="flex flex-wrap gap-2 mt-2">
                {examplePrompts.map(p => (
                    <button type="button" key={p} onClick={() => handleExampleClick(p)} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-md hover:bg-amber-200 transition">
                        {p}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
                <label className="font-semibold text-gray-700 mb-2 flex items-center" htmlFor="audience">
                   <span className="text-2xl mr-2">👥</span> For an Audience of...
                </label>
                <select id="audience" value={audience} onChange={e => setAudience(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition">
                    {audiences.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
            </div>
            <div>
                <label className="font-semibold text-gray-700 mb-2 flex items-center" htmlFor="voice">
                    <span className="text-2xl mr-2">🗣️</span> With a Narration Voice that is...
                </label>
                <select id="voice" value={voice} onChange={e => setVoice(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition">
                    {voices.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
        </div>

        <button
          type="submit"
          disabled={!prompt.trim()}
          className="px-8 py-4 bg-amber-500 text-white font-bold text-lg rounded-full hover:bg-amber-600 transition-transform transform hover:scale-105 disabled:bg-gray-300 disabled:scale-100 flex items-center gap-2"
        >
          <span className="text-2xl">✨</span> Create Story
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default LandingScreen;