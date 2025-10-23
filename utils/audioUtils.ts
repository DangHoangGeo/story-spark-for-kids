let audioContext: AudioContext | null = null;
const activeSources: { [key: string]: AudioBufferSourceNode } = {};

const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  }
  return audioContext;
};

function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const audioManager = {
    playAudio: async (base64Audio: string, key: string): Promise<{source: AudioBufferSourceNode, context: AudioContext}> => {
        try {
            const ctx = getAudioContext();
            if (ctx.state === 'suspended') {
                await ctx.resume();
            }
            
            // Stop any currently playing audio with the same key
            if (activeSources[key]) {
                try { activeSources[key].stop(); } catch (e) { /* Fails if already stopped */ }
            }

            const decodedBytes = decode(base64Audio);
            const audioBuffer = await decodeAudioData(decodedBytes, ctx, 24000, 1);
            
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.start();

            activeSources[key] = source;

            source.onended = () => {
                delete activeSources[key];
            };

            return { source, context: ctx };
        } catch (error) {
            console.error("Failed to play audio:", error);
            throw error;
        }
    },
    
    stopAllAudio: () => {
        for (const key in activeSources) {
            try {
                activeSources[key].stop();
                activeSources[key].disconnect();
            } catch (e) { /* Already stopped */ }
            delete activeSources[key];
        }
    },
    
    isPlaying: (key: string): boolean => {
        return !!activeSources[key];
    }
};