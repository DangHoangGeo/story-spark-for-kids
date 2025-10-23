import React, { useState } from 'react';

interface LandingScreenProps {
  onCreateStory: (
    prompt: string, 
    audience: string, 
    voice: string, 
    pageCount: number,
    artStyle: string,
    theme: string,
    characterName: string,
    characterDescription: string
  ) => void;
  error: string | null;
  onBack: () => void;
}

const audiences = ["Toddlers (2-3 years)", "Preschoolers (4-5 years)", "Early Readers (6-7 years)"];
const voices = ['Leo (Warm & Friendly)', 'Nova (Bright & Cheerful)', 'Atlas (Calm & Soothing)', 'Luna (Gentle & Sweet)'];
const storyLengths: { [key: string]: number } = {
    'Short (~1 min / 3 pages)': 3,
    'Medium (~2 min / 5 pages)': 5,
    'Long (~3 min / 7 pages)': 7,
};
const artStyles = ["Vibrant Cartoon", "Watercolor Illustrations", "Fairytale Classic", "Anime Style"];
const themes = ["Funny & Silly", "Mysterious & Spooky", "Heartwarming & Kind", "Educational & Informative"];
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
  const [storyLength, setStoryLength] = useState(Object.keys(storyLengths)[0]);
  const [artStyle, setArtStyle] = useState(artStyles[0]);
  const [theme, setTheme] = useState(themes[0]);
  const [characterName, setCharacterName] = useState('');
  const [characterDescription, setCharacterDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onCreateStory(
        prompt.trim(), 
        audience, 
        voice,
        storyLengths[storyLength],
        artStyle,
        theme,
        characterName.trim(),
        characterDescription.trim()
      );
    }
  };
  
  const handleExampleClick = (example: string) => {
      setPrompt(example);
  }

  return (
    <div className="w-full max-w-3xl text-center p-8 bg-white rounded-2xl shadow-lg animate-fade-in">
       <button onClick={onBack} className="text-sm text-amber-600 hover:underline mb-4">&larr; Back to Explore</button>
      <h1 className="text-4xl md:text-5xl font-bold text-amber-500 mb-2">Story Spark</h1>
      <p className="text-lg text-gray-600 mb-8">Let's create a magical story together!</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col items-center text-left space-y-6">
        {/* Story Idea */}
        <div className="w-full p-4 border rounded-lg">
            <label className="font-semibold text-gray-700 mb-2 flex items-center text-lg" htmlFor="story-prompt">
                <span className="text-2xl mr-2">✏️</span> What's your story about?
            </label>
            <textarea
              id="story-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., A curious little fox named Finn..."
              className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition duration-300 resize-none h-28"
              required
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
        
        {/* Customization */}
        <div className="w-full p-4 border rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3 flex items-center text-lg"><span className="text-2xl mr-2">🎨</span> Customize Your Story</h3>
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="font-semibold text-gray-700 mb-1 block text-sm" htmlFor="audience">Audience</label>
                  <select id="audience" value={audience} onChange={e => setAudience(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition">
                      {audiences.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
              </div>
              <div>
                  <label className="font-semibold text-gray-700 mb-1 block text-sm" htmlFor="story-length">Length</label>
                  <select id="story-length" value={storyLength} onChange={e => setStoryLength(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition">
                      {Object.keys(storyLengths).map(len => <option key={len} value={len}>{len}</option>)}
                  </select>
              </div>
               <div>
                  <label className="font-semibold text-gray-700 mb-1 block text-sm" htmlFor="voice">Narration Voice</label>
                  <select id="voice" value={voice} onChange={e => setVoice(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition">
                      {voices.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
              </div>
               <div>
                  <label className="font-semibold text-gray-700 mb-1 block text-sm" htmlFor="art-style">Art Style</label>
                  <select id="art-style" value={artStyle} onChange={e => setArtStyle(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition">
                      {artStyles.map(style => <option key={style} value={style}>{style}</option>)}
                  </select>
              </div>
              <div className="md:col-span-2">
                  <label className="font-semibold text-gray-700 mb-1 block text-sm" htmlFor="theme">Theme / Tone</label>
                  <select id="theme" value={theme} onChange={e => setTheme(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition">
                      {themes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
              </div>
          </div>
        </div>

        {/* Optional Details */}
        <div className="w-full p-4 border rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-3 flex items-center text-lg"><span className="text-2xl mr-2">👤</span> Character Details (Optional)</h3>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                  <label className="font-semibold text-gray-700 mb-1 block text-sm" htmlFor="character-name">Main Character's Name</label>
                  <input type="text" id="character-name" value={characterName} onChange={e => setCharacterName(e.target.value)} placeholder="e.g., Finn" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"/>
              </div>
              <div className="md:col-span-2">
                  <label className="font-semibold text-gray-700 mb-1 block text-sm" htmlFor="character-desc">Character Description</label>
                  <textarea id="character-desc" value={characterDescription} onChange={e => setCharacterDescription(e.target.value)} placeholder="e.g., A brave but tiny mouse with a big red scarf" className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition resize-none h-20"/>
              </div>
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