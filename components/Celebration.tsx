import React from 'react';

interface CelebrationProps {
    emojis?: string[];
    count?: number;
}

const defaultEmojis = ['✨', '🎉', '🎈', '⭐'];

const Celebration: React.FC<CelebrationProps> = ({ emojis = defaultEmojis, count = 30 }) => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
        {Array.from({ length: count }).map((_, i) => {
            const style = {
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                transform: `scale(${Math.random() * 0.8 + 0.5})`,
            };
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            return <div key={i} className="sparkle-emoji" style={style}>{emoji}</div>;
        })}
    </div>
);

export default Celebration;