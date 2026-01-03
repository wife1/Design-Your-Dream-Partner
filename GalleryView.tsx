import React from 'react';
import { LucidePlus, LucideUser, LucideMessageCircle, LucideTrash2 } from 'lucide-react';
import { Character } from './types';

interface GalleryViewProps {
  savedCharacters: Character[];
  theme: any;
  handleCreateNew: () => void;
  loadCharacter: (char: Character) => void;
  deleteCharacter: (id: string, e: React.MouseEvent) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({ 
    savedCharacters, 
    theme, 
    handleCreateNew, 
    loadCharacter, 
    deleteCharacter 
}) => (
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
