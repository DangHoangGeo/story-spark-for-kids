import React from 'react';
import { StoryData } from '../types';

interface StoryCardProps {
    story: StoryData;
    onSelect: (story: StoryData) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onSelect }) => {
    return (
        <div 
            onClick={() => onSelect(story)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-1.5 transition-all duration-300 group"
            role="button"
            aria-label={`Read story: ${story.title}`}
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                    src={`data:image/png;base64,${story.pages[0].image}`} 
                    alt={`Illustration for ${story.title}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <span className="absolute top-2 right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {story.category}
                </span>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-amber-600 transition-colors">
                    {story.title}
                </h3>
                <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <span>{story.loves}</span>
                    </div>
                    <span>{story.pages.length} pages</span>
                </div>
            </div>
        </div>
    );
};

export default StoryCard;
