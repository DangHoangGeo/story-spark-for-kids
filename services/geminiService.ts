import { GoogleGenAI, Type } from "@google/genai";
import { StoryData, PageData, QuizData, VocabularyData, WordTimestamp, PageQuizData } from '../types';

// Map friendly names to API voice names
const voiceMap: { [key: string]: string } = {
  'Leo (Warm & Friendly)': 'Kore',
  'Nova (Bright & Cheerful)': 'Puck',
  'Atlas (Calm & Soothing)': 'Zephyr',
  'Luna (Gentle & Sweet)': 'Charon',
};

const storySchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, catchy title for the story."
    },
    category: {
      type: Type.STRING,
      description: "A category for the story from this list: Adventure, Fantasy, Science, Friendship."
    },
    pages: {
      type: Type.ARRAY,
      description: "An array of 3 pages for the story.",
      items: {
        type: Type.OBJECT,
        properties: {
          text: {
            type: Type.STRING,
            description: "The story text for this page, written in simple language for the target age group."
          },
          timedText: {
            type: Type.ARRAY,
            description: "An array of objects, each containing a word from the text and its start/end time in seconds for narration. Example: [{word: 'Once', start: 0.0, end: 0.5}, {word: 'upon', start: 0.5, end: 0.9}]",
            items: {
                type: Type.OBJECT,
                properties: {
                    word: { type: Type.STRING },
                    start: { type: Type.NUMBER },
                    end: { type: Type.NUMBER }
                },
                required: ["word", "start", "end"]
            }
          },
          imagePrompt: {
            type: Type.STRING,
            description: "A detailed prompt for an image generation model to create an illustration for this page. The style should be 'friendly, vibrant, cartoon-style'."
          },
          vocabulary: {
            type: Type.OBJECT,
            description: "An optional key vocabulary word from the page text, with a simple definition and a fun fact for a child.",
            properties: {
              word: { type: Type.STRING, description: "The vocabulary word found in the page text." },
              definition: { type: Type.STRING, description: "A simple, one-sentence definition of the word for a child." },
              funFact: { type: Type.STRING, description: "A one-sentence fun fact related to the word." }
            }
          },
          pageQuiz: {
            type: Type.OBJECT,
            description: "An optional simple multiple-choice quiz question based on the content of this specific page.",
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswerIndex: { type: Type.INTEGER }
            }
          }
        },
        required: ["text", "imagePrompt"]
      }
    },
    quiz: {
      type: Type.OBJECT,
      description: "A multiple-choice quiz question based on the entire story.",
      properties: {
        question: {
          type: Type.STRING,
          description: "The quiz question."
        },
        options: {
          type: Type.ARRAY,
          description: "An array of 3 possible answers for the question.",
          items: {
            type: Type.STRING
          }
        },
        correctAnswerIndex: {
          type: Type.INTEGER,
          description: "The 0-based index of the correct answer in the options array."
        }
      },
      required: ["question", "options", "correctAnswerIndex"]
    }
  },
  required: ["title", "category", "pages", "quiz"]
};

interface StoryStructure {
  title: string;
  category: string;
  pages: { 
    text: string;
    timedText?: WordTimestamp[];
    imagePrompt: string;
    vocabulary?: {
      word: string;
      definition: string;
      funFact: string;
    },
    pageQuiz?: PageQuizData
  }[];
  quiz: QuizData;
}

async function generateStoryStructure(prompt: string, audience: string): Promise<StoryStructure> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: `Create a short, approximately 1-minute (3-page) children's story for a child in the "${audience}" age group, based on this idea: "${prompt}". The story should have a title, a category (Adventure, Fantasy, Science, or Friendship), and be suitable for the specified age. For each page, provide: 1) The story text. 2) A word-by-word timestamp array ('timedText'). 3) A detailed image prompt. 4) An optional key vocabulary word with definition and fun fact. 5) An optional simple multiple-choice question about that page's content ('pageQuiz'). Finally, create one multiple-choice quiz question about the entire story.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: storySchema,
    },
  });

  try {
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as StoryStructure;
  } catch (e) {
    console.error("Failed to parse story structure JSON:", response.text);
    throw new Error("Could not understand the story structure from the AI.");
  }
}

async function generateImage(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages?.[0]?.image?.imageBytes) {
        console.error("Image generation failed. No image data in response:", response);
        throw new Error("Failed to generate an illustration for the story.");
    }

    return response.generatedImages[0].image.imageBytes;
}


async function generateAudio(text: string, voice: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const apiVoiceName = voiceMap[voice] || 'Kore'; // Default to Kore if not found

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: apiVoiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Failed to generate audio.");
  }
  return base64Audio;
}

export const generateFullStory = async (prompt: string, audience: string, voice: string): Promise<Omit<StoryData, 'id' | 'loves'>> => {
  const structure = await generateStoryStructure(prompt, audience);

  const populatedPages: PageData[] = await Promise.all(
    structure.pages.map(async (page): Promise<PageData> => {
      const imagePromise = generateImage(page.imagePrompt);
      const audioPromise = generateAudio(page.text, voice);

      const definitionAudioPromise = page.vocabulary?.definition
          ? generateAudio(page.vocabulary.definition, voice).catch(() => undefined)
          : Promise.resolve(undefined);
      
      const funFactAudioPromise = page.vocabulary?.funFact
          ? generateAudio(page.vocabulary.funFact, voice).catch(() => undefined)
          : Promise.resolve(undefined);
          
      const [imageData, audioData, definitionAudioData, funFactAudioData] = await Promise.all([
          imagePromise,
          audioPromise,
          definitionAudioPromise,
          funFactAudioPromise
      ]);

      const finalPageData: PageData = {
          text: page.text,
          timedText: page.timedText,
          imagePrompt: page.imagePrompt,
          image: imageData,
          audio: audioData,
          pageQuiz: page.pageQuiz,
      };

      if (page.vocabulary && definitionAudioData && funFactAudioData) {
          finalPageData.vocabulary = {
              ...page.vocabulary,
              definitionAudio: definitionAudioData,
              funFactAudio: funFactAudioData,
          };
      }

      return finalPageData;
    })
  );

  return {
    title: structure.title,
    category: structure.category,
    pages: populatedPages,
    quiz: structure.quiz,
    targetAudience: audience,
    voiceName: voice,
  };
};