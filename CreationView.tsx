import React from 'react';
import { LucideLayoutGrid, LucideUser, LucideVolume2, LucideSquare, LucidePlay, LucideCheck, LucideSparkles, LucideHeart, LucideLoader2, LucideAlertCircle } from 'lucide-react';
import { Character } from './types';
import { GENDERS, RELATIONSHIPS, VOICE_OPTIONS, STYLES, HAIR_COLORS, EYE_COLORS, ETHNICITIES, BODY_TYPES, PERSONALITY_TRAITS } from './constants';

interface CreationViewProps {
  character: Character;
  setCharacter: (c: Character) => void;
  theme: any;
  loading: boolean;
  error: string | null;
  handleGenerateCharacter: () => void;
  setStep: (s: any) => void;
  playVoicePreview: (e: React.MouseEvent, id: string) => void;
  previewingVoice: string | null;
}

export const CreationView: React.FC<CreationViewProps> = ({
    character,
    setCharacter,
    theme,
    loading,
    error,
    handleGenerateCharacter,
    setStep,
    playVoicePreview,
    previewingVoice
}) => (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-fade-in relative">
      <div className="absolute top-4 right-4 md:right-0">
         <button 
            onClick={() => setStep('gallery')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
         >
            <LucideLayoutGrid size={16} /> My Gallery
         </button>
      </div>

      <div className="text-center mb-10 mt-8">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Design Your <span className={`bg-clip-text text-transparent bg-gradient-to-r from-${theme.primary}-400 to-${theme.secondary}-500`}>Dream Partner</span>
        </h1>
        <p className="text-gray-300">Create a unique AI companion with their own look, personality, and soul.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
