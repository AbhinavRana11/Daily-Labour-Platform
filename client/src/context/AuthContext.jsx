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

        if (token && storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            connectSocket(userData._id);
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

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        if (socket) socket.disconnect();
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, socket }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
