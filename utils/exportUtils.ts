import { StoryData } from '../types';

/**
 * Serializes a StoryData object to a JSON string and triggers a browser download.
 * @param story The story data object to export.
 */
export const exportStoryAsJson = (story: StoryData): void => {
  try {
    // Sanitize the title to create a valid filename
    const filename = `${story.title.replace(/[^\w\s]/gi, '').replace(/ /g, '_')}.story.json`;
    
    // Convert the story object to a nicely formatted JSON string
    const jsonStr = JSON.stringify(story, null, 2);
    
    // Create a Blob from the JSON string
    const blob = new Blob([jsonStr], { type: 'application/json' });
    
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // Clean up by removing the anchor element and revoking the URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export story:", error);
    alert("Sorry, the story could not be saved.");
  }
};
