import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Hammer, ShieldCheck, Clock, MapPin } from 'lucide-react';

const Landing = () => {
    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="relative bg-secondary py-20 lg:py-32 overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000')] bg-cover bg-center"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row items-center">

                    <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl md:text-6xl font-extrabold text-white leading-tight"
                        >
                            Find Reliable <br />
                            <span className="text-primary">Daily Labour</span> <br />
                            In Minutes.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="mt-4 text-xl text-gray-300 max-w-lg mx-auto md:mx-0"
                        >
                            Connect with skilled plumbers, electricians, cleaners, and more in your neighborhood instantly.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
                        >
                            <Link to="/find-labour" className="btn-primary flex items-center justify-center space-x-2 text-lg px-8 py-3">
                                <Search className="w-5 h-5" />
                                <span>Hire Labour</span>
                            </Link>
                            <Link to="/register" className="btn-outline border-white text-white hover:bg-white hover:text-secondary flex items-center justify-center space-x-2 text-lg px-8 py-3">
                                <Hammer className="w-5 h-5" />
                                <span>Join as Labour</span>
                            </Link>
                        </motion.div>
                    </div>

                    <div className="md:w-1/2 relative">
                        <motion.img
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8 }}
                            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=1000"
                            alt="Worker"
                            className="rounded-2xl shadow-2xl border-4 border-slate-700/50 object-cover h-[500px] w-full"
                        />

                        {/* Floating Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg flex items-center space-x-3"
                        >
                            <div className="bg-green-100 p-2 rounded-full">
                                <ShieldCheck className="text-green-600 w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Verified Workers</p>
                                <p className="font-bold text-slate-800">100% Secure</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features / Services Preview */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-secondary">Why Choose DailyLabour?</h2>
                        <p className="mt-2 text-gray-600">The smartest way to hire help for your daily needs.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<MapPin className="w-8 h-8 text-primary" />}
                            title="Hyperlocal Search"
                            desc="Find workers within radius of your home. View them on a realtime map."
                        />
                        <FeatureCard
                            icon={<Clock className="w-8 h-8 text-primary" />}
                            title="Instant Booking"
                            desc="Negotiate rates, set hours, and book instantly. No middleman delays."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="w-8 h-8 text-primary" />}
                            title="Verified Professionals"
                            desc="All workers are verified with ID and past work reviews."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="max-w-4xl mx-auto text-center text-white px-4">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get work done?</h2>
                    <p className="text-lg mb-8 opacity-90">Join thousands of users who trust DailyLabour for their home service needs.</p>
                    <Link to="/find-labour" className="bg-white text-primary font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:bg-gray-100 transition-all text-lg">
                        Find Labour Now
                    </Link>
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all border border-slate-100"
    >
        <div className="bg-orange-50 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-secondary text-center mb-3">{title}</h3>
        <p className="text-gray-500 text-center leading-relaxed">{desc}</p>
    </motion.div>
);

export default Landing;
