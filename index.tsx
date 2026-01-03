import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { GoogleGenAI } from "@google/genai";
import { LucideHeart, LucideMessageCircle, LucideSparkles, LucideUser, LucideArrowRight, LucideRefreshCcw, LucideSend, LucideArrowLeft, LucideLoader2 } from "lucide-react";

// --- Types ---

type Character = {
  name: string;
  age: number;
  relationship: string;
  style: string;
  hairColor: string;
  eyeColor: string;
  ethnicity: string;
  bodyType: string;
  personality: string[];
  bio: string;
};

type Message = {
  role: "user" | "model";
  text: string;
};

// --- Constants ---

const RELATIONSHIPS = ["Girlfriend", "Wife", "Best Friend", "Mentor", "Secret Admirer"];
const STYLES = ["Realistic Photo", "Anime", "Digital Art", "Cyberpunk", "Oil Painting"];
const HAIR_COLORS = ["Blonde", "Brunette", "Black", "Red", "Pink", "Silver", "Blue"];
const EYE_COLORS = ["Blue", "Green", "Brown", "Hazel", "Gray", "Purple"];
const ETHNICITIES = ["Caucasian", "Asian", "Latina", "Black", "Middle Eastern", "Mixed"];
const BODY_TYPES = ["Slim", "Athletic", "Curvy", "Average", "Petite"];
const PERSONALITY_TRAITS = [
  "Sweet", "Shy", "Confident", "Sassy", "Intelligent", "Caring", 
  "Adventurous", "Playful", "Mysterious", "Tsundere", "Motherly"
];

// --- Components ---

function App() {
  // State
  const [step, setStep] = useState<"create" | "preview" | "chat">("create");
  const [loading, setLoading] = useState(false);
  const [character, setCharacter] = useState<Character>({
    name: "Luna",
    age: 24,
    relationship: "Girlfriend",
    style: "Realistic Photo",
    hairColor: "Silver",
    eyeColor: "Blue",
    ethnicity: "Caucasian",
    bodyType: "Slim",
    personality: ["Sweet", "Intelligent"],
    bio: "I love reading books in cozy cafes and talking about the universe.",
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [chatSession, setChatSession] = useState<any>(null); // Type 'any' for simplicity with the SDK wrapper here

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // --- Actions ---

  const handleGenerateCharacter = async () => {
    setLoading(true);
    try {
      // Construct prompt for image generation
      const prompt = `A high quality ${character.style} portrait of a ${character.age} year old ${character.ethnicity} woman, ${character.hairColor} hair, ${character.eyeColor} eyes, ${character.bodyType} build. She looks ${character.personality.join(", ")}. Soft lighting, detailed textures, aesthetically pleasing, 8k resolution, centered composition.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: "3:4"
          }
        }
      });

      // Extract image
      let imageUrl = null;
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
          break;
        }
      }

      if (imageUrl) {
        setGeneratedImage(imageUrl);
        setStep("preview");
      } else {
        alert("Failed to generate image. Please try again.");
      }

    } catch (error) {
      console.error("Error generating character:", error);
      alert("Something went wrong with the generation. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  const startChat = () => {
    // Initialize Chat Session
    const systemInstruction = `You are ${character.name}, a ${character.age}-year-old female. 
    You are the user's ${character.relationship}. 
    Appearance: ${character.ethnicity}, ${character.hairColor} hair, ${character.eyeColor} eyes.
    Personality: ${character.personality.join(", ")}. 
    Bio: ${character.bio}.
    
    Roleplay Instructions:
    - Stay in character at all times.
    - Be affectionate, engaging, and personal.
    - Your responses should be conversational (1-3 sentences typically), unless a deep topic is discussed.
    - Do not sound like a robotic AI assistant. Use emojis occasionally if it fits the personality.
    - Reference your backstory or relationship status naturally.
    `;

    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      }
    });

    setChatSession(chat);
    
    // Initial greeting
    setChatHistory([{
      role: "model",
      text: `Hi love! It's ${character.name}. I'm so happy to see you. How is your day going? ❤️`
    }]);
    
    setStep("chat");
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatSession) return;

    const userMsg = inputMessage;
    setInputMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: userMsg }]);

    try {
      const response = await chatSession.sendMessageStream({ message: userMsg });
      
      let fullResponse = "";
      setChatHistory(prev => [...prev, { role: "model", text: "..." }]); // Placeholder

      for await (const chunk of response) {
        fullResponse += chunk.text;
        // Update the last message with the growing text
        setChatHistory(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1] = { role: "model", text: fullResponse };
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChatHistory(prev => [...prev, { role: "model", text: "(Connection error... let's try that again?)" }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') sendMessage();
  };

  // --- Render Helpers ---

  const renderCreationForm = () => (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Design Your <span className="gradient-text">Dream Partner</span></h1>
        <p className="text-gray-300">Create a unique AI companion with their own look, personality, and soul.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Basics & Appearance */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><LucideUser className="text-pink-500" /> Identity</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input 
                  type="text" 
                  value={character.name}
                  onChange={e => setCharacter({...character, name: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-pink-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Age: {character.age}</label>
                  <input 
                    type="range" min="18" max="60" 
                    value={character.age}
                    onChange={e => setCharacter({...character, age: parseInt(e.target.value)})}
                    className="w-full accent-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Relationship</label>
                  <select 
                    value={character.relationship}
                    onChange={e => setCharacter({...character, relationship: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-pink-500"
                  >
                    {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><LucideSparkles className="text-purple-500" /> Appearance</h2>
            
            <div className="grid grid-cols-2 gap-4 space-y-2">
               <div className="col-span-2">
                  <label className="block text-sm text-gray-400 mb-1">Art Style</label>
                  <select 
                    value={character.style}
                    onChange={e => setCharacter({...character, style: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 focus:outline-none focus:border-pink-500"
                  >
                    {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
               </div>

               <div>
                 <label className="block text-sm text-gray-400 mb-1">Hair Color</label>
                 <select value={character.hairColor} onChange={e => setCharacter({...character, hairColor: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 focus:border-pink-500">{HAIR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
               <div>
                 <label className="block text-sm text-gray-400 mb-1">Eye Color</label>
                 <select value={character.eyeColor} onChange={e => setCharacter({...character, eyeColor: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 focus:border-pink-500">{EYE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
               <div>
                 <label className="block text-sm text-gray-400 mb-1">Ethnicity</label>
                 <select value={character.ethnicity} onChange={e => setCharacter({...character, ethnicity: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 focus:border-pink-500">{ETHNICITIES.map(c => <option key={c} value={c}>{c}</option>)}</select>
               </div>
               <div>
                 <label className="block text-sm text-gray-400 mb-1">Body Type</label>
                 <select value={character.bodyType} onChange={e => setCharacter({...character, bodyType: e.target.value})} className="w-full bg-black/30 border border-white/10 rounded-lg p-2 focus:border-pink-500">{BODY_TYPES.map(c => <option key={c} value={c}>{c}</option>)}</select>
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
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg' : 'bg-white/10 hover:bg-white/20 text-gray-300'}`}
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
                className="w-full h-32 md:h-48 bg-black/30 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-pink-500 transition-colors resize-none"
                placeholder="Tell us about her..."
              />
            </div>

            <button 
              onClick={handleGenerateCharacter}
              disabled={loading}
              className="mt-6 w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <LucideLoader2 className="animate-spin" /> : <><LucideSparkles /> Dream Her Up</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Image Preview */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
            {generatedImage ? (
              <img src={generatedImage} alt="Generated Character" className="w-full h-auto object-cover" />
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
        </div>

        {/* Info & Action */}
        <div className="space-y-6 text-center md:text-left">
          <div>
            <h1 className="text-5xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{character.name}</h1>
            <p className="text-xl text-pink-400">{character.age} • {character.relationship} • {character.personality.join(" & ")}</p>
          </div>
          
          <p className="text-gray-300 leading-relaxed text-lg italic">
            "{character.bio}"
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
             <button 
              onClick={startChat}
              className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              <LucideMessageCircle /> Start Chatting
            </button>
            <button 
              onClick={() => setStep("create")}
              className="px-8 py-3 border border-white/20 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <LucideRefreshCcw size={18} /> Edit / Regenerate
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  const renderChat = () => (
    <div className="h-screen flex flex-col md:flex-row bg-gray-900 animate-fade-in overflow-hidden">
      
      {/* Sidebar / Topbar (Character Info) */}
      <div className="w-full md:w-80 bg-gray-950 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-3">
           <button onClick={() => setStep("preview")} className="p-2 hover:bg-white/10 rounded-full"><LucideArrowLeft size={20}/></button>
           <h3 className="font-bold">Chat Session</h3>
        </div>
        
        <div className="p-6 flex flex-col items-center overflow-y-auto custom-scrollbar">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-pink-500 mb-4 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
            <img src={generatedImage!} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-2xl font-bold">{character.name}</h2>
          <span className="text-sm text-pink-400 mb-4">{character.relationship}</span>
          
          <div className="w-full space-y-3">
             <div className="glass-panel p-3 rounded-lg text-sm">
                <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Traits</span>
                {character.personality.join(", ")}
             </div>
             <div className="glass-panel p-3 rounded-lg text-sm">
                <span className="text-gray-400 block text-xs uppercase tracking-wider mb-1">Bio</span>
                {character.bio}
             </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0f0c29]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${
                  msg.role === "user" 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-none" 
                  : "bg-white/10 text-gray-100 rounded-bl-none backdrop-blur-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-gray-950 border-t border-white/10">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
             <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message ${character.name}...`}
              className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-3 focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all"
            />
            <button 
              onClick={sendMessage}
              disabled={!inputMessage.trim()}
              className="p-3 bg-pink-500 rounded-full hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
