import React, { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Check for token and user data in local storage
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        try {
            if (token && storedUser) {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                connectSocket(userData._id);
            }
        } catch (error) {
            console.error("Error parsing stored user from localStorage:", error);
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        }
        setLoading(false);
    }, []);

    const connectSocket = (userId) => {
        const newSocket = io('http://localhost:5000');
        newSocket.emit('join_room', userId);
        setSocket(newSocket);
    };

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        connectSocket(userData._id);
    };

    const updateUser = (newUserData) => {
        const storedUser = localStorage.getItem('user');
        const updated = storedUser ? { ...JSON.parse(storedUser), ...newUserData } : newUserData;
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        if (socket) socket.disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, login, updateUser, logout, loading, socket }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
