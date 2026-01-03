import React, { useRef, useEffect } from 'react';
import { LucideArrowLeft, LucideVolume2, LucideVolumeX, LucideImage, LucideX, LucideUpload, LucideTrash2, LucideUser, LucideCheck, LucideCheckCheck, LucideSearch, LucideLayoutGrid, LucideMic, LucideSend } from 'lucide-react';
import { Character, Message } from './types';
import { GIF_LIBRARY, BACKGROUND_OPTIONS } from './constants';

interface ChatViewProps {
    character: Character;
    generatedImage: string | null;
    chatHistory: Message[];
    inputMessage: string;
    setInputMessage: (s: string) => void;
    sendMessage: (text?: string) => void;
    handleMicClick: () => void;
    isListening: boolean;
    showGifPicker: boolean;
    setShowGifPicker: (b: boolean) => void;
    gifSearchQuery: string;
    setGifSearchQuery: (s: string) => void;
    quickReplies: string[];
    handleSendGif: (url: string) => void;
    isMuted: boolean;
    setIsMuted: (b: boolean) => void;
    chatBackground: string;
    setChatBackground: (s: string) => void;
    showBgPicker: boolean;
    setShowBgPicker: (b: boolean) => void;
    clearHistory: () => void;
    setStep: (s: any) => void;
    playResponseAudio: (text: string) => void;
    theme: any;
}

export const ChatView: React.FC<ChatViewProps> = ({
    character,
    generatedImage,
    chatHistory,
    inputMessage,
    setInputMessage,
    sendMessage,
    handleMicClick,
    isListening,
    showGifPicker,
    setShowGifPicker,
    gifSearchQuery,
    setGifSearchQuery,
    quickReplies,
    handleSendGif,
    isMuted,
    setIsMuted,
    chatBackground,
    setChatBackground,
    showBgPicker,
    setShowBgPicker,
    clearHistory,
    setStep,
    playResponseAudio,
    theme
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const bgFileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory, showGifPicker, quickReplies]);
    
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
    
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
    <div 
        className="flex flex-col h-screen overflow-hidden relative transition-all duration-500 bg-cover bg-center"
        style={{ 
            backgroundImage: chatBackground ? `url(${chatBackground})` : undefined,
            backgroundColor: !chatBackground ? '#000' : undefined 
        }}
    >
      {chatBackground && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-0" />}

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

      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
         {chatHistory.map((msg, idx) => {
             const isUser = msg.role === 'user';
             return (
                 <div key={idx} className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
                     <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                         <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border border-white/10 bg-black/50">
                             {isUser ? (
                                 <div className="w-full h-full bg-gray-700 flex items-center justify-center"><LucideUser size={14} /></div>
                             ) : (
                                 <img src={character.profileImageUrl || character.imageUrl || generatedImage || ""} className="w-full h-full object-cover" />
                             )}
                         </div>

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

                             {isUser && msg.status && (
                                 <div className="absolute bottom-1 left-[-24px] text-gray-500">
                                     {msg.status === 'read' ? (
                                         <LucideCheckCheck size={14} className="text-blue-400 animate-check-pop" /> 
                                     ) : (
                                         <LucideCheck size={14} className="opacity-70 animate-scale-in" />
                                     )}
                                 </div>
                             )}

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

      <div className="relative z-10 p-4 bg-black/60 backdrop-blur-xl border-t border-white/10">
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
                    {!gifSearchQuery && Object.keys(GIF_LIBRARY).map(cat => (
                         <div key={cat} onClick={() => setGifSearchQuery(cat)} className="cursor-pointer bg-white/5 hover:bg-white/10 rounded-lg p-2 text-center border border-white/5 transition-colors">
                             <span className="capitalize text-sm font-medium text-gray-300">{cat}</span>
                         </div>
                    ))}
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
                    {gifSearchQuery && !GIF_LIBRARY[gifSearchQuery as keyof typeof GIF_LIBRARY] && (
                        <div className="col-span-2 text-center py-8 text-gray-500 text-sm">
                            No GIFs found for "{gifSearchQuery}". <br/> Try: happy, love, sad, dance...
                        </div>
                    )}
                 </div>
             </div>
         )}
         
         <div className="max-w-4xl mx-auto">
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
}
