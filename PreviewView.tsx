import React from 'react';
import { LucideUser, LucideLoader2, LucideRefreshCcw, LucideSparkles, LucideMessageCircle } from 'lucide-react';
import { Character } from './types';

interface PreviewViewProps {
  character: Character;
  generatedImage: string | null;
  loadingProfile: boolean;
  handleGenerateProfilePic: () => void;
  startChat: (char?: Character) => void;
  setStep: (s: any) => void;
  theme: any;
}

export const PreviewView: React.FC<PreviewViewProps> = ({
    character,
    generatedImage,
    loadingProfile,
    handleGenerateProfilePic,
    startChat,
    setStep,
    theme
}) => (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl w-full bg-black/40 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row">
        
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
