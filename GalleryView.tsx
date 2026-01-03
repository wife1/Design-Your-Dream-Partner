import React, { useState, useMemo } from 'react';
import { LucidePlus, LucideUser, LucideMessageCircle, LucideTrash2, LucideSearch, LucideArrowUpDown } from 'lucide-react';
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
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "relationship">("newest");

    const processedCharacters = useMemo(() => {
        // Filter by search query
        let result = savedCharacters.filter(char => 
            char.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Sort based on selection
        result.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'relationship':
                    return a.relationship.localeCompare(b.relationship);
                case 'oldest':
                    return parseInt(a.id) - parseInt(b.id);
                case 'newest':
                default:
                    // Assuming ID is timestamp-based (Date.now())
                    return parseInt(b.id) - parseInt(a.id);
            }
        });

        return result;
    }, [savedCharacters, searchQuery, sortBy]);

    return (
    <div className="min-h-screen p-4 md:p-8 animate-fade-in flex flex-col items-center">
        <div className="max-w-6xl w-full">
            <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-6">
                <div className="flex-1 w-full xl:w-auto text-center xl:text-left">
                    <h1 className="text-4xl font-bold mb-2">My Gallery</h1>
                    <p className="text-gray-400">Select a character to chat with or create a new one.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
                    {/* Search Bar */}
                    <div className="relative w-full md:w-64">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Search characters..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-white/30 transition-colors text-white placeholder-gray-500"
                        />
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative w-full md:w-48">
                         <LucideArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                         <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-8 focus:outline-none focus:border-white/30 transition-colors text-white appearance-none cursor-pointer"
                         >
                            <option value="newest" className="bg-gray-900 text-gray-100">Newest First</option>
                            <option value="oldest" className="bg-gray-900 text-gray-100">Oldest First</option>
                            <option value="name" className="bg-gray-900 text-gray-100">Name (A-Z)</option>
                            <option value="relationship" className="bg-gray-900 text-gray-100">Relationship</option>
                         </select>
                         <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                         </div>
                    </div>

                    <button 
                        onClick={handleCreateNew}
                        className={`w-full md:w-auto px-6 py-3 bg-gradient-to-r from-${theme.primary}-500 to-${theme.secondary}-500 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap`}
                    >
                        <LucidePlus size={20} /> Create New
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                <button 
                    onClick={handleCreateNew}
                    className="aspect-[3/4] bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-white/10 hover:border-white/40 hover:scale-[1.02] transition-all duration-300 group"
                >
                    <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                        <LucidePlus size={32} className="text-gray-400 group-hover:text-white" />
                    </div>
                    <span className="font-semibold text-gray-400 group-hover:text-white">Create New</span>
                </button>

                {processedCharacters.map(char => (
                    <div 
                        key={char.id} 
                        className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-black/40 border border-white/10 hover:border-pink-500/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 hover:scale-[1.02] cursor-pointer"
                        onClick={() => loadCharacter(char)}
                    >
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
                                    onClick={(e) => { e.stopPropagation(); loadCharacter(char); }}
                                    className="flex-1 py-2 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm transform active:scale-95"
                                >
                                    <LucideMessageCircle size={16} /> Chat
                                </button>
                                <button 
                                    onClick={(e) => deleteCharacter(char.id, e)}
                                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors transform active:scale-95"
                                    title="Delete Character"
                                >
                                    <LucideTrash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                
                {processedCharacters.length === 0 && searchQuery && (
                     <div className="col-span-full py-12 text-center text-gray-500">
                        <p>No characters found matching "{searchQuery}"</p>
                     </div>
                )}
            </div>
        </div>
    </div>
    );
};
