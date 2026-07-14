import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Hammer, User, LogOut, Settings, ChevronDown, Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter, Send, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CustomerNav from './CustomerNav';
import WorkerNav from './WorkerNav';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 15);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setDropdownOpen(false);
    };

    const handleDrawerSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setTimeout(() => {
            setContactName('');
            setContactEmail('');
            setContactMessage('');
            setFormSubmitted(false);
            setDrawerOpen(false);
        }, 2000);
    };

    return (
        <div className={`sticky top-0 z-50 text-gray-200 transition-all duration-300 ${isScrolled ? 'bg-slate-900/90 backdrop-blur-md shadow-xl border-b border-slate-800/40 py-1' : 'bg-slate-900 border-b border-slate-800/80 py-2'}`}>
            {/* Main navbar row */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">

                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group shrink-0">
                        <div className="bg-primary p-1.5 rounded-lg group-hover:rotate-12 transition-transform duration-300">
                            <Hammer className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-2xl font-heading font-black tracking-tight text-white">
                            Daily<span className="text-primary">Labour</span>
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6 flex-1 justify-end pl-12">
                        {/* Public nav links always visible */}
                        <Link to="/" className="text-gray-200 hover:text-primary transition-colors font-semibold text-sm tracking-wide uppercase">Home</Link>
                        <Link to="/find-labour" className="text-gray-200 hover:text-primary transition-colors font-semibold text-sm tracking-wide uppercase">Find Labour</Link>
                        <Link to="/find-work" className="text-gray-200 hover:text-primary transition-colors font-semibold text-sm tracking-wide uppercase">Find Work</Link>

                        {/* Role-specific nav */}
                        {user?.role === 'customer' && <CustomerNav />}
                        {user?.role === 'labour' && <WorkerNav />}

                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="flex items-center space-x-1.5 hover:text-primary transition-colors font-semibold text-xs tracking-wider uppercase bg-slate-800 hover:bg-slate-700/80 px-4 py-2 rounded-full border border-slate-700/40"
                        >
                            <Info className="w-3.5 h-3.5 text-primary" />
                            <span>Quick Connect</span>
                        </button>

                        <div className="h-6 w-[1px] bg-slate-800"></div>

                        {user ? (
                            <div className="relative shrink-0" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 bg-slate-800 px-3 py-1.5 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
                                >
                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                                        {(user?.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-semibold text-sm max-w-[100px] truncate">{user?.username || 'User'}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {dropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 mt-2 w-60 bg-slate-900 rounded-2xl shadow-2xl py-2 text-gray-100 border border-slate-800 overflow-hidden"
                                        >
                                            {/* Header */}
                                            <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/50">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                                                        {(user?.username || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-white font-bold text-sm truncate">{user?.username || 'User'}</p>
                                                        <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Dashboard */}
                                            <Link
                                                to={user?.role === 'customer' ? '/customer/home' : user?.role === 'labour' ? '/worker/dashboard' : '/dashboard'}
                                                onClick={() => setDropdownOpen(false)}
                                                className="px-4 py-2.5 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors text-sm font-semibold group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                                                    <Settings className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                My Dashboard
                                            </Link>

                                            {/* My Profile */}
                                            <Link
                                                to={user?.role === 'customer' ? '/customer/profile' : user?.role === 'labour' ? '/worker/profile' : '/profile'}
                                                onClick={() => setDropdownOpen(false)}
                                                className="px-4 py-2.5 hover:bg-slate-800 hover:text-white flex items-center gap-2.5 transition-colors text-sm font-semibold group"
                                            >
                                                <div className="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center group-hover:bg-blue-500/25 transition-colors">
                                                    <User className="w-3.5 h-3.5 text-blue-400" />
                                                </div>
                                                My Profile
                                            </Link>

                                            {/* Divider + Sign out */}
                                            <div className="border-t border-slate-800 mt-1 pt-1">
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-4 py-2.5 text-red-400 hover:bg-red-950/20 hover:text-red-300 flex items-center gap-2.5 transition-colors text-sm font-bold group"
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                                        <LogOut className="w-3.5 h-3.5 text-red-400" />
                                                    </div>
                                                    Sign out
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4 shrink-0">
                                <Link to="/login" className="text-white hover:text-primary font-bold text-sm tracking-wide uppercase">Login</Link>
                                <Link to="/register" className="bg-primary hover:bg-primaryDark text-white font-bold py-2.5 px-6 rounded-full transition-all duration-300 shadow-lg shadow-orange-500/20 text-sm uppercase tracking-wide">
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            onClick={() => setDrawerOpen(true)}
                            className="p-2 text-gray-300 hover:text-white bg-slate-800 rounded-lg"
                            title="Quick Connect"
                        >
                            <Info className="w-5 h-5 text-primary" />
                        </button>
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white focus:outline-none p-2 bg-slate-800 rounded-lg">
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden bg-slate-900 border-t border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-2 text-base font-semibold">
                            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-slate-800">Home</Link>
                            {user?.role !== 'labour' && <Link to="/find-labour" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-slate-800">Find Labour</Link>}
                            <Link to="/find-work" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-slate-800">Find Work</Link>
                            {user ? (
                                <div className="border-t border-slate-800 my-2 pt-2">
                                    <div className="px-3 flex items-center mb-4">
                                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold mr-3">
                                            {(user?.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">{user?.username || 'User'}</p>
                                            <p className="text-xs text-gray-400">{user?.email || ''}</p>
                                        </div>
                                    </div>
                                    <Link to={user?.role === 'customer' ? '/customer/home' : user?.role === 'labour' ? '/worker/dashboard' : '/dashboard'} onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-slate-800">My Dashboard</Link>
                                    <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-slate-800">Sign Out</button>
                                </div>
                            ) : (
                                <div className="pt-4 flex flex-col space-y-2 border-t border-slate-800">
                                    <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg hover:bg-slate-800 text-center">Login</Link>
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-lg bg-primary hover:bg-primaryDark text-white text-center font-bold">Register</Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Side Drawer (Quick Connect) */}
            <AnimatePresence>
                {drawerOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setDrawerOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100]"
                        />

                        {/* Drawer Content */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'tween', duration: 0.3 }}
                            className="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-slate-900 border-l border-slate-800 text-white shadow-2xl z-[101] flex flex-col overflow-y-auto"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
                                <div className="flex items-center space-x-2">
                                    <div className="bg-primary p-1 rounded">
                                        <Hammer className="h-5 w-5 text-white" />
                                    </div>
                                    <span className="text-xl font-heading font-black">Daily<span className="text-primary">Labour</span></span>
                                </div>
                                <button
                                    onClick={() => setDrawerOpen(false)}
                                    className="w-10 h-10 rounded-lg hover:bg-slate-800 flex items-center justify-center border border-slate-800 hover:border-slate-700 transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400 hover:text-white" />
                                </button>
                            </div>

                            {/* Drawer Body */}
                            <div className="p-6 flex-1 space-y-8">
                                <div>
                                    <h3 className="text-xl font-heading font-extrabold text-white mb-2">Quick Connect with Us</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        Have questions about hiring workers, joining as a professional, or service rates? Message us directly, and our support team will help you instantly.
                                    </p>
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800/80">
                                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50 shrink-0">
                                            <Phone className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Call Us Directly</p>
                                            <p className="text-sm font-bold text-gray-200">+91 91045 36360</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800/80">
                                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50 shrink-0">
                                            <Mail className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Send an Email</p>
                                            <p className="text-sm font-bold text-gray-200">info@dailylabour.com</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4 bg-slate-800/40 p-4 rounded-xl border border-slate-800/80">
                                        <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-700/50 shrink-0">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Our Headquarters</p>
                                            <p className="text-sm font-bold text-gray-200">Morbi, Gujarat, India</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Message Form */}
                                <div className="bg-slate-950/30 p-5 rounded-xl border border-slate-800/70">
                                    <h4 className="text-base font-bold text-white mb-4">Send a Quick Query</h4>
                                    {formSubmitted ? (
                                        <div className="p-4 bg-green-950/20 border border-green-800 rounded-lg text-center text-sm text-green-400">
                                            Message sent successfully! We will connect soon.
                                        </div>
                                    ) : (
                                        <form onSubmit={handleDrawerSubmit} className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Your Name</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter name"
                                                    value={contactName}
                                                    onChange={(e) => setContactName(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700/80 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="Enter email"
                                                    value={contactEmail}
                                                    onChange={(e) => setContactEmail(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700/80 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Message</label>
                                                <textarea
                                                    required
                                                    rows="3"
                                                    placeholder="How can we help you?"
                                                    value={contactMessage}
                                                    onChange={(e) => setContactMessage(e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700/80 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors resize-none"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                className="w-full bg-primary hover:bg-primaryDark text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-2 text-sm transition-colors cursor-pointer"
                                            >
                                                <Send className="w-4 h-4" />
                                                <span>Send Message</span>
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>

                            {/* Drawer Footer */}
                            <div className="p-6 border-t border-slate-800 bg-slate-950/20 text-center">
                                <div className="flex justify-center space-x-3">
                                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-slate-800 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-gray-400"><Instagram className="w-4 h-4" /></a>
                                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-slate-800 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-gray-400"><Facebook className="w-4 h-4" /></a>
                                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-slate-800 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-gray-400"><Twitter className="w-4 h-4" /></a>
                                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-slate-800 hover:bg-primary hover:text-white flex items-center justify-center transition-colors text-gray-400"><Linkedin className="w-4 h-4" /></a>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Navbar;
