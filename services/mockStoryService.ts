import { StoryData } from '../types';

// Placeholder 1x1 red pixel PNG for images to keep file size small
const placeholderImage = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
// Placeholder for audio data
const placeholderAudio = 'UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

let mockStories: StoryData[] = [
  {
    id: 'story-1',
    title: 'Finn the Brave Fox',
    category: 'Adventure',
    loves: 28,
    targetAudience: 'Preschoolers (4-5 years)',
    voiceName: 'Leo (Warm & Friendly)',
    pages: [
      {
        text: 'Once upon a time, a little fox named Finn found a mysterious, glowing key in the forest.',
        imagePrompt: 'A small, brave cartoon fox named Finn holding a glowing key in a magical forest.',
        image: placeholderImage,
        audio: placeholderAudio,
        vocabulary: {
            word: "mysterious",
            definition: "Something that is hard to understand or explain.",
            funFact: "The ocean has many mysterious creatures we haven't even discovered yet!",
            definitionAudio: placeholderAudio,
            funFactAudio: placeholderAudio
        },
        pageQuiz: {
            question: "What did Finn the fox find?",
            options: ["A sandwich", "A glowing key", "A sleepy owl"],
            correctAnswerIndex: 1
        }
      },
      {
        text: 'The key led him to an ancient, mossy door in the side of a hill.',
        imagePrompt: 'Finn the fox standing in front of a big, ancient door covered in moss in a hillside.',
        image: placeholderImage,
        audio: placeholderAudio,
        pageQuiz: {
            question: "Where was the ancient door?",
            options: ["In a tree", "Under the river", "In the side of a hill"],
            correctAnswerIndex: 2
        }
      },
      {
        text: 'Behind the door was a treasure chest filled with sparkling, magical acorns!',
        imagePrompt: 'Finn the fox looking amazed at an open treasure chest filled with glowing acorns.',
        image: placeholderImage,
        audio: placeholderAudio,
        pageQuiz: {
            question: "What was inside the treasure chest?",
            options: ["Magical acorns", "Shiny rocks", "Old shoes"],
            correctAnswerIndex: 0
        }
      }
    ],
    quiz: {
      question: 'What did Finn find behind the mossy door?',
      options: ['A grumpy badger', 'Magical acorns', 'A slide'],
      correctAnswerIndex: 1
    }
  },
  {
    id: 'story-2',
    title: 'The Star Sailor',
    category: 'Fantasy',
    loves: 42,
    targetAudience: 'Early Readers (6-7 years)',
    voiceName: 'Nova (Bright & Cheerful)',
    pages: [
        {
          text: 'Lily was a girl who sailed a boat through the night sky, catching fallen stars in her net.',
          imagePrompt: 'A young girl in a small sailboat floating on a starry night sky, catching stars.',
          image: placeholderImage,
          audio: placeholderAudio,
           pageQuiz: {
            question: "How did Lily catch stars?",
            options: ["With her hands", "In a bucket", "In her net"],
            correctAnswerIndex: 2
        }
        },
        {
          text: 'One night, she met a friendly moon-whale who hummed a gentle song.',
          imagePrompt: 'Lily the star sailor talking to a giant, friendly whale that looks like the moon.',
          image: placeholderImage,
          audio: placeholderAudio,
          vocabulary: {
            word: "gentle",
            definition: "Being kind, soft, and calm.",
            funFact: "Some of the biggest animals, like elephants, can be very gentle.",
            definitionAudio: placeholderAudio,
            funFactAudio: placeholderAudio
          },
          pageQuiz: {
            question: "What kind of animal did Lily meet?",
            options: ["A sun-lion", "A moon-whale", "A star-fish"],
            correctAnswerIndex: 1
          }
        },
        {
          text: 'They sailed together, making sure every star was polished and bright before morning.',
          imagePrompt: 'Lily and the moon-whale polishing stars together in the night sky.',
          image: placeholderImage,
          audio: placeholderAudio,
          pageQuiz: {
            question: "What did Lily and the moon-whale do together?",
            options: ["They polished stars", "They sang songs", "They ate moon cheese"],
            correctAnswerIndex: 0
          }
        }
      ],
      quiz: {
        question: 'Who did Lily meet in the night sky?',
        options: ['A grumpy astronaut', 'A moon-whale', 'A rocket ship'],
        correctAnswerIndex: 1
      }
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getStories = async (category?: string, searchTerm?: string): Promise<StoryData[]> => {
  await delay(500);
  let stories = [...mockStories];

  if (category) {
    stories = stories.filter(s => s.category === category);
  }
  if (searchTerm) {
    stories = stories.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  return stories;
};

export const loveStory = async (id: string): Promise<{ loves: number }> => {
    await delay(200);
    const storyIndex = mockStories.findIndex(s => s.id === id);
    if (storyIndex !== -1) {
        mockStories[storyIndex].loves += 1;
        return { loves: mockStories[storyIndex].loves };
    }
    throw new Error("Story not found");
};