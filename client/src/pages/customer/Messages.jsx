import React, { useState, useEffect, useRef } from 'react';
import ChatList from '../../components/ChatList';
import ChatWindow from '../../components/ChatWindow';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const CustomerMessages = () => {
    const { user, socket } = useAuth();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [typingUser, setTypingUser] = useState(null);
    const typingTimeoutRef = useRef(null);

    // Fetch user conversations
    const fetchChats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/chat', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChats(res.data);
            
            // Update active selected chat in place to get latest status
            if (selectedChat) {
                const updatedSelected = res.data.find(c => c._id === selectedChat._id);
                if (updatedSelected) setSelectedChat(updatedSelected);
            }
        } catch (error) {
            console.error("Failed to load chats:", error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchChats();
        }
    }, [user]);

    // Fetch messages for active chat room
    const fetchMessages = async (chatId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:5000/api/chat/${chatId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);

            // Mark as read immediately on loading
            await axios.put(`http://localhost:5000/api/chat/read/${chatId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Failed to load messages:", error);
        }
    };

    // SocketRoom listeners
    useEffect(() => {
        if (socket && selectedChat) {
            // Join Socket Room
            socket.emit("joinRoom", selectedChat._id);

            const handleReceiveMessage = (newMessage) => {
                if (newMessage.chat === selectedChat._id) {
                    setMessages(prev => [...prev, newMessage]);
                    
                    // Mark read
                    const token = localStorage.getItem('token');
                    axios.put(`http://localhost:5000/api/chat/read/${selectedChat._id}`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).catch(console.error);
                }
                
                // Refresh list of chats to show last message changes
                fetchChats();
            };

            const handleUserTyping = ({ userId, userName, isTyping }) => {
                if (userId !== user?._id) {
                    setTypingUser(isTyping ? userName : null);
                }
            };

            const handleMessageRead = ({ chatId }) => {
                if (chatId === selectedChat._id) {
                    setMessages(prev => prev.map(m => m.sender === user?._id ? { ...m, isRead: true } : m));
                }
            };

            socket.on("receiveMessage", handleReceiveMessage);
            socket.on("userTyping", handleUserTyping);
            socket.on("messageRead", handleMessageRead);

            // Trigger read receipt on load
            socket.emit("markRead", { chatId: selectedChat._id, userId: user?._id });

            return () => {
                socket.off("receiveMessage", handleReceiveMessage);
                socket.off("userTyping", handleUserTyping);
                socket.off("messageRead", handleMessageRead);
            };
        }
    }, [socket, selectedChat, user]);

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
        setMessages([]);
        setTypingUser(null);
        fetchMessages(chat._id);
    };

    const handleSendMessage = async (text, type = 'text') => {
        if (!selectedChat) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/chat/message', {
                chatId: selectedChat._id,
                message: text,
                messageType: type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Append locally
            setMessages(prev => [...prev, res.data]);

            // Emit to Socket Room
            if (socket) {
                socket.emit("sendMessage", res.data);
            }

            // Refresh conversations list
            fetchChats();
        } catch (error) {
            console.error("Failed to send message:", error);
        }
    };

    const handleTyping = () => {
        if (socket && selectedChat && user) {
            socket.emit("typing", { 
                chatId: selectedChat._id, 
                userId: user._id, 
                userName: user.username 
            });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stopTyping", { chatId: selectedChat._id, userId: user._id });
            }, 2000);
        }
    };

    if (!user) {
        return (
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-450 bg-slate-900 font-sans">
                Please log in to view your chats.
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)] flex overflow-hidden bg-slate-50 font-sans">
            <ChatList 
                chats={chats} 
                selectedChat={selectedChat} 
                onSelectChat={handleSelectChat} 
                currentUser={user} 
            />
            <ChatWindow 
                chat={selectedChat} 
                messages={messages} 
                onSendMessage={handleSendMessage} 
                currentUser={user} 
                typingUser={typingUser}
                onTyping={handleTyping}
            />
        </div>
    );
};

export default CustomerMessages;
