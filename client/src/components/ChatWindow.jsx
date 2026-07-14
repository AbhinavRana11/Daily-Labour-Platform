import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Send, Image, Smile, Phone, MessageSquare, ShieldCheck, X } from 'lucide-react';
import { motion } from 'framer-motion';

const getAvatarUrl = (username) => {
    const avatars = [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200", // Female
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200", // Male
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=200", // Male
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200", // Female
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200", // Male
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200"  // Female
    ];
    const index = Math.abs(username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % avatars.length;
    return avatars[index];
};

const ChatWindow = ({ chat, messages = [], onSendMessage, currentUser, typingUser, onTyping }) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    
    const isWorker = currentUser.role === 'labour';
    const partner = isWorker ? chat?.customer : chat?.worker;
    const partnerName = partner?.username || partner?.name || 'User';
    const avatar = getAvatarUrl(partnerName);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, typingUser]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        onSendMessage(inputValue, 'text');
        setInputValue('');
    };

    const handleFakeImageSend = () => {
        const fakeImages = [
            "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=500", // pipes repair
            "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=500", // tools
            "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=500"  // wiring
        ];
        const randomImg = fakeImages[Math.floor(Math.random() * fakeImages.length)];
        onSendMessage(randomImg, 'image');
    };

    if (!chat) {
        return (
            <div className="flex-1 h-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8 text-center">
                <MessageSquare className="w-12 h-12 text-slate-350 mb-3" />
                <h3 className="font-heading font-black text-slate-700 text-base">No Chat Selected</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1">Select a conversation from the sidebar to start messaging in real-time.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 h-full flex flex-col bg-white">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center space-x-3.5">
                    <div className="relative">
                        <img 
                            src={avatar} 
                            alt={partnerName} 
                            className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-heading font-black text-slate-900 text-sm flex items-center gap-1">
                            <span>{partnerName}</span>
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                        </h3>
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">
                            {partner?.profession || 'Customer'}
                        </p>
                    </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center space-x-2">
                    <a 
                        href={`tel:${partner?.phone || '9876543210'}`}
                        className="w-9 h-9 rounded-lg hover:bg-slate-50 border border-slate-150 flex items-center justify-center transition-colors text-slate-600"
                        title="Call"
                    >
                        <Phone className="w-4 h-4" />
                    </a>
                </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50">
                <div className="space-y-1">
                    {messages.map((msg, index) => (
                        <MessageBubble 
                            key={msg._id || index} 
                            message={msg} 
                            isMe={msg.sender === (currentUser._id || currentUser.id)} 
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Typing status bar */}
            {typingUser && (
                <div className="px-5 py-1.5 bg-slate-50 border-t border-slate-100 text-slate-400 text-xs font-semibold italic flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-450 animate-ping"></span>
                    <span>{typingUser} is typing...</span>
                </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center space-x-3 bg-white shrink-0">
                <div className="flex space-x-1">
                    <button
                        type="button"
                        onClick={handleFakeImageSend}
                        className="w-10 h-10 rounded-xl hover:bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                        title="Share Image"
                    >
                        <Image className="w-4.5 h-4.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setInputValue(prev => prev + '😊')}
                        className="w-10 h-10 rounded-xl hover:bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
                        title="Insert Emoji"
                    >
                        <Smile className="w-4.5 h-4.5" />
                    </button>
                </div>

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        if (onTyping) onTyping();
                    }}
                    placeholder="Type message..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800 font-semibold"
                />

                <button
                    type="submit"
                    className="w-10 h-10 bg-primary hover:bg-primaryDark text-white rounded-xl shadow-md flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;
