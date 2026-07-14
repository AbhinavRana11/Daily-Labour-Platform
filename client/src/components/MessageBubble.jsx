import React from 'react';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({ message, isMe }) => {
    const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
            <div 
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm font-sans ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}
            >
                {message.messageType === 'image' ? (
                    <img 
                        src={message.message} 
                        alt="Shared media" 
                        className="rounded-lg max-h-48 object-cover mb-1 border border-black/5" 
                    />
                ) : (
                    <p className="leading-relaxed break-words">{message.message}</p>
                )}

                <div className="flex items-center justify-end space-x-1 mt-1 text-[10px] opacity-75">
                    <span>{formattedTime}</span>
                    {isMe && (
                        message.isRead ? (
                            <CheckCheck className="w-3.5 h-3.5 text-blue-100" />
                        ) : (
                            <Check className="w-3.5 h-3.5 text-slate-100" />
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
