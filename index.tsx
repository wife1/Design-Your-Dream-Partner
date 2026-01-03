import React, { useState, useRef, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";

import { Character, Message } from './types';
import { THEMES, VOICE_OPTIONS, GIF_LIBRARY } from './constants';
import { decodeBase64, pcmToAudioBuffer } from './utils';

import { GalleryView } from './GalleryView';
import { CreationView } from './CreationView';
import { PreviewView } from './PreviewView';
import { ChatView } from './ChatView';

// --- Main App ---

function App() {
  // State
  const [step, setStep] = useState<"create" | "preview" | "chat" | "gallery">("create");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Character State
  const defaultCharacter: Character = {
    id: "",
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

  // Audio State
  const [isMuted, setIsMuted] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);

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
    
    if (selectedTheme === THEMES.default) {
        if (character.hairColor === "Red") selectedTheme = THEMES.passionate;
        if (character.hairColor === "Blue") selectedTheme = THEMES.cool;
        if (character.hairColor === "Green") selectedTheme = THEMES.nature;
        if (character.hairColor === "Pink") selectedTheme = THEMES.default;
    }
    
    return selectedTheme;
  }, [character.personality, character.hairColor]);

  useEffect(() => {
      document.body.style.backgroundImage = theme.bgGradient;
  }, [theme]);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
      const key = `ourdream_chat_${character.id}`;
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

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) return;

        const audioBytes = decodeBase64(base64Audio);
        const audioBuffer = await pcmToAudioBuffer(audioBytes, audioContext, 24000);
        
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
      const genderTerm = character.gender === 'Male' ? 'man' : character.gender === 'Female' ? 'woman' : 'person';
      
      const prompt = `A high quality ${character.style} portrait of a ${character.age} year old ${character.ethnicity} ${genderTerm}, ${character.hairColor} hair, ${character.eyeColor} eyes, ${character.bodyType} build. Looking ${character.personality.join(", ")}. Soft lighting, detailed textures, aesthetically pleasing, 8k resolution, centered composition.`;
      
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: "3:4",
          outputMimeType: "image/jpeg"
        }
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
          const base64EncodeString = response.generatedImages[0].image.imageBytes;
          const imageUrl = `data:image/jpeg;base64,${base64EncodeString}`;
          setGeneratedImage(imageUrl);
          setStep("preview");
      } else {
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

  const startChat = (charToLoad?: Character) => {
    const activeChar = charToLoad || character;
    const activeImage = charToLoad?.imageUrl || generatedImage;

    setError(null);
    try {
        initAudio();

        if (activeImage) {
            saveCharacterToStorage(activeChar, activeImage);
        }

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

        let historyForSdk: any[] = [];
        let initialUiHistory: Message[] = [];
        const key = `ourdream_chat_${activeChar.id}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                initialUiHistory = JSON.parse(saved);
                historyForSdk = initialUiHistory.map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.text }]
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
            const greeting: Message = {
                id: 'init-greeting',
                role: "model",
                text: `Hi love! It's ${activeChar.name}. I'm so happy to see you. How is your day going? ❤️`
            };
            setChatHistory([greeting]);
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

    initAudio();

    const userMsgText = textToSend;
    const msgId = Date.now().toString();
    setInputMessage("");
    setQuickReplies([]);
    setShowGifPicker(false);
    
    setChatHistory(prev => [...prev, { id: msgId, role: "user", text: userMsgText, status: "sent" }]);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

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

      const replyRegex = /\[REPLY:\s*(.*?)\]/gi;
      const replies: string[] = [];
      let matchReply;
      while ((matchReply = replyRegex.exec(fullResponse)) !== null) {
          replies.push(matchReply[1].trim());
      }
      setQuickReplies(replies);

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
      
      cleanText = cleanText.replace(replyRegex, "").trim();

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
    setGifSearchQuery("");
    setQuickReplies([]);
    const msgId = Date.now().toString();
    
    const userMessage: Message = { 
      id: msgId, 
      role: "user", 
      text: "", 
      gif: url, 
      status: "sent" 
    };
    
    setChatHistory(prev => [...prev, userMessage]);

    if (chatSession) {
        try {
            await new Promise(resolve => setTimeout(resolve, 600));
            setChatHistory(prev => [...prev, { role: "model", text: "", isTyping: true }]);
            
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
             
             const replyRegex = /\[REPLY:\s*(.*?)\]/gi;
             const replies: string[] = [];
             let matchReply;
             while ((matchReply = replyRegex.exec(fullResponse)) !== null) {
                 replies.push(matchReply[1].trim());
             }
             setQuickReplies(replies);

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

             cleanText = cleanText.replace(replyRegex, "").trim();

             setChatHistory(prev => {
                 const newHistory = [...prev];
                 const lastIdx = newHistory.length - 1;
                 if (newHistory[lastIdx].role === "model") {
                     newHistory[lastIdx] = { role: "model", text: cleanText, gif: gifUrl, isTyping: false };
                 }
                 return newHistory;
             });
             
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
  
  const clearHistory = () => {
      if (confirm(`Are you sure you want to clear chat history with ${character.name}?`)) {
          const key = `ourdream_chat_${character.id}`;
          localStorage.removeItem(key);
          setChatHistory([]);
          startChat();
      }
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
          localStorage.removeItem(`ourdream_chat_${id}`);
          
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
      setTimeout(() => startChat(char), 100);
  };

  return (
    <div className="min-h-screen text-gray-100">
      {step === "create" && (
        <CreationView
          character={character}
          setCharacter={setCharacter}
          theme={theme}
          loading={loading}
          error={error}
          handleGenerateCharacter={handleGenerateCharacter}
          setStep={setStep}
          playVoicePreview={playVoicePreview}
          previewingVoice={previewingVoice}
        />
      )}
      
      {step === "preview" && (
        <PreviewView
          character={character}
          generatedImage={generatedImage}
          loadingProfile={loadingProfile}
          handleGenerateProfilePic={handleGenerateProfilePic}
          startChat={startChat}
          setStep={setStep}
          theme={theme}
        />
      )}
      
      {step === "chat" && (
        <ChatView
          character={character}
          generatedImage={generatedImage}
          chatHistory={chatHistory}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          sendMessage={sendMessage}
          handleMicClick={handleMicClick}
          isListening={isListening}
          showGifPicker={showGifPicker}
          setShowGifPicker={setShowGifPicker}
          gifSearchQuery={gifSearchQuery}
          setGifSearchQuery={setGifSearchQuery}
          quickReplies={quickReplies}
          handleSendGif={handleSendGif}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
          chatBackground={chatBackground}
          setChatBackground={setChatBackground}
          showBgPicker={showBgPicker}
          setShowBgPicker={setShowBgPicker}
          clearHistory={clearHistory}
          setStep={setStep}
          playResponseAudio={playResponseAudio}
          theme={theme}
        />
      )}
      
      {step === "gallery" && (
        <GalleryView
          savedCharacters={savedCharacters}
          theme={theme}
          handleCreateNew={handleCreateNew}
          loadCharacter={loadCharacter}
          deleteCharacter={deleteCharacter}
        />
      )}
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
