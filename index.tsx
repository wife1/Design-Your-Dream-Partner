import React, { useState, useRef, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { LucideHeart, LucideMessageCircle, LucideSparkles, LucideUser, LucideArrowRight, LucideRefreshCcw, LucideSend, LucideArrowLeft, LucideLoader2, LucideAlertCircle, LucideTrash2, LucideCheck, LucideCheckCheck, LucideMic, LucideImage, LucideX, LucidePalette, LucideUpload, LucideVolume2, LucideVolumeX, LucideSearch, LucideMusic, LucideLayoutGrid, LucidePlus, LucidePlay, LucideSquare } from "lucide-react";

// --- Types ---

type Character = {
  id: string;
  name: string;
  gender: string;
  age: number;
  relationship: string;
  voice: string;
  style: string;
  hairColor: string;
  eyeColor: string;
  ethnicity: string;
  bodyType: string;
  personality: string[];
  bio: string;
  imageUrl?: string;
  profileImageUrl?: string;
};

type Message = {
  id?: string;
  role: "user" | "model";
  text: string;
  gif?: string;
  status?: "sent" | "read";
  isTyping?: boolean;
};

// --- Constants ---

const GENDERS = ["Female", "Male", "Non-binary"];
const RELATIONSHIPS = ["Girlfriend", "Boyfriend", "Wife", "Husband", "Best Friend", "Mentor", "Secret Admirer"];
const STYLES = ["Realistic Photo", "Anime", "Digital Art", "Cyberpunk", "Oil Painting"];
const HAIR_COLORS = ["Blonde", "Brunette", "Black", "Red", "Pink", "Silver", "Blue"];
const EYE_COLORS = ["Blue", "Green", "Brown", "Hazel", "Gray", "Purple"];
const ETHNICITIES = ["Caucasian", "Asian", "Latina", "Black", "Middle Eastern", "Mixed"];
const BODY_TYPES = ["Slim", "Athletic", "Curvy", "Muscular", "Average", "Petite"];
const PERSONALITY_TRAITS = [
  "Sweet", "Shy", "Confident", "Sassy", "Intelligent", "Caring", 
  "Adventurous", "Playful", "Mysterious", "Tsundere", "Motherly", "Stoic", "Funny"
];

const VOICE_OPTIONS = [
  { id: 'Kore', name: 'Kore', gender: 'Female', style: 'Sweet & Soft' },
  { id: 'Zephyr', name: 'Zephyr', gender: 'Female', style: 'Calm & Balanced' },
  { id: 'Puck', name: 'Puck', gender: 'Male', style: 'Playful & Energetic' },
  { id: 'Charon', name: 'Charon', gender: 'Male', style: 'Deep & Confident' },
  { id: 'Fenrir', name: 'Fenrir', gender: 'Male', style: 'Strong & Intense' },
];

const GIF_LIBRARY = {
  happy: [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0MYt5jPR6tD0fUfC/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xhN4C2vEU5AXS/giphy.gif"
  ],
  love: [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26BRv0ThflsHCqDrG/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/R6gvnAxj2ISzJdbA63/giphy.gif"
  ],
  sad: [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7SF5scGB2AFrgsXP63/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OPU6wzx8JrHna/giphy.gif"
  ],
  laugh: [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/9MFsNSIDyCdfy/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/F9MwjJeXBgK52/giphy.gif"
  ],
  dance: [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/blSTtZbddJzNgue666/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3V0lsGtTMSB5YNgc/giphy.gif"
  ],
  surprised: [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5VKbvrjxpVJCM/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/tfUW8mhiFk8NlJhgEh/giphy.gif"
  ],
  shy: [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/e1ESXynAnueNG/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKKX9TV8vxhLA0o/giphy.gif"
  ],
  angry: [
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/11tTNkNy1SdXGg/giphy.gif",
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXNna3BwYnF0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0Y3I0YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l1J9u3TZfpmeDLkD6/giphy.gif"
  ]
};

const THEMES = {
  default: { primary: "pink", secondary: "purple", bgGradient: "linear-gradient(315deg, #0f0c29 0%, #302b63 74%, #24243e 100%)" },
  passionate: { primary: "red", secondary: "orange", bgGradient: "linear-gradient(315deg, #2b0c0c 0%, #632b2b 74%, #3e2424 100%)" },
  cool: { primary: "cyan", secondary: "blue", bgGradient: "linear-gradient(315deg, #0c1829 0%, #2b4563 74%, #24303e 100%)" },
  nature: { primary: "emerald", secondary: "teal", bgGradient: "linear-gradient(315deg, #0c2912 0%, #2b6330 74%, #243e2a 100%)" },
  mystical: { primary: "violet", secondary: "fuchsia", bgGradient: "linear-gradient(315deg, #180c29 0%, #462b63 74%, #32243e 100%)" },
  sunny: { primary: "amber", secondary: "yellow", bgGradient: "linear-gradient(315deg, #29200c 0%, #634f2b 74%, #3e3624 100%)" },
};

const BACKGROUND_OPTIONS = [
  { id: 'default', name: 'Default', value: '' },
  { id: 'room', name: 'Cozy Room', value: 'https://images.unsplash.com/photo-1522771753033-63216782c9f9?auto=format&fit=crop&w=1920&q=80' },
  { id: 'city', name: 'Night City', value: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1920&q=80' },
  { id: 'cafe', name: 'Cafe', value: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=80' },
  { id: 'nature', name: 'Nature', value: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80' },
  { id: 'abstract', name: 'Abstract', value: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1920&q=80' },
];

// --- Audio Helpers ---

function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function pcmToAudioBuffer(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000
): Promise<AudioBuffer> {
  // Convert 16-bit PCM to Float32
  const dataInt16 = new Int16Array(data.buffer);
  const channelCount = 1;
  const frameCount = dataInt16.length;
  
  const buffer = ctx.createBuffer(channelCount, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  
  return buffer;
}

// --- Components ---

function App() {
  // State
  const [step, setStep] = useState<"create" | "preview" | "chat" | "gallery">("create");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Character State
  const defaultCharacter: Character = {
    id: "", // Will be set on init or new creation
    name: "Luna",
    gender: "Female",
    age: 24,
    relationship: "Girlfriend",
    voice: "Kore",
    style: "Realistic Photo",
    hairColor: "Silver",
    eyeColor: "Blue",
    ethnicity: "Caucasian",
    bodyType: "Slim",
    personality: ["Sweet", "Intelligent"],
    bio: "I love reading books in cozy cafes and talking about the universe.",
  };

  const [character, setCharacter] = useState<Character>({
      ...defaultCharacter,
      id: Date.now().toString()
  });

  const [savedCharacters, setSavedCharacters] = useState<Character[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatSession, setChatSession] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState("");
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  
  // Background State
  const [chatBackground, setChatBackground] = useState<string>("");
  const [showBgPicker, setShowBgPicker] = useState(false);
  const bgFileInputRef = useRef<HTMLInputElement>(null);

  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Theme Logic
  const theme = useMemo(() => {
    const traits = character.personality;
    let selectedTheme = THEMES.default;

    if (traits.some(t => ["Confident", "Sassy", "Adventurous"].includes(t))) selectedTheme = THEMES.passionate;
    else if (traits.some(t => ["Intelligent", "Shy"].includes(t))) selectedTheme = THEMES.cool;
    else if (traits.some(t => ["Caring", "Motherly"].includes(t))) selectedTheme = THEMES.nature;
    else if (traits.some(t => ["Mysterious", "Tsundere"].includes(t))) selectedTheme = THEMES.mystical;
    else if (traits.some(t => ["Playful", "Funny"].includes(t))) selectedTheme = THEMES.sunny;
    
    // Override if hair color matches a strong archetype and personality is generic
    if (selectedTheme === THEMES.default) {
        if (character.hairColor === "Red") selectedTheme = THEMES.passionate;
        if (character.hairColor === "Blue") selectedTheme = THEMES.cool;
        if (character.hairColor === "Green") selectedTheme = THEMES.nature;
        if (character.hairColor === "Pink") selectedTheme = THEMES.default; // Pink/Sweet
    }
    
    return selectedTheme;
  }, [character.personality, character.hairColor]);

  // Apply Body Background
  useEffect(() => {
      document.body.style.backgroundImage = theme.bgGradient;
  }, [theme]);

  // Initialize Gemini
  // Ensure we use the API key from environment
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, showGifPicker, quickReplies]);

  // Load Saved Characters
  useEffect(() => {
      const saved = localStorage.getItem('ourdream_characters');
      if (saved) {
          try {
              setSavedCharacters(JSON.parse(saved));
          } catch (e) {
              console.error("Failed to parse saved characters", e);
          }
      }
  }, []);

  // Persist Chat History
  useEffect(() => {
    if (step === 'chat' && character.name) {
      const key = `ourdream_chat_${character.id}`; // Use ID for uniqueness
      // Filter out typing placeholder messages before saving
      const historyToSave = chatHistory.filter(m => !m.isTyping);
      if (historyToSave.length > 0) {
        localStorage.setItem(key, JSON.stringify(historyToSave));
      }
    }
  }, [chatHistory, step, character.id, character.name]);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(prev => {
           // Append with space if there is already text
           return prev ? `${prev} ${transcript}` : transcript;
        });
      };
    }
  }, []);

  // --- Actions ---

  const initAudio = () => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      setAudioContext(ctx);
      return ctx;
    }
    return audioContext;
  };

  const stopAudio = () => {
     if (currentAudioSourceRef.current) {
         try {
             currentAudioSourceRef.current.stop();
         } catch(e) {}
         currentAudioSourceRef.current = null;
     }
     setPreviewingVoice(null);
     setIsPlayingAudio(false);
  };

  const playVoicePreview = async (e: React.MouseEvent, voiceId: string) => {
      e.stopPropagation();
      
      if (previewingVoice === voiceId) {
          stopAudio();
          return;
      }

      stopAudio();
      setPreviewingVoice(voiceId);
      
      const ctx = initAudio();
      if (!ctx) return;

      try {
        const text = `Hello! I am ${voiceId}. I can't wait to talk with you.`;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: { parts: [{ text: text }] },
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: voiceId }
                    }
                }
            }
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            setPreviewingVoice(null);
            return;
        }

        const audioBytes = decodeBase64(base64Audio);
        const audioBuffer = await pcmToAudioBuffer(audioBytes, ctx, 24000);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setPreviewingVoice(null);
        source.start();
        currentAudioSourceRef.current = source;

      } catch (e) {
          console.error(e);
          setPreviewingVoice(null);
      }
  };

  const playResponseAudio = async (text: string) => {
    if (!audioContext || isMuted) return;

    try {
        setIsPlayingAudio(true);
        // Using generateContent with audio modality for TTS
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: { parts: [{ text: text }] },
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: character.voice }
                    }
                }
            }
        });

        // Parse response
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return;

        // Decode and play
        const audioBytes = decodeBase64(base64Audio);
        const audioBuffer = await pcmToAudioBuffer(audioBytes, audioContext, 24000);
        
        // Stop previous if any
        if (currentAudioSourceRef.current) {
            try { currentAudioSourceRef.current.stop(); } catch(e) {}
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.onended = () => setIsPlayingAudio(false);
        source.start();
        currentAudioSourceRef.current = source;

    } catch (e) {
        console.error("TTS Error:", e);
        setIsPlayingAudio(false);
    }
  };

  const handleGenerateCharacter = async () => {
    if (!process.env.API_KEY) {
        setError("API Key is missing. Please check your configuration.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      // Construct prompt for image generation
      // Dynamic Prompt based on gender
      const genderTerm = character.gender === 'Male' ? 'man' : character.gender === 'Female' ? 'woman' : 'person';
      
      const prompt = `A high quality ${character.style} portrait of a ${character.age} year old ${character.ethnicity} ${genderTerm}, ${character.hairColor} hair, ${character.eyeColor} eyes, ${character.bodyType} build. Looking ${character.personality.join(", ")}. Soft lighting, detailed textures, aesthetically pleasing, 8k resolution, centered composition.`;
      
      // Using imagen-4.0-generate-001 for better stability via generateImages API
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "3:4",
          outputMimeType: "image/jpeg"
        }
      });

      // Extract image
      if (response.generatedImages && response.generatedImages.length > 0) {
          const base64EncodeString = response.generatedImages[0].image.imageBytes;
          const imageUrl = `data:image/jpeg;base64,${base64EncodeString}`;
          setGeneratedImage(imageUrl);
          setStep("preview");
      } else {
        console.error("No image found in response", response);
        setError("The model generated a response, but no image was found. Please try adjusting your prompt or style.");
      }

    } catch (err: any) {
      console.error("Error generating character:", err);
      let errorMessage = "Something went wrong with the generation. Please try again.";
      if (err.message && err.message.includes("500")) {
          errorMessage = "Server error (500). The image generation service might be busy. Please try again in a moment.";
      } else if (err.message) {
          errorMessage = `Error: ${err.message}`;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProfilePic = async () => {
    if (!process.env.API_KEY) return;
    setLoadingProfile(true);
    try {
        const genderTerm = character.gender === 'Male' ? 'man' : character.gender === 'Female' ? 'woman' : 'person';
        const prompt = `Close-up headshot profile picture, face forward, of a ${character.age} year old ${character.ethnicity} ${genderTerm}, ${character.hairColor} hair, ${character.eyeColor} eyes. ${character.style} style. Soft lighting, detailed, 8k.`;
        
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "1:1",
                outputMimeType: "image/jpeg"
            }
        });
        
        if (response.generatedImages?.[0]) {
             const base64 = response.generatedImages[0].image.imageBytes;
             const url = `data:image/jpeg;base64,${base64}`;
             setCharacter(prev => ({ ...prev, profileImageUrl: url }));
        }
    } catch (e) {
        console.error(e);
        setError("Failed to generate profile picture");
    } finally {
        setLoadingProfile(false);
    }
  };

  // Modified startChat to accept an optional character argument
  // This allows loading a saved character directly without relying solely on state update timing
  const startChat = (charToLoad?: Character) => {
    const activeChar = charToLoad || character;
    const activeImage = charToLoad?.imageUrl || generatedImage;

    setError(null);
    try {
        // Initialize Audio Context on user interaction (start chat)
        initAudio();

        // Save character to gallery if starting a chat with a newly generated one
        if (activeImage) {
            saveCharacterToStorage(activeChar, activeImage);
        }

        // Initialize Chat Session
        const genderTerm = activeChar.gender === 'Male' ? 'male' : activeChar.gender === 'Female' ? 'female' : 'non-binary person';
        
        const systemInstruction = `You are ${activeChar.name}, a ${activeChar.age}-year-old ${genderTerm}. 
        You are the user's ${activeChar.relationship}. 
        Appearance: ${activeChar.ethnicity}, ${activeChar.hairColor} hair, ${activeChar.eyeColor} eyes.
        Personality: ${activeChar.personality.join(", ")}. 
        Bio: ${activeChar.bio}.
        
        Roleplay Instructions:
        - Stay in character at all times.
        - Be affectionate, engaging, and personal.
        - Your responses should be conversational (1-3 sentences typically), unless a deep topic is discussed.
        - Do not sound like a robotic AI assistant. Use emojis occasionally if it fits the personality.
        - Reference your backstory or relationship status naturally.
        - You can send GIFs to express strong emotion. To send a GIF, output a specific tag at the end of your message in the format: [GIF: category].
        - Supported GIF categories are: happy, love, sad, laugh, dance, surprised, shy, angry.
        - Example: "That makes me so happy! [GIF: happy]"
        - Use GIFs sparingly, only when appropriate for the emotional context.
        - At the end of your message, you MUST provide 3 short, contextually relevant quick reply options for the user to choose from. Format them as: [REPLY: Yes, I'd love to] [REPLY: Tell me more] [REPLY: Maybe later].
        `;

        // Load History
        let historyForSdk: any[] = [];
        let initialUiHistory: Message[] = [];
        const key = `ourdream_chat_${activeChar.id}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                initialUiHistory = JSON.parse(saved);
                // Map to SDK Content format
                historyForSdk = initialUiHistory.map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.text }] // Note: We only send text to the model, not the GIF URL itself, as it's a visual output
                }));
            } catch(e) {
                console.error("Failed to parse history", e);
            }
        }

        const chat = ai.chats.create({
            model: 'gemini-3-flash-preview',
            config: {
                systemInstruction: systemInstruction,
            },
            history: historyForSdk
        });

        setChatSession(chat);
        
        if (initialUiHistory.length > 0) {
            setChatHistory(initialUiHistory);
        } else {
            // Initial greeting
            const greeting: Message = {
                id: 'init-greeting',
                role: "model",
                text: `Hi love! It's ${activeChar.name}. I'm so happy to see you. How is your day going? ❤️`
            };
            setChatHistory([greeting]);
            // Play initial greeting if not muted
            setTimeout(() => playResponseAudio(greeting.text), 1000);
        }
        
        setStep("chat");
    } catch (err: any) {
        console.error("Failed to start chat", err);
        setError("Failed to initialize chat session.");
    }
  };

  const sendMessage = async (textOverride?: string) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : inputMessage;
    if (!textToSend.trim() || !chatSession) return;

    // Ensure audio context is ready if user interacted here
    initAudio();

    const userMsgText = textToSend;
    const msgId = Date.now().toString();
    setInputMessage("");
    setQuickReplies([]); // Clear suggestions
    setShowGifPicker(false); // Close picker if open
    
    // 1. Add User message
    setChatHistory(prev => [...prev, { id: msgId, role: "user", text: userMsgText, status: "sent" }]);

    try {
      // 2. Simulate reading delay
      await new Promise(resolve => setTimeout(resolve, 600));

      // 3. Mark read and show typing
      setChatHistory(prev => {
         const newHistory = prev.map(msg => 
            (msg.id === msgId)
            ? { ...msg, status: 'read' as const } 
            : msg
         );
         return [...newHistory, { role: "model", text: "", isTyping: true }];
      });

      const response = await chatSession.sendMessageStream({ message: userMsgText });
      
      let fullResponse = "";
      
      for await (const chunk of response) {
        const text = chunk.text;
        if (text) {
            fullResponse += text;
            
            // Note: We don't parse the GIF tag during streaming to avoid flickering
            // We just show the raw text as it arrives
            setChatHistory(prev => {
                const newHistory = [...prev];
                const lastIdx = newHistory.length - 1;
                if (newHistory[lastIdx].role === "model") {
                     newHistory[lastIdx] = { 
                        role: "model", 
                        text: fullResponse, 
                        isTyping: false
                    };
                }
                return newHistory;
            });
        }
      }

      // 4. Post-process the full response to extract GIF tags and Replies
      
      // Extract Replies
      const replyRegex = /\[REPLY:\s*(.*?)\]/gi;
      const replies: string[] = [];
      let matchReply;
      while ((matchReply = replyRegex.exec(fullResponse)) !== null) {
          replies.push(matchReply[1].trim());
      }
      setQuickReplies(replies);

      // Regex to find [GIF: category] case insensitive
      const gifRegex = /\[GIF:\s*(\w+)\]/i;
      const match = fullResponse.match(gifRegex);
      let cleanText = fullResponse;
      let gifUrl = undefined;
      
      if (match) {
        const category = match[1].toLowerCase();
        const library = GIF_LIBRARY[category as keyof typeof GIF_LIBRARY];
        
        cleanText = fullResponse.replace(match[0], "").trim();
        if (library) {
            gifUrl = library[Math.floor(Math.random() * library.length)];
        }
      }
      
      // Remove Reply tags from the final text
      cleanText = cleanText.replace(replyRegex, "").trim();

      // Update the message one last time
      setChatHistory(prev => {
        const newHistory = [...prev];
        const lastIdx = newHistory.length - 1;
        if (newHistory[lastIdx].role === "model") {
            newHistory[lastIdx] = { 
                role: "model", 
                text: cleanText,
                gif: gifUrl,
                isTyping: false
            };
        }
        return newHistory;
      });

      // 5. Generate Audio for the final response (using cleaned text without [GIF] tags)
      if (!isMuted && cleanText) {
         playResponseAudio(cleanText);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => {
          const newHistory = [...prev];
          if (newHistory[newHistory.length - 1]?.isTyping) {
              newHistory[newHistory.length - 1] = { role: "model", text: "(Connection error... let's try that again?)", isTyping: false };
          } else {
              newHistory.push({ role: "model", text: "(Connection error... let's try that again?)" });
          }
          return newHistory;
      });
    }
  };

  const handleSendGif = async (url: string) => {
    setShowGifPicker(false);
    setGifSearchQuery(""); // Clear search
    setQuickReplies([]);
    const msgId = Date.now().toString();
    
    // Add user message with GIF
    // We send an empty text string to the model, or a description like "[Sent a GIF]"
    const userMessage: Message = { 
      id: msgId, 
      role: "user", 
      text: "", 
      gif: url, 
      status: "sent" 
    };
    
    setChatHistory(prev => [...prev, userMessage]);

    // Send context to AI so it knows user sent a GIF
    if (chatSession) {
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            setChatHistory(prev => [...prev, { role: "model", text: "", isTyping: true }]);
            
            // We tell the model what happened
            const response = await chatSession.sendMessageStream({ message: "[User sent a GIF image]" });
            
            let fullResponse = "";
            for await (const chunk of response) {
                const text = chunk.text;
                if (text) {
                    fullResponse += text;
                    setChatHistory(prev => {
                        const newHistory = [...prev];
                        const lastIdx = newHistory.length - 1;
                        if (newHistory[lastIdx].role === "model") {
                            newHistory[lastIdx] = { role: "model", text: fullResponse, isTyping: false };
                        }
                        return newHistory;
                    });
                }
            }
             
             // Extract Replies
             const replyRegex = /\[REPLY:\s*(.*?)\]/gi;
             const replies: string[] = [];
             let matchReply;
             while ((matchReply = replyRegex.exec(fullResponse)) !== null) {
                 replies.push(matchReply[1].trim());
             }
             setQuickReplies(replies);

             // Handle AI sending GIF in response to a GIF
             const gifRegex = /\[GIF:\s*(\w+)\]/i;
             const match = fullResponse.match(gifRegex);
             let cleanText = fullResponse;
             let gifUrl = undefined;

             if (match) {
                 const category = match[1].toLowerCase();
                 const library = GIF_LIBRARY[category as keyof typeof GIF_LIBRARY];
                 cleanText = fullResponse.replace(match[0], "").trim();
                 if (library) gifUrl = library[Math.floor(Math.random() * library.length)];
             }

             // Remove Reply tags
             cleanText = cleanText.replace(replyRegex, "").trim();

             setChatHistory(prev => {
                 const newHistory = [...prev];
                 const lastIdx = newHistory.length - 1;
                 if (newHistory[lastIdx].role === "model") {
                     newHistory[lastIdx] = { role: "model", text: cleanText, gif: gifUrl, isTyping: false };
                 }
                 return newHistory;
             });
             
             // Play Audio
             if(!isMuted && cleanText) {
                 playResponseAudio(cleanText);
             }

        } catch(e) {
            console.error(e);
        }
    }
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in your browser.");
        return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };
  
  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setChatBackground(reader.result as string);
            setShowBgPicker(false);
        };
        reader.readAsDataURL(file);
    }
  };

  const clearHistory = () => {
      if (confirm(`Are you sure you want to clear chat history with ${character.name}?`)) {
          const key = `ourdream_chat_${character.id}`;
          localStorage.removeItem(key);
          setChatHistory([]);
          // Restart chat session to clear context
          startChat();
      }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  const saveCharacterToStorage = (char: Character, img: string) => {
      const updatedChar = { ...char, imageUrl: img };
      setSavedCharacters(prev => {
          const existingIndex = prev.findIndex(c => c.id === char.id);
          const newList = [...prev];
          if (existingIndex >= 0) {
              newList[existingIndex] = updatedChar;
          } else {
              newList.push(updatedChar);
          }
          localStorage.setItem('ourdream_characters', JSON.stringify(newList));
          return newList;
      });
  };

  const deleteCharacter = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm("Are you sure you want to delete this character? This action cannot be undone.")) {
          setSavedCharacters(prev => {
              const newList = prev.filter(c => c.id !== id);
              localStorage.setItem('ourdream_characters', JSON.stringify(newList));
              return newList;
          });
          // Also remove chat history
          localStorage.removeItem(`ourdream_chat_${id}`);
          
          // If we deleted the current character, reset to create
          if (character.id === id) {
             handleCreateNew();
          }
      }
  };

  const handleCreateNew = () => {
      setCharacter({ ...defaultCharacter, id: Date.now().toString() });
      setGeneratedImage(null);
      setStep('create');
  };

  const loadCharacter = (char: Character) => {
      setCharacter(char);
      setGeneratedImage(char.imageUrl || null);
      setStep('chat');
      // Chat session will be initialized by startChat triggered via effect or we call it here?
      // Actually step 'chat' renders the chat view, but we need to init session.
      // Let's rely on a fresh startChat call logic which loads history.
      setTimeout(() => startChat(char), 100);
  };

  // --- Render Helpers ---

  const renderGallery = () => (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in flex flex-col items-center">
        <div className="max-w-6xl w-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-2">My Gallery</h1>
                    <p className="text-gray-400">Select a character to chat with or create a new one.</p>
                </div>
                <button 
                    onClick={handleCreateNew}
                    className={`px-6 py-3 bg-gradient-to-r from-${theme.primary}-500 to-${theme.secondary}-500 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2`}
                >
                    <LucidePlus size={20} /> Create New
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Create New Card (optional visual cue) */}
                <button 
                    onClick={handleCreateNew}
                    className="aspect-[3/4] bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-white/40 transition-all group"
                >
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <LucidePlus size={32} className="text-gray-400 group-hover:text-white" />
                    </div>
                    <span className="font-semibold text-gray-400 group-hover:text-white">Create New</span>
                </button>

                {savedCharacters.map(char => (
                    <div key={char.id} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-white/30 transition-all shadow-xl hover:shadow-2xl">
                        {char.imageUrl ? (
                            <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                                <LucideUser size={48} className="text-gray-600" />
                            </div>
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4">
                            <h3 className="text-xl font-bold text-white mb-0.5">{char.name}</h3>
                            <p className="text-sm text-gray-300 mb-4">{char.relationship}</p>
                            
                            <div className="flex gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                <button 
                                    onClick={() => loadCharacter(char)}
                                    className="flex-1 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <LucideMessageCircle size={16} /> Chat
                                </button>
                                <button 
                                    onClick={(e) => deleteCharacter(char.id, e)}
                                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                    title="Delete Character"
                                >
                                    <LucideTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );

  const renderCreationForm = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in relative">
      
      {/* Top Navigation */}
      <div className="absolute top-4 right-4 md:right-0">
         <button 
            onClick={() => setStep('gallery')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
         >
            <LucideLayoutGrid size={16} /> My Gallery
         </button>
      </div>

      <div className="text-center mb-10 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Design Your <span className="gradient-text" style={{ backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))` }}>Dream Partner</span></h1>
        {/* Note: Simplified gradient-text override above won-work easily with tailwind classes needing specific color names unless using style. 
            However, we can just use the classes.
        */}
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Design Your <span className={`bg-clip-text text-transparent bg-gradient-to-r from-${theme.primary}-400 to-${theme.secondary}-500`}>Dream Partner</span>
        </h1>
        <p className="text-gray-300">Create a unique AI companion with their own look, personality, and soul.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Basics & Appearance */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><LucideUser className={`text-${theme.primary}-500`} /> Identity</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input 
                  type="text" 
                  value={character.name}
                  onChange={e => setCharacter({...character, name: e.target.value})}
                  className={`w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-${theme.primary}-500 transition-colors`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Gender</label>
                  <select 
                    value={character.gender}
                    onChange={e => {
                        const newGender = e.target.value;
                        let nextVoice = character.voice;
                        // Smart switch voice default
                        if (newGender !== 'Non-binary') {
                             const currentVoiceObj = VOICE_OPTIONS.find(v => v.id === character.voice);
                             if (currentVoiceObj?.gender !== newGender) {
                                  nextVoice = VOICE_OPTIONS.find(v => v.gender === newGender)?.id || 'Kore';
                             }
                        }
                        setCharacter({...character, gender: newGender, voice: nextVoice});
                    }}
                    className={`w-full bg-black/30 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-${theme.primary}-500`}
                  >
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Relationship</label>
                  <select 
                    value={character.relationship}
                    onChange={e => setCharacter({...character, relationship: e.target.value})}
                    className={`w-full bg-black/30 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-${theme.primary}-500`}
                  >
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

               <div>
                  <label className="block text-sm text-gray-400 mb-1">Age: {character.age}</label>
                  <input 
                    type="range" min="18" max="60" 
                    value={character.age}
                    onChange={e => setCharacter({...character, age: parseInt(e.target.value)})}
                    className={`w-full accent-${theme.primary}-500`}
                  />
               </div>

              {/* Voice Selection */}
              <div>
                 <label className="block text-sm text-gray-400 mb-2 flex items-center gap-2">
                    <LucideVolume2 size={14} className={`text-${theme.secondary}-400`} /> Voice & Style
                 </label>
                 <div className="grid grid-cols-1 gap-2">
                    {VOICE_OPTIONS.filter(v => character.gender === 'Non-binary' || v.gender === character.gender).map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => setCharacter({...character, voice: opt.id})}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${character.voice === opt.id ? `bg-${theme.primary}-900/40 border-${theme.primary}-500 ring-1 ring-${theme.primary}-500` : 'bg-black/20 border-white/10 hover:border-white/30'}`}
                        >
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold">{opt.style}</span>
                                <span className="text-xs text-gray-400">{opt.gender} • {opt.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={(e) => playVoicePreview(e, opt.id)}
                                    className={`p-2 rounded-full hover:bg-white/20 transition-colors ${previewingVoice === opt.id ? `text-${theme.primary}-400` : 'text-gray-400'}`}
                                    title={previewingVoice === opt.id ? "Stop Preview" : "Preview Voice"}
                                >
                                    {previewingVoice === opt.id ? <LucideSquare size={16} fill="currentColor" /> : <LucidePlay size={16} fill="currentColor" />}
                                </button>
                                {character.voice === opt.id && <LucideCheck className={`text-${theme.primary}-500`} size={16} />}
                            </div>
                        </div>
                    ))}
                 </div>
              </div>

            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><LucideSparkles className={`text-${theme.secondary}-500`} /> Appearance</h2>
            
            <div className="grid grid-cols-2 gap-4 space-y-2">
               <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Art Style</label>
                  <select 
                    value={character.style}
                    onChange={e => setCharacter({...character, style: e.target.value})}
                    className={`w-full bg-black/30 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-${theme.primary}-500`}
                  >
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>

               <div>
                 <label className="block text-sm text-gray-400 mb-1">Hair Color</label>
                 <select value={character.hairColor} onChange={e => setCharacter({...character, hairColor: e.target.value})} className={`w-full bg-black/30 border border-white/10 rounded-lg p-2 focus:border-${theme.primary}-500`}>{HAIR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
               <div>
                 <label className="block text-sm text-gray-400 mb-1">Eye Color</label>
                 <select value={character.eyeColor} onChange={e => setCharacter({...character, eyeColor: e.target.value})} className={`w-full bg-black/30 border border-white/10 rounded-lg p-2 focus:border-${theme.primary}-500`}>{EYE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
               <div>
                 <label className="block text-sm text-gray-400 mb-1">Ethnicity</label>
                 <select value={character.ethnicity} onChange={e => setCharacter({...character, ethnicity: e.target.value})} className={`w-full bg-black/30 border border-white/10 rounded-lg p-2 focus:border-${theme.primary}-500`}>{ETHNICITIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
               <div>
                 <label className="block text-sm text-gray-400 mb-1">Body Type</label>
                 <select value={character.bodyType} onChange={e => setCharacter({...character, bodyType: e.target.value})} className={`w-full bg-black/30 border border-white/10 rounded-lg p-2 focus:border-${theme.primary}-500`}>{BODY_TYPES.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
            </div>
          </div>
        </div>

        {/* Right Column: Personality & Generate */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><LucideHeart className="text-red-500" /> Personality</h2>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-2">Personality Traits (Select up to 3)</label>
              <div className="flex flex-wrap gap-2">
                {PERSONALITY_TRAITS.map(trait => {
                  const isSelected = character.personality.includes(trait);
                  return (
                    <button
                      key={trait}
                      onClick={() => {
                        if (isSelected) {
                          setCharacter({...character, personality: character.personality.filter(t => t !== trait)});
                        } else {
                          if (character.personality.length < 3) {
                            setCharacter({...character, personality: [...character.personality, trait]});
                          }
                        }
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected ? `bg-gradient-to-r from-${theme.primary}-500 to-${theme.secondary}-500 text-white shadow-lg` : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}
                    >
                      {trait}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-grow">
              <label className="block text-sm text-gray-400 mb-2">Backstory & Bio</label>
              <textarea 
                value={character.bio}
                onChange={e => setCharacter({...character, bio: e.target.value})}
                className={`w-full h-32 md:h-48 bg-black/30 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-${theme.primary}-500 transition-colors resize-none`}
                placeholder={`Tell us about ${character.gender === 'Male' ? 'him' : 'her'}...`}
              />
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-2 text-sm text-red-200">
                    <LucideAlertCircle className="shrink-0 mt-0.5" size={16} />
                    <span>{error}</span>
                </div>
            )}

            <button 
              onClick={handleGenerateCharacter}
              disabled={loading}
              className={`mt-6 w-full py-4 bg-gradient-to-r from-${theme.primary}-500 to-${theme.secondary}-600 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-${theme.primary}-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? <><LucideLoader2 className="animate-spin" /> Generating image...</> : <><LucideSparkles /> Dream {character.gender === 'Male' ? 'Him' : 'Her'} Up</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl w-full bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row">
        
        {/* Image Side */}
        <div className="w-full md:w-1/2 relative h-96 md:h-auto bg-gray-900">
           {generatedImage ? (
             <img src={generatedImage} alt={character.name} className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r" />
           
           <div className="absolute bottom-6 left-6 right-6">
              <h2 className="text-3xl font-bold text-white mb-1">{character.name}, {character.age}</h2>
              <p className="text-gray-200 opacity-90">{character.relationship}</p>
           </div>
        </div>

        {/* Details Side */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
           <h3 className="text-xl font-bold mb-4 text-gray-200">Personality Profile</h3>
           
           <div className="flex flex-wrap gap-2 mb-6">
              {character.personality.map(t => (
                  <span key={t} className={`px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300 border border-white/5`}>{t}</span>
              ))}
           </div>

           <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
              {character.bio}
           </p>

           {/* Profile Picture Generation Section */}
           <div className="mb-6 flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 bg-white/5 flex-shrink-0">
                    {character.profileImageUrl ? (
                        <img src={character.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                         <LucideUser className="w-8 h-8 text-gray-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                    {loadingProfile && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <LucideLoader2 className="w-6 h-6 animate-spin text-white" />
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-semibold text-gray-300 mb-1">Profile Picture</h4>
                    <p className="text-xs text-gray-500 mb-2">Create a close-up icon for chat</p>
                    <button 
                        onClick={handleGenerateProfilePic}
                        disabled={loadingProfile}
                        className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 border border-white/10"
                    >
                        {character.profileImageUrl ? <><LucideRefreshCcw size={12}/> Regenerate</> : <><LucideSparkles size={12}/> Generate Icon</>}
                    </button>
                </div>
            </div>

           <div className="space-y-3 mt-auto">
              <button 
                onClick={() => startChat()}
                className={`w-full py-3 bg-gradient-to-r from-${theme.primary}-500 to-${theme.secondary}-500 rounded-xl font-bold text-white hover:shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2`}
              >
                <LucideMessageCircle size={20} /> Start Chatting
              </button>
              
              <button 
                onClick={() => setStep("create")}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-medium text-gray-300 transition-all flex items-center justify-center gap-2"
              >
                <LucideRefreshCcw size={18} /> Adjust & Regenerate
              </button>
           </div>
        </div>

      </div>
    </div>
  );

  const renderChat = () => (
    <div 
        className="flex flex-col h-screen overflow-hidden relative transition-all duration-500 bg-cover bg-center"
        style={{ 
            backgroundImage: chatBackground ? `url(${chatBackground})` : undefined,
            backgroundColor: !chatBackground ? '#000' : undefined 
        }}
    >
      {/* Overlay for readability if bg is set */}
      {chatBackground && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />}

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-md border-b border-white/5">
         <div className="flex items-center gap-3">
            <button onClick={() => setStep('gallery')} className="p-2 hover:bg-white/10 rounded-full text-gray-400 transition-colors">
                <LucideArrowLeft size={20} />
            </button>
            
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20">
                <img src={character.profileImageUrl || character.imageUrl || generatedImage || ""} alt={character.name} className="w-full h-full object-cover" />
            </div>
            
            <div>
                <h3 className="font-bold text-sm md:text-base flex items-center gap-2">
                    {character.name}
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </h3>
                <p className="text-xs text-gray-400">{character.relationship} • {character.personality[0]}</p>
            </div>
         </div>

         <div className="flex items-center gap-1 md:gap-2">
            <button 
                onClick={() => setIsMuted(!isMuted)} 
                className={`p-2 rounded-full transition-colors ${!isMuted ? 'text-green-400 hover:bg-green-400/10' : 'text-gray-400 hover:bg-white/10'}`}
                title={isMuted ? "Unmute Voice" : "Mute Voice"}
            >
                {isMuted ? <LucideVolumeX size={20} /> : <LucideVolume2 size={20} />}
            </button>
            <div className="relative">
                <button 
                    onClick={() => setShowBgPicker(!showBgPicker)} 
                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    title="Change Background"
                >
                    <LucideImage size={20} />
                </button>
                {showBgPicker && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 border border-white/10 rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-2">
                        <h4 className="text-sm font-semibold mb-3 text-gray-300">Choose Background</h4>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                            {BACKGROUND_OPTIONS.map(bg => (
                                <button 
                                    key={bg.id}
                                    onClick={() => { setChatBackground(bg.value); setShowBgPicker(false); }}
                                    className={`aspect-square rounded-lg border overflow-hidden hover:opacity-80 transition-all ${chatBackground === bg.value ? 'border-pink-500 ring-1 ring-pink-500' : 'border-white/10'}`}
                                >
                                    {bg.value ? <img src={bg.value} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-800 flex items-center justify-center"><LucideX size={14} /></div>}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <input 
                                type="file" 
                                ref={bgFileInputRef}
                                onChange={handleBgUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <button 
                                onClick={() => bgFileInputRef.current?.click()}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <LucideUpload size={14} /> Upload Custom
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <button 
                onClick={clearHistory}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                title="Clear Chat History"
            >
                <LucideTrash2 size={20} />
            </button>
         </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
         {chatHistory.map((msg, idx) => {
             const isUser = msg.role === 'user';
             return (
                 <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                     <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                         {/* Avatar */}
                         <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 bg-black/50">
                             {isUser ? (
                                 <div className="w-full h-full bg-gray-700 flex items-center justify-center"><LucideUser size={14} /></div>
                             ) : (
                                 <img src={character.profileImageUrl || character.imageUrl || generatedImage || ""} className="w-full h-full object-cover" />
                             )}
                         </div>

                         {/* Bubble */}
                         <div 
                            className={`p-3 md:p-4 rounded-2xl relative group ${
                                isUser 
                                ? `bg-gradient-to-br from-${theme.primary}-600 to-${theme.primary}-700 text-white rounded-tr-none` 
                                : `bg-white/10 backdrop-blur-md border border-white/5 text-gray-100 rounded-tl-none`
                            }`}
                         >
                            {msg.gif ? (
                                <div className="rounded-lg overflow-hidden mb-2 max-w-[200px]">
                                    <img src={msg.gif} alt="GIF" className="w-full h-full object-cover" />
                                </div>
                            ) : null}
                            
                            {msg.isTyping ? (
                                <div className="flex gap-1 h-5 items-center px-1">
                                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            ) : (
                                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text.replace(/\[(GIF|REPLY):.*?\]/gi, "").trim()}</p>
                            )}

                             {/* Status Indicators for User */}
                             {isUser && msg.status && (
                                 <div className="absolute bottom-1 left-[-24px] text-gray-500">
                                     {msg.status === 'read' ? (
                                         <LucideCheckCheck size={14} className="text-blue-400 animate-check-pop" /> 
                                     ) : (
                                         <LucideCheck size={14} className="opacity-70 animate-scale-in" />
                                     )}
                                 </div>
                             )}

                             {/* TTS Play Button for Model messages */}
                             {!isUser && !msg.isTyping && msg.text && (
                                 <button 
                                    onClick={() => playResponseAudio(msg.text)}
                                    className="absolute -right-8 bottom-0 p-1.5 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                 >
                                     <LucideVolume2 size={14} />
                                 </button>
                             )}
                         </div>
                     </div>
                 </div>
             );
         })}
         <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative z-10 p-4 bg-black/60 backdrop-blur-xl border-t border-white/10">
         {/* GIF Picker Popover */}
         {showGifPicker && (
             <div className="absolute bottom-full left-4 mb-4 w-72 md:w-80 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in">
                 <div className="p-3 border-b border-white/10 flex gap-2">
                     <LucideSearch className="text-gray-400" size={18} />
                     <input 
                        className="bg-transparent w-full text-sm focus:outline-none text-white placeholder-gray-500"
                        placeholder="Search emotion..."
                        value={gifSearchQuery}
                        onChange={(e) => setGifSearchQuery(e.target.value)}
                        autoFocus
                     />
                     <button onClick={() => setShowGifPicker(false)} className="text-gray-400 hover:text-white"><LucideX size={16} /></button>
                 </div>
                 <div className="h-64 overflow-y-auto p-2 grid grid-cols-2 gap-2 scrollbar-thin scrollbar-thumb-white/10">
                    {/* Render Categories if no search */}
                    {!gifSearchQuery && Object.keys(GIF_LIBRARY).map(cat => (
                         <div key={cat} onClick={() => setGifSearchQuery(cat)} className="cursor-pointer bg-white/5 hover:bg-white/10 rounded-lg p-2 text-center border border-white/5 transition-colors">
                             <span className="capitalize text-sm font-medium text-gray-300">{cat}</span>
                         </div>
                    ))}
                    {/* Render GIFs if search matches category */}
                    {gifSearchQuery && GIF_LIBRARY[gifSearchQuery as keyof typeof GIF_LIBRARY] && (
                        GIF_LIBRARY[gifSearchQuery as keyof typeof GIF_LIBRARY].map((url, i) => (
                            <img 
                                key={i} 
                                src={url} 
                                onClick={() => handleSendGif(url)}
                                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity border border-white/5"
                            />
                        ))
                    )}
                     {/* Empty State */}
                    {gifSearchQuery && !GIF_LIBRARY[gifSearchQuery as keyof typeof GIF_LIBRARY] && (
                        <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                            No GIFs found for "{gifSearchQuery}". <br/> Try: happy, love, sad, dance...
                        </div>
                    )}
                 </div>
             </div>
         )}
         
         <div className="max-w-4xl mx-auto">
             {/* Quick Replies */}
             {quickReplies.length > 0 && (
                 <div className="flex gap-2 mb-3 overflow-x-auto pb-2 scrollbar-hide">
                     {quickReplies.map((reply, i) => (
                         <button
                             key={i}
                             onClick={() => sendMessage(reply)}
                             className={`px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-sm text-gray-200 whitespace-nowrap transition-colors animate-fade-in`}
                             style={{ animationDelay: `${i * 100}ms` }}
                         >
                             {reply}
                         </button>
                     ))}
                 </div>
             )}

             <div className="flex items-end gap-2">
                <button 
                    onClick={() => setShowGifPicker(!showGifPicker)}
                    className={`p-3 rounded-xl transition-colors ${showGifPicker ? `bg-${theme.primary}-500/20 text-${theme.primary}-400` : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <LucideLayoutGrid size={20} />
                </button>
                
                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl flex items-center p-2 focus-within:bg-white/10 focus-within:border-white/20 transition-all">
                    <textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={`Message ${character.name}...`}
                        className="w-full bg-transparent border-none focus:outline-none text-white p-2 max-h-32 min-h-[44px] resize-none scrollbar-hide"
                        rows={1}
                    />
                </div>

                <button 
                    onClick={handleMicClick}
                    className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                >
                    <LucideMic size={20} />
                </button>

                <button 
                    onClick={() => sendMessage()}
                    disabled={!inputMessage.trim()}
                    className={`p-3 rounded-xl transition-all ${inputMessage.trim() ? `bg-gradient-to-r from-${theme.primary}-500 to-${theme.secondary}-500 text-white shadow-lg` : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                >
                    <LucideSend size={20} />
                </button>
             </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-gray-100">
      {step === "create" && renderCreationForm()}
      {step === "preview" && renderPreview()}
      {step === "chat" && renderChat()}
      {step === "gallery" && renderGallery()}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}