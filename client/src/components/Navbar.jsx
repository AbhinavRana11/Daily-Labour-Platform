import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Hammer, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setDropdownOpen(false);
    };

    return (
        <nav className="bg-secondary text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
                            <Hammer className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">Daily<span className="text-primary">Labour</span></span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link to="/" className="hover:text-primary transition-colors font-medium">Home</Link>
                        <Link to="/find-labour" className="hover:text-primary transition-colors font-medium">Find Labour</Link>
                        <Link to="/find-work" className="hover:text-primary transition-colors font-medium">Find Work</Link>

                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 bg-secondaryLight px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
                                >
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-medium max-w-[100px] truncate">{user.username}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 text-gray-800 border border-gray-100 overflow-hidden"
                                        >
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                                                <p className="text-sm">Signed in as</p>
                                                <p className="text-sm font-bold truncate">{user.email}</p>
                                            </div>

                                            <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="px-4 py-2 hover:bg-gray-50 flex items-center transition-colors">
                                                <User className="w-4 h-4 mr-2 text-gray-500" />
                                                My Profile
                                            </Link>
                                            <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="px-4 py-2 hover:bg-gray-50 flex items-center transition-colors">
                                                <Settings className="w-4 h-4 mr-2 text-gray-500" />
                                                Settings
                                            </Link>

                                            <div className="border-t border-gray-100 mt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="hover:text-primary font-medium">Login</Link>
                                <Link to="/register" className="btn-primary flex items-center space-x-1 shadow-lg shadow-orange-500/20">
                                    <span>Register</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white focus:outline-none">
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-secondaryLight overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2">
                            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-700">Home</Link>
                            <Link to="/find-labour" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-700">Find Labour</Link>
                            <Link to="/find-work" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-700">Find Work</Link>
                            {user ? (
                                <>
                                    <div className="border-t border-gray-700 my-2 pt-2">
                                        <div className="px-3 flex items-center mb-4">
                                            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{user.username}</p>
                                                <p className="text-xs text-gray-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-700">Dashboard</Link>
                                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-red-400 hover:bg-gray-700">Sign Out</button>
                                    </div>
                                </>
                            ) : (
                                <div className="pt-4 flex flex-col space-y-3">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md hover:bg-gray-700 text-center">Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md bg-primary text-white text-center font-bold">Register</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
