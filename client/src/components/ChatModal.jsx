import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const ChatModal = ({ isOpen, onClose, recipient, booking }) => {
    const { user, socket } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeChatId, setActiveChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Scroll to bottom on new message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Fetch or create chat room & load messages if booking is present
    useEffect(() => {
        if (!isOpen || !recipient) return;

        const initializeChat = async () => {
            setMessages([]);
            setActiveChatId(null);

            if (booking && booking._id) {
                setLoading(true);
                try {
                    const token = localStorage.getItem('token');
                    
                    // 1. Create/Get Chat room for booking
                    const chatRes = await axios.post('http://localhost:5000/api/chat/create', {
                        bookingId: booking._id
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    const chat = chatRes.data;
                    setActiveChatId(chat._id);

                    // 2. Fetch messages for the room
                    const messagesRes = await axios.get(`http://localhost:5000/api/chat/${chat._id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    // Map backend messages format to local modal format
                    const mapped = messagesRes.data.map(msg => ({
                        from: msg.sender,
                        to: msg.receiver,
                        message: msg.message,
                        timestamp: msg.createdAt || msg.timestamp || new Date()
                    }));
                    setMessages(mapped);

                    // Mark as read
                    await axios.put(`http://localhost:5000/api/chat/read/${chat._id}`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                } catch (error) {
                    console.error("Failed to initialize booking chat:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                // Fallback for pre-booking live socket chat
                const roomId = recipient.chatId || `${user._id}_${recipient._id}`;
                setActiveChatId(roomId);
            }
        };

        initializeChat();
    }, [isOpen, recipient, booking, user]);

    // Socket listeners for live updates
    useEffect(() => {
        if (!socket || !isOpen || !activeChatId) return;

        // Join room
        socket.emit('joinRoom', activeChatId);

        const handleReceiveMessage = (data) => {
            // Check if message belongs to current active chat room
            const msgChatId = data.chat;
            if (msgChatId === activeChatId) {
                setMessages((prev) => [...prev, {
                    from: data.from || data.sender,
                    to: data.to || data.receiver,
                    message: data.message,
                    timestamp: data.timestamp || new Date()
                }]);

                if (booking && booking._id) {
                    const token = localStorage.getItem('token');
                    axios.put(`http://localhost:5000/api/chat/read/${activeChatId}`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).catch(console.error);
                }
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);

        return () => {
            socket.off('receiveMessage', handleReceiveMessage);
        };
    }, [socket, isOpen, activeChatId, booking]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !activeChatId) return;

        const otherUserId = recipient._id;
        const msgText = newMessage.trim();
        setNewMessage('');

        const messageData = {
            to: otherUserId,
            from: user._id,
            message: msgText,
            timestamp: new Date(),
            senderName: user.username,
            chat: activeChatId
        };

        // If there's a booking, save it to the DB first
        if (booking && booking._id) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.post('http://localhost:5000/api/chat/message', {
                    chatId: activeChatId,
                    message: msgText,
                    messageType: 'text'
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Emit saved message
                const emitData = {
                    ...messageData,
                    _id: res.data._id,
                    timestamp: res.data.createdAt
                };
                socket.emit("sendMessage", emitData);
                
                // Add to UI local list
                setMessages((prev) => [...prev, {
                    from: user._id,
                    to: otherUserId,
                    message: msgText,
                    timestamp: res.data.createdAt
                }]);
            } catch (error) {
                console.error("Failed to send persisted message:", error);
            }
        } else {
            // Live-only socket fallback
            socket.emit("sendMessage", messageData);
            setMessages((prev) => [...prev, {
                from: user._id,
                to: otherUserId,
                message: msgText,
                timestamp: new Date()
            }]);
        }
    };

    if (!isOpen || !recipient) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col h-[500px] border border-slate-100"
                >
                    {/* Header */}
                    <div className="bg-secondary p-4 flex justify-between items-center text-white">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold">{recipient.username || recipient.name}</h3>
                                <p className="text-xs text-white/80">{recipient.profession || 'User'}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                        {loading ? (
                            <div className="text-center text-gray-400 mt-10">
                                <p className="text-sm">Loading message history...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-gray-400 mt-10">
                                <p className="text-sm">Start conversation with {recipient.username || recipient.name}</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const senderId = msg.from || msg.sender;
                                const isMe = senderId === (user._id || user.id);
                                return (
                                    <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] p-3 rounded-xl shadow-sm ${isMe
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                            }`}>
                                            <p className="text-sm leading-relaxed">{msg.message}</p>
                                            <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/50 bg-gray-50 text-sm text-slate-800 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="p-2.5 bg-secondary text-white rounded-full hover:bg-secondaryLight disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer"
                        >
                            <Send className="w-4.5 h-4.5" />
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ChatModal;
