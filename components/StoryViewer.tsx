import React, { useState, useEffect, useRef } from 'react';
import { PageData, VocabularyData, StoryData, PageQuizData, ImageHotspot } from '../types';
import { audioManager } from '../utils/audioUtils';
import { exportStoryAsJson } from '../utils/exportUtils';
import Celebration from './Celebration';
import { generateSingleWordAudio } from '../services/geminiService';

interface StoryViewerProps {
  story: StoryData;
  page: PageData;
  currentPageIndex: number;
  isFirstPage: boolean;
  isLastPage: boolean;
  onNext: () => void;
  onPrev: () => void;
  onLove: (storyId: string) => void;
  isViewingSharedStory: boolean;
  onExit: () => void;
  onUpdateStory: (story: StoryData) => void;
}

const PageQuiz: React.FC<{ quiz: PageQuizData, onCorrectAnswer: () => void }> = ({ quiz, onCorrectAnswer }) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [answered, setAnswered] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    const handleAnswer = (index: number) => {
        if (answered) return;
        setSelected(index);
        setAnswered(true);
        if(index === quiz.correctAnswerIndex) {
            setShowCelebration(true);
            setTimeout(() => onCorrectAnswer(), 1000);
        }
    };

    const getButtonClass = (index: number) => {
        if (!answered) return "bg-white hover:bg-amber-100";
        if (index === quiz.correctAnswerIndex) return "bg-green-500 text-white scale-105 transform";
        if (index === selected) return "bg-red-500 text-white";
        return "bg-gray-200 text-gray-500 opacity-70";
    };

    return (
        <div className="mt-6 p-4 bg-amber-100/50 rounded-xl relative">
            {showCelebration && <Celebration emojis={['✨']} />}
            <h4 className="font-bold text-lg text-amber-800 mb-3">{quiz.question}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quiz.options.map((option, index) => (
                    <button key={index} onClick={() => handleAnswer(index)} disabled={answered}
                        className={`p-3 rounded-lg font-semibold transition-all duration-300 text-left ${getButtonClass(index)}`}>
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};


const StoryViewer: React.FC<StoryViewerProps> = ({ story, page, currentPageIndex, isFirstPage, isLastPage, onNext, onPrev, onLove, isViewingSharedStory, onExit, onUpdateStory }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [vocabData, setVocabData] = useState<VocabularyData | null>(null);
  const [isNarrationPlaying, setIsNarrationPlaying] = useState(false);
  const [pageQuizAnswered, setPageQuizAnswered] = useState(!page.pageQuiz);
  const [activeWordIndex, setActiveWordIndex] = useState(-1);
  const [tappedWord, setTappedWord] = useState<{word: string, index: number} | null>(null);
  const [isTappedWordLoading, setIsTappedWordLoading] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<ImageHotspot | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const animationFrameRef = useRef<number | null>(null);
  const hotspotTimeoutRef = useRef<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    audioManager.stopAllAudio();
    setIsNarrationPlaying(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setActiveWordIndex(-1);
    setPageQuizAnswered(!page.pageQuiz); // Reset quiz state on page change
    setIsEditMode(false); // Exit edit mode on page change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);


  const handleImageTap = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handlePlayNarration = async () => {
    if (isNarrationPlaying) {
        audioManager.stopAllAudio();
        setIsNarrationPlaying(false);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setActiveWordIndex(-1);
        return;
    }

    try {
      audioManager.stopAllAudio();
      const { source, context } = await audioManager.playAudio(page.audio, 'narration');
      setIsNarrationPlaying(true);
      const startTime = context.currentTime;

      source.onended = () => {
        setIsNarrationPlaying(false);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setActiveWordIndex(-1);
      };
      
      const animateText = () => {
        if (!audioManager.isPlaying('narration') || !page.timedText) {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            return;
        }

        const elapsedTime = context.currentTime - startTime;
        const currentWordIndex = page.timedText.findIndex(
            word => elapsedTime >= word.start && elapsedTime < word.end
        );

        setActiveWordIndex(currentWordIndex);
        animationFrameRef.current = requestAnimationFrame(animateText);
      };

      if (page.timedText && page.timedText.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animateText);
      }

    } catch(e) {
        console.error("Could not play narration:", e);
        setIsNarrationPlaying(false);
    }
  };
  
  const handleWordTap = async (word: string, index: number) => {
    if (isTappedWordLoading) return;
    const cleanedWord = word.replace(/[^a-zA-Z]/g, '');
    if (!cleanedWord) return;

    audioManager.stopAllAudio();
    setIsNarrationPlaying(false);
    setActiveWordIndex(-1);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    try {
        setTappedWord({word, index});
        setIsTappedWordLoading(true);
        const audioData = await generateSingleWordAudio(cleanedWord, story.voiceName || 'Leo (Warm & Friendly)');
        await audioManager.playAudio(audioData, 'word');
    } catch(e) {
        console.error("Failed to play word audio:", e);
    } finally {
        setIsTappedWordLoading(false);
        setTappedWord(null);
    }
  };

  const handleHotspotTap = async (hotspot: ImageHotspot) => {
    if (isEditMode) return; // Don't trigger word reveal in edit mode
    if (hotspotTimeoutRef.current) {
        clearTimeout(hotspotTimeoutRef.current);
    }
    audioManager.stopSpecificAudio('hotspot');
    setActiveHotspot(hotspot);
    
    try {
        const audioData = await generateSingleWordAudio(hotspot.word, story.voiceName || 'Leo (Warm & Friendly)');
        audioManager.playAudio(audioData, 'hotspot');
    } catch(e) {
        console.error("Failed to play hotspot audio:", e);
    }

    hotspotTimeoutRef.current = setTimeout(() => {
        setActiveHotspot(null);
    }, 2500);
  };
  
  const handleHotspotDragEnd = (e: React.DragEvent<HTMLButtonElement>, hotspotIndex: number) => {
    e.preventDefault();
    const imageContainer = imageContainerRef.current;
    if (!imageContainer) return;

    const rect = imageContainer.getBoundingClientRect();
    
    // Calculate position relative to the container
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;

    // Convert to percentage and clamp between 0 and 100
    const newX = Math.max(0, Math.min(100, (xPos / rect.width) * 100));
    const newY = Math.max(0, Math.min(100, (yPos / rect.height) * 100));

    // Create a deep copy to avoid direct mutation
    const updatedStory = JSON.parse(JSON.stringify(story));
    
    // Update the specific hotspot's coordinates
    if (updatedStory.pages[currentPageIndex].imageHotspots) {
        updatedStory.pages[currentPageIndex].imageHotspots[hotspotIndex].x = newX;
        updatedStory.pages[currentPageIndex].imageHotspots[hotspotIndex].y = newY;
    }

    // Call the callback to update the state in App.tsx
    onUpdateStory(updatedStory);
};

  const handleShare = () => {
      navigator.clipboard.writeText(`Check out this story: "${story.title}" on Story Spark!`);
      alert("Link to story copied to clipboard! (Simulation)");
  };
  
  const handleSave = () => {
      exportStoryAsJson(story);
  }

  const renderTextContent = () => {
    const textToRender = (page.timedText || page.text.split(' ').map((w, i) => ({word: w, start:0, end:0, index: i})));
    const wordElements = textToRender.map((wordInfo, index) => {
        const isVocab = page.vocabulary && page.vocabulary.word.toLowerCase() === wordInfo.word.replace(/[^a-zA-Z]/g, '').toLowerCase();
        
        const content = (
          <>
            {wordInfo.word}
            {isTappedWordLoading && tappedWord?.index === index && <span className="word-spinner"></span>}
          </>
        );

        const className = `cursor-pointer rounded-md px-1 py-0.5 transition-all duration-200 ${index === activeWordIndex ? 'active-word' : 'hover:bg-amber-100'}`;

        if (isVocab && page.vocabulary) {
             return (
                <span key={index}>
                    <button 
                        onClick={() => page.vocabulary && setVocabData(page.vocabulary)}
                        className={`font-bold text-amber-600 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-amber-400 after:animate-pulse ${className}`}
                        aria-label={`Learn more about ${wordInfo.word}`}
                    >
                        {wordInfo.word}
                    </button>
                    {' '}
                </span>
            )
        }
        return (
            <span key={index}>
                <button onClick={() => handleWordTap(wordInfo.word, index)} className={className}>
                    {content}
                </button>
                {' '}
            </span>
        );
    });
    
    return (
        <p className="text-xl md:text-2xl text-gray-700 leading-relaxed">
            {wordElements}
        </p>
    );
  };

  const VocabModal = () => {
    if (!vocabData) return null;

    const [isRecording, setIsRecording] = useState(false);
    const [feedback, setFeedback] = useState('');
    
    const handlePronunciation = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setFeedback("Sorry, your browser doesn't support this feature.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsRecording(true);
            setFeedback('Listening...');
        };

        recognition.onresult = (event: any) => {
            setFeedback('Great try! ✨');
        };

        recognition.onerror = (event: any) => {
            if (event.error === 'no-speech') {
                setFeedback("I didn't hear anything. Try again!");
            } else {
                setFeedback('Oops! Something went wrong.');
            }
        };

        recognition.onend = () => {
            setIsRecording(false);
            setTimeout(() => setFeedback(''), 2000);
        };

        recognition.start();
    };


    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={() => setVocabData(null)} role="dialog" aria-modal="true" aria-labelledby="vocab-title"
        >
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative border-2 border-white/50" onClick={e => e.stopPropagation()}>
                <button onClick={() => setVocabData(null)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-transform hover:scale-110" aria-label="Close vocabulary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="text-center">
                    <span className="text-5xl">📖</span>
                    <h3 id="vocab-title" className="text-3xl font-bold text-amber-600 mb-4 capitalize">{vocabData.word}</h3>
                </div>
                
                 <div className="space-y-4 text-left mb-4">
                    <div>
                        <p className="font-semibold text-gray-800 mb-1 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>What it means:</p>
                        <div className="flex items-center space-x-2 pl-2">
                            <p className="text-gray-600 flex-grow text-lg">{vocabData.definition}</p>
                            <button onClick={() => audioManager.playAudio(vocabData.definitionAudio, 'vocab')} className="p-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition" aria-label="Play definition audio">
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.552 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                            </button>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-gray-800 mb-1 flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-amber-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>Fun Fact!</p>
                        <div className="flex items-center space-x-2 pl-2">
                            <p className="text-gray-600 flex-grow text-lg">{vocabData.funFact}</p>
                            <button onClick={() => audioManager.playAudio(vocabData.funFactAudio, 'vocab')} className="p-2 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 transition" aria-label="Play fun fact audio">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.552 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-amber-100 rounded-lg text-center">
                    <h4 className="font-bold text-gray-700 mb-2">Say It With Me!</h4>
                    <button onClick={handlePronunciation} disabled={isRecording} className={`p-4 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-amber-500 hover:bg-amber-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </button>
                    {feedback && <p className="mt-2 font-semibold text-amber-700 animate-fade-in">{feedback}</p>}
                </div>
            </div>
        </div>
    );
  };

  return (
    <>
      <VocabModal />
      <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in">
        <div className="w-full max-w-2xl flex justify-between items-center mb-2 px-2">
            <button onClick={onExit} className="text-sm text-amber-600 hover:underline">&larr; Back to Explore</button>
            <div className="flex items-center space-x-2">
                <button onClick={() => onLove(story.id)} className="flex items-center space-x-1 text-red-500 font-semibold" aria-label={`Love this story. Current loves: ${story.loves}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    <span>{story.loves}</span>
                </button>
                <button onClick={handleShare} className="p-2 rounded-full bg-white/50 hover:bg-white" aria-label="Share story">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v12" /></svg>
                </button>
                 <button onClick={handleSave} className="p-2 rounded-full bg-white/50 hover:bg-white" aria-label="Save story">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                </button>
            </div>
        </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">{story.title}</h2>
        <p className="text-sm text-gray-500 mb-4">Page {currentPageIndex + 1} of {story.pages.length}</p>


        <div 
          ref={imageContainerRef}
          onDragOver={(e) => e.preventDefault()}
          className="relative w-full aspect-square max-w-xl bg-gray-200 rounded-2xl shadow-lg mb-4 overflow-hidden"
        >
          {page.image ? (
            <>
              <button onClick={() => setIsEditMode(!isEditMode)} className="absolute top-2 left-2 z-20 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-semibold hover:bg-black/70 transition-all">
                {isEditMode ? '✅ Done Editing' : '✏️ Edit Hotspots'}
              </button>
              <img key={page.image} src={`data:image/png;base64,${page.image}`} alt={page.imagePrompt} className="w-full h-full object-cover animate-ken-burns" />
              <div className="absolute top-1/3 left-1/3 w-1/3 h-1/3 cursor-pointer" onClick={handleImageTap} aria-label="Animate image">
                {isAnimating && (<div className="absolute inset-0 bg-white/30 rounded-full animate-pulse-once"></div>)}
              </div>
              {/* Hotspots */}
              {page.imageHotspots?.map((hotspot, index) => (
                <button 
                    key={`${hotspot.word}-${index}`} 
                    className={`hotspot-marker ${isEditMode ? 'editable' : ''}`}
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    onClick={() => handleHotspotTap(hotspot)}
                    draggable={isEditMode}
                    onDragEnd={(e) => handleHotspotDragEnd(e, index)}
                    aria-label={`Learn about the ${hotspot.word}`}
                />
              ))}
              {/* Revealed Hotspot Word */}
              {activeHotspot && (
                <div 
                    className="hotspot-word capitalize"
                    style={{ left: `${activeHotspot.x}%`, top: `${activeHotspot.y - 8}%` }}
                >
                    {activeHotspot.word}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-[60px] h-[80px] mb-8 book">
                    <div className="book__pg-shadow"></div>
                    <div className="book__pg"></div>
                    <div className="book__pg book__pg--2"></div>
                    <div className="book__pg book__pg--3"></div>
                    <div className="book__pg book__pg--4"></div>
                    <div className="book__pg book__pg--5"></div>
                </div>
                <p className="text-lg font-semibold text-amber-600">Illustrating page {currentPageIndex + 1}...</p>
            </div>
          )}
        </div>

        <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-md text-center">
          {renderTextContent()}
          {page.pageQuiz && <PageQuiz quiz={page.pageQuiz} onCorrectAnswer={() => setPageQuizAnswered(true)} />}
        </div>
        
        <div className="flex justify-between items-center w-full max-w-3xl mt-6">
          <button onClick={onPrev} disabled={isFirstPage} className="p-4 rounded-full bg-white shadow-md disabled:opacity-30 transition-transform hover:scale-110" aria-label="Previous page">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>

          <button onClick={handlePlayNarration} disabled={!page.audio} className="p-5 rounded-full bg-amber-500 text-white shadow-lg transition-transform hover:scale-110 disabled:bg-gray-300 disabled:cursor-not-allowed" aria-label={isNarrationPlaying ? "Pause audio" : "Play page audio"}>
             {isNarrationPlaying ? 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v4a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                :
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8.07v3.86a1 1 0 001.555.832l3.197-1.932a1 1 0 000-1.664L9.555 7.168z" clipRule="evenodd" /></svg>
             }
          </button>

          <button onClick={onNext} disabled={!pageQuizAnswered} className="p-4 rounded-full bg-white shadow-md transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Next page">
            {isLastPage ? 
              (isViewingSharedStory ? <span className="text-amber-500 font-bold px-2">Finish</span> : <span className="text-amber-500 font-bold px-2">Quiz!</span>) :
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            }
          </button>
        </div>
      </div>
    </>
  );
};

export default StoryViewer;