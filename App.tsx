import React, { useState, useCallback, useEffect } from 'react';
import { AppState, StoryData } from './types';
import LandingScreen from './components/LandingScreen';
import LoadingScreen from './components/LoadingScreen';
import StoryViewer from './components/StoryViewer';
import QuizScreen from './components/QuizScreen';
import ExploreScreen from './components/ExploreScreen';
import SequencingGameScreen from './components/SequencingGameScreen';
import { generateInitialStory, populateStoryAssets } from './services/geminiService';
import { getStories, loveStory as apiLoveStory } from './services/mockStoryService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.EXPLORE);
  const [activeStory, setActiveStory] = useState<StoryData | null>(null);
  const [communityStories, setCommunityStories] = useState<StoryData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  useEffect(() => {
    // Load initial stories from the mock service
    getStories().then(stories => {
      setCommunityStories(stories);
      setIsLoading(false);
    });
  }, []);

  const handleCreateStory = useCallback(async (
    prompt: string, 
    audience: string, 
    voice: string,
    pageCount: number,
    artStyle: string,
    theme: string,
    characterName: string,
    characterDescription: string
  ) => {
    setAppState(AppState.LOADING);
    setError(null);
    setActiveStory(null);
    try {
      // Phase 1: Get the story structure and text quickly
      const storyParams = {
        prompt, audience, voice, pageCount, artStyle, theme, characterName, characterDescription
      };
      const initialStoryData = await generateInitialStory(storyParams, setLoadingMessage);

      const newStory: StoryData = {
        ...initialStoryData,
        id: `story-${Date.now()}`,
        loves: 0,
      };

      // Show the story viewer immediately with the text content
      setActiveStory(newStory);
      setCurrentPageIndex(0);
      setAppState(AppState.STORY);
      setLoadingMessage(''); // Clear loading message as we are now in the story view

      // Phase 2: Populate images and audio in the background
      await populateStoryAssets(
        newStory,
        (populatedPage, index) => {
          setActiveStory(currentStory => {
            if (!currentStory) return null;
            
            const updatedPages = [...currentStory.pages];
            updatedPages[index] = populatedPage;
            
            return { ...currentStory, pages: updatedPages };
          });
        }
      );

    } catch (err) {
      console.error('Failed to generate story:', err);
      setError('Sorry, we couldn\'t create your story. The magical ink might have spilled! Please try again with a different idea.');
      setAppState(AppState.LANDING);
    } 
  }, []);

  const handleFinishCreation = (createdStory: StoryData) => {
    // Add the new story to the top of the community list
    setCommunityStories(prev => [createdStory, ...prev]);
    setAppState(AppState.EXPLORE);
    setActiveStory(null);
  };
  
  const handleSelectStory = (story: StoryData) => {
    setActiveStory(story);
    setCurrentPageIndex(0);
    setAppState(AppState.VIEW_STORY);
  };

  const handleImportStory = (story: StoryData) => {
    setActiveStory(story);
    setCurrentPageIndex(0);
    setAppState(AppState.VIEW_STORY);
  };
  
  const handleUpdateStory = (updatedStory: StoryData) => {
    setActiveStory(updatedStory);
    // Also update the story in the community list for data consistency
    setCommunityStories(prev => 
        prev.map(s => s.id === updatedStory.id ? updatedStory : s)
    );
  };

  const handleLoveStory = useCallback(async (storyId: string) => {
      const updatedStory = await apiLoveStory(storyId);
      // Update story in the community list
      setCommunityStories(prevStories => 
          prevStories.map(s => s.id === storyId ? { ...s, loves: updatedStory.loves } : s)
      );
      // Update active story if it's the one being viewed
      if (activeStory?.id === storyId) {
          setActiveStory(prev => prev ? { ...prev, loves: updatedStory.loves } : null);
      }
  }, [activeStory]);


  const handleNextPage = () => {
    if (activeStory && currentPageIndex < activeStory.pages.length - 1) {
      setCurrentPageIndex(prev => prev + 1);
    } else {
       if (appState === AppState.STORY) { // If creating
         setAppState(AppState.QUIZ);
       } else { // If viewing
         setAppState(AppState.EXPLORE);
       }
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };
  
  const handleStartSequencingGame = () => {
    setAppState(AppState.SEQUENCING_GAME);
  };

  const handleExitToExplore = () => {
    setAppState(AppState.EXPLORE);
    setActiveStory(null);
    setError(null);
  };

  const renderContent = () => {
    if (isLoading && appState === AppState.EXPLORE) {
      return <LoadingScreen message="Loading community stories..." />;
    }

    switch (appState) {
      case AppState.EXPLORE:
        return <ExploreScreen 
          stories={communityStories} 
          onSelectStory={handleSelectStory}
          onCreateNew={() => setAppState(AppState.LANDING)}
          onImportStory={handleImportStory}
        />;
      case AppState.LANDING:
        return <LandingScreen onCreateStory={handleCreateStory} error={error} onBack={handleExitToExplore} />;
      case AppState.LOADING:
        return <LoadingScreen message={loadingMessage} />;
      case AppState.STORY:
      case AppState.VIEW_STORY:
        if (!activeStory) return null;
        return (
          <StoryViewer 
            key={`${activeStory.id}-${currentPageIndex}`}
            story={activeStory}
            page={activeStory.pages[currentPageIndex]}
            currentPageIndex={currentPageIndex}
            isFirstPage={currentPageIndex === 0}
            isLastPage={currentPageIndex === activeStory.pages.length - 1}
            onNext={handleNextPage}
            onPrev={handlePrevPage}
            onLove={handleLoveStory}
            isViewingSharedStory={appState === AppState.VIEW_STORY}
            onExit={handleExitToExplore}
            onUpdateStory={handleUpdateStory}
          />
        );
      case AppState.QUIZ:
        if (!activeStory?.quiz) return null;
        return <QuizScreen quiz={activeStory.quiz} story={activeStory} onFinish={handleStartSequencingGame} />;
      case AppState.SEQUENCING_GAME:
        if (!activeStory?.sequencingGame) return null;
        return <SequencingGameScreen game={activeStory.sequencingGame} onFinish={() => handleFinishCreation(activeStory)} />;
      default:
        return <ExploreScreen stories={communityStories} onSelectStory={handleSelectStory} onCreateNew={() => setAppState(AppState.LANDING)} onImportStory={handleImportStory} />;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 font-sans">
      {renderContent()}
    </div>
  );
};

export default App;