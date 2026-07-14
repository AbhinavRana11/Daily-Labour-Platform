import React from 'react';
import { MessageSquare, Search } from 'lucide-react';

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

const ChatList = ({ chats = [], selectedChat, onSelectChat, currentUser }) => {
    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = new Date();
        const diffMs = now - d;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div className="h-full flex flex-col bg-white border-r border-slate-200/80 w-full md:w-[320px] lg:w-[350px] shrink-0">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col gap-4">
                <div className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-heading font-black text-slate-900">Chats</h2>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                    <input 
                        type="text" 
                        placeholder="Search conversations..."
                        className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-800"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-50 p-2 space-y-1">
                {chats.length > 0 ? (
                    chats.map((chat) => {
                        const isWorker = currentUser.role === 'labour';
                        const partner = isWorker ? chat.customer : chat.worker;
                        
                        if (!partner) return null;

                        const isSelected = selectedChat && selectedChat._id === chat._id;
                        const partnerName = partner.username || partner.name || 'User';
                        const avatar = getAvatarUrl(partnerName);
                        
                        return (
                            <button
                                key={chat._id}
                                onClick={() => onSelectChat(chat)}
                                className={`w-full flex items-center space-x-3.5 p-3 rounded-2xl transition-all text-left ${isSelected ? 'bg-amber-50/50 border border-primary/10' : 'hover:bg-slate-50 border border-transparent'}`}
                            >
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <img 
                                        src={avatar} 
                                        alt={partnerName} 
                                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                                    />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>

                                {/* Meta details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h4 className="font-extrabold text-slate-800 text-sm truncate">{partnerName}</h4>
                                        <span className="text-[10px] text-slate-400 font-bold shrink-0">
                                            {formatTime(chat.lastMessageTime || chat.updatedAt)}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-xs font-semibold truncate leading-snug">
                                        {chat.lastMessage || "No messages yet"}
                                    </p>
                                </div>
                            </button>
                        );
                    })
                ) : (
                    <div className="text-center text-slate-400 py-12 text-xs font-bold uppercase tracking-wider">
                        No active conversations
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatList;
