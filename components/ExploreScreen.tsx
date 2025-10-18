import React, { useState, useEffect, useRef } from 'react';
import { StoryData } from '../types';
import StoryCard from './StoryCard';
import { importStoryFromJson } from '../utils/importUtils';

interface ExploreScreenProps {
  stories: StoryData[];
  onSelectStory: (story: StoryData) => void;
  onCreateNew: () => void;
  onImportStory: (story: StoryData) => void;
}

const CATEGORIES = ["All", "Adventure", "Fantasy", "Science", "Friendship"];

const ExploreScreen: React.FC<ExploreScreenProps> = ({ stories, onSelectStory, onCreateNew, onImportStory }) => {
  const [filteredStories, setFilteredStories] = useState<StoryData[]>(stories);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let tempStories = [...stories];
    
    if (activeCategory !== 'All') {
      tempStories = tempStories.filter(story => story.category === activeCategory);
    }

    if (searchTerm.trim() !== '') {
      tempStories = tempStories.filter(story => 
        story.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
    }
    
    setFilteredStories(tempStories);
  }, [stories, activeCategory, searchTerm]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const story = await importStoryFromJson(file);
        onImportStory(story);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Error importing story: ${error.message}`);
        } else {
          alert('An unknown error occurred during import.');
        }
      } finally {
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
      }
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-500">Story Spark</h1>
          <p className="text-lg text-gray-600 mt-1">Explore magical stories created by others!</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center shrink-0">
          <button
            onClick={handleImportClick}
            className="px-6 py-3 bg-white text-amber-600 border-2 border-amber-500 font-bold text-lg rounded-full hover:bg-amber-50 transition-transform transform hover:scale-105 shadow-md"
          >
            📂 Import Story
          </button>
          <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".story.json"
              className="hidden"
          />
          <button
            onClick={onCreateNew}
            className="px-6 py-3 bg-amber-500 text-white font-bold text-lg rounded-full hover:bg-amber-600 transition-transform transform hover:scale-105 shadow-md"
          >
            ✨ Create Your Own Story
          </button>
        </div>
      </header>
      
      <div className="mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm sticky top-4 z-10">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search for a story..."
            className="w-full md:w-auto md:flex-grow p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
          />
          <div className="flex items-center justify-center flex-wrap gap-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition-colors text-sm md:text-base ${
                  activeCategory === category
                    ? 'bg-amber-500 text-white shadow'
                    : 'bg-gray-200 text-gray-700 hover:bg-amber-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredStories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStories.map(story => (
            <StoryCard key={story.id} story={story} onSelect={onSelectStory} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold text-gray-700">No Stories Found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters!</p>
        </div>
      )}
    </div>
  );
};

export default ExploreScreen;