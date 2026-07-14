import React from 'react';
import { Link } from 'react-router-dom';
import { Hammer, Mail, Phone, MapPin, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-secondary text-gray-300 pt-16 pb-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    
                    {/* Brand Widget */}
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-primary p-1.5 rounded-lg">
                                <Hammer className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight text-white">
                                Daily<span className="text-primary">Labour</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Connecting skilled, verified daily wage workers with homeowners and contractors. We build trust, delivery, and quality in every single job.
                        </p>
                        {/* Social Buttons */}
                        <div className="flex space-x-3 pt-2">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-gray-400 border border-slate-700/50 hover:border-transparent">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-gray-400 border border-slate-700/50 hover:border-transparent">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-gray-400 border border-slate-700/50 hover:border-transparent">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-gray-400 border border-slate-700/50 hover:border-transparent">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" 
                               className="w-10 h-10 rounded-lg bg-slate-800 hover:bg-primary hover:text-white flex items-center justify-center transition-all duration-300 text-gray-400 border border-slate-700/50 hover:border-transparent">
                                <Youtube className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Popular Services */}
                    <div>
                        <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-12 after:h-[2px] after:bg-primary">
                            Popular Services
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/find-labour?profession=Plumber" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Plumbers & Pipefitters
                                </Link>
                            </li>
                            <li>
                                <Link to="/find-labour?profession=Electrician" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Electricians & Wiremen
                                </Link>
                            </li>
                            <li>
                                <Link to="/find-labour?profession=Carpenter" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Carpenters & Furniture Makers
                                </Link>
                            </li>
                            <li>
                                <Link to="/find-labour?profession=Housekeeper" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Housekeeping & Cleaning
                                </Link>
                            </li>
                            <li>
                                <Link to="/find-labour?profession=Mason" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Masons & Tile Fixers
                                </Link>
                            </li>
                            <li>
                                <Link to="/find-labour?profession=Painter" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Home Painters & Decorators
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-12 after:h-[2px] after:bg-primary">
                            Quick Links
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link to="/" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Home Page
                                </Link>
                            </li>
                            <li>
                                <Link to="/find-labour" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Find & Hire Labour
                                </Link>
                            </li>
                            <li>
                                <Link to="/find-work" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Register as Worker
                                </Link>
                            </li>
                            <li>
                                <Link to="/login" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Member Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/register" className="hover:text-primary transition-colors flex items-center">
                                    <span className="mr-2 text-primary font-bold">›</span> Create Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white text-lg font-bold uppercase tracking-wider mb-6 relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-12 after:h-[2px] after:bg-primary">
                            Contact Us
                        </h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start">
                                <Phone className="w-5 h-5 mr-3 text-primary shrink-0" />
                                <span>+91 91045 36360<br />+91 98765 43210</span>
                            </li>
                            <li className="flex items-start">
                                <Mail className="w-5 h-5 mr-3 text-primary shrink-0" />
                                <span className="break-all">info@dailylabour.com<br />support@dailylabour.com</span>
                            </li>
                            <li className="flex items-start">
                                <MapPin className="w-5 h-5 mr-3 text-primary shrink-0" />
                                <span>DailyLabour Headquarters,<br />Morbi, Gujarat - 363641</span>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-800 text-center text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
                    <p>© 2026 DailyLabour Platform. All rights reserved.</p>
                    <p className="mt-2 md:mt-0">Designed to Build Better Communities.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
