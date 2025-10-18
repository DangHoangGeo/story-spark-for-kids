import { StoryData } from '../types';

/**
 * A simple validator to check if the imported object has the core properties of a StoryData object.
 * This is not an exhaustive check but prevents grossly incorrect files from being loaded.
 */
const isValidStoryData = (data: any): data is StoryData => {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.id === 'string' &&
    typeof data.title === 'string' &&
    typeof data.category === 'string' &&
    typeof data.loves === 'number' &&
    Array.isArray(data.pages) &&
    typeof data.quiz === 'object' &&
    data.pages.every((page: any) => 
      typeof page.text === 'string' &&
      typeof page.image === 'string' &&
      typeof page.audio === 'string'
    )
  );
};

/**
 * Reads a user-selected .story.json file, parses it, and validates its structure.
 * @param file The file selected by the user from an input element.
 * @returns A Promise that resolves with the validated StoryData object.
 * @throws An error if the file is invalid, cannot be read, or is not a valid story.
 */
export const importStoryFromJson = (file: File): Promise<StoryData> => {
  return new Promise((resolve, reject) => {
    if (!file.name.endsWith('.story.json')) {
      return reject(new Error('Invalid file type. Please select a .story.json file.'));
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result as string;
        if (!result) {
          throw new Error("File is empty.");
        }
        const parsedData = JSON.parse(result);

        if (isValidStoryData(parsedData)) {
          resolve(parsedData);
        } else {
          reject(new Error('The selected file is not a valid story file.'));
        }
      } catch (error) {
        console.error('Failed to parse story file:', error);
        reject(new Error('Could not read or parse the story file. It may be corrupted.'));
      }
    };

    reader.onerror = (error) => {
      console.error('File reading error:', error);
      reject(new Error('An error occurred while trying to read the file.'));
    };

    reader.readAsText(file);
  });
};
