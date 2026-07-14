import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Hammer, ShieldCheck, Clock, MapPin, ChevronLeft, ChevronRight, Award, Truck, ThumbsUp, HeartHandshake, Zap, Users } from 'lucide-react';

const slides = [
    {
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000",
        title: "LET'S BUILD",
        subtitle: "BETTER SERVICES",
        desc: "Connect instantly with skilled construction workers, masons, and supervisors in your area.",
        link: "/find-labour"
    },
    {
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2000",
        title: "EXPERT",
        subtitle: "ELECTRICIANS",
        desc: "Safe, rapid, and professional wiring, repair, and installation services at your doorstep.",
        link: "/find-labour"
    },
    {
        image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000",
        title: "PROFESSIONAL",
        subtitle: "PLUMBERS",
        desc: "Leak repairs, pipeline fittings, and sanitary installations handled by certified plumbers.",
        link: "/find-labour"
    },
    {
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2000",
        title: "VERIFIED",
        subtitle: "CLEANERS",
        desc: "Home and commercial cleaning services using safe materials with 100% verified staff.",
        link: "/find-labour"
    }
];

const Landing = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    // Autoplay slider
    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(interval);
    }, [currentSlide]);

    const handleNext = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const handlePrev = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="w-full bg-slate-50 text-slate-800">
            {/* Parallax Hero Slider */}
            <section className="relative h-[80vh] md:h-[90vh] min-h-[500px] overflow-hidden bg-slate-950">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
                    >
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/60 bg-gradient-to-r from-black/85 via-black/65 to-transparent"></div>

                        {/* Slider Content */}
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center relative z-10">
                            <div className="max-w-2xl text-left text-white space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                    className="space-y-1.5"
                                >
                                    <h2 className="text-xl md:text-2xl font-bold italic tracking-widest text-primary">
                                        {slides[currentSlide].title}
                                    </h2>
                                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-none tracking-tight">
                                        {slides[currentSlide].subtitle}
                                    </h1>
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                    className="text-gray-300 text-lg md:text-xl font-light leading-relaxed"
                                >
                                    {slides[currentSlide].desc}
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.6, duration: 0.6 }}
                                    className="flex flex-wrap gap-4 pt-4"
                                >
                                    <Link to="/find-labour" className="bg-primary hover:bg-primaryDark text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-500/20 transition-all flex items-center space-x-2 text-lg">
                                        <Search className="w-5 h-5" />
                                        <span>Hire Labour</span>
                                    </Link>
                                    <Link to="/register" className="border-2 border-white hover:bg-white hover:text-slate-900 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center space-x-2 text-lg">
                                        <Hammer className="w-5 h-5" />
                                        <span>Join as Labour</span>
                                    </Link>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Left/Right Custom Controls */}
                <button
                    onClick={handlePrev}
                    className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-slate-900/40 hover:bg-primary text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                    onClick={handleNext}
                    className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full border border-white/20 bg-slate-900/40 hover:bg-primary text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Dots indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
                    {slides.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentSlide(i)}
                            className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-primary w-8' : 'bg-white/40 hover:bg-white'}`}
                        />
                    ))}
                </div>
            </section>

            {/* About Us section matching Fixora's WELCOME TO FIXORA */}
            <section className="py-24 bg-white border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        
                        {/* Image grid side */}
                        <div className="w-full lg:w-1/2 relative">
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-100">
                                <img
                                    src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000"
                                    alt="Professional workers working"
                                    className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>
                                <div className="absolute bottom-6 left-6 flex items-center space-x-3 bg-primary text-white py-3 px-6 rounded-xl shadow-lg">
                                    <ShieldCheck className="w-8 h-8 shrink-0" />
                                    <div>
                                        <p className="font-extrabold text-lg">100% Safe</p>
                                        <p className="text-xs text-white/90">Verified & Background Checked</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text description & Core values list */}
                        <div className="w-full lg:w-1/2 space-y-8">
                            <div className="space-y-4">
                                <span className="text-primary font-bold tracking-widest text-sm uppercase block">About Us</span>
                                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                                    WELCOME TO DAILYLABOUR
                                </h2>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    DailyLabour is a diversified localized service matchmaking platform. We are involved in connecting skilled masons, plumbers, electricians, housekeepers, and carpenters directly to consumers and construction leads. Our platform is well acknowledged by contractors, homeowners, builders, and professionals alike.
                                </p>
                                <p className="text-gray-600 text-base leading-relaxed">
                                    Our core values include Integrity, Unity, Service Excellence, Transparency, and Making a difference. We are growing exponentially with our robust booking matching engine and professional verification teams.
                                </p>
                            </div>

                            <hr className="border-slate-100" />

                            {/* Core Value Icon Boxes */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
                                <CoreValueCard 
                                    icon={<ThumbsUp className="w-8 h-8 text-primary" />} 
                                    title="Customer Satisfaction" 
                                />
                                <CoreValueCard 
                                    icon={<Clock className="w-8 h-8 text-primary" />} 
                                    title="On Time Matching" 
                                />
                                <CoreValueCard 
                                    icon={<Award className="w-8 h-8 text-primary" />} 
                                    title="Quality Handiwork" 
                                />
                                <CoreValueCard 
                                    icon={<HeartHandshake className="w-8 h-8 text-primary" />} 
                                    title="Strong Safety Rules" 
                                />
                                <CoreValueCard 
                                    icon={<Zap className="w-8 h-8 text-primary" />} 
                                    title="Fast Matching Tech" 
                                />
                                <CoreValueCard 
                                    icon={<Award className="w-8 h-8 text-primary" />} 
                                    title="Cost Effectiveness" 
                                />
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* Popular Services Showcase */}
            <section className="py-24 bg-slate-900 text-white relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800/50 via-slate-900 to-slate-950 opacity-40 pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
                        <span className="text-primary font-bold tracking-widest text-sm uppercase block">What Can We Do</span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                            Services we can help you with
                        </h2>
                        <p className="text-gray-400">
                            We match you with skilled, reliable contractors and hourly daily workers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ServiceItemCard
                            image="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600"
                            title="Plumbers"
                            description="Fixing leaks, installing pipes, and maintaining drains with ease."
                            link="/find-labour"
                        />
                        <ServiceItemCard
                            image="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600"
                            title="Electricians"
                            description="Professional home wiring, appliance setups, and short circuit repairs."
                            link="/find-labour"
                        />
                        <ServiceItemCard
                            image="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=600"
                            title="Carpenters"
                            description="Door hanging, furniture repairs, and customized wood crafts."
                            link="/find-labour"
                        />
                        <ServiceItemCard
                            image="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=600"
                            title="Housekeepers"
                            description="Full house scrubbing, sweeping, kitchen cleanup, and sanitation."
                            link="/find-labour"
                        />
                        <ServiceItemCard
                            image="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600"
                            title="Masons"
                            description="Brickwork, floor plastering, tiling, and foundation structures."
                            link="/find-labour"
                        />
                        <ServiceItemCard
                            image="https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=600"
                            title="Painters"
                            description="Clean interior and exterior paints matching your custom styles."
                            link="/find-labour"
                        />
                    </div>
                </div>
            </section>

            {/* Achievements Banner section (What We Achieved) */}
            <section className="py-20 bg-slate-950 text-white border-y border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
                        <div className="max-w-md text-center lg:text-left space-y-3">
                            <h2 className="text-3xl font-extrabold">What We Achieved</h2>
                            <p className="text-gray-400 text-sm">
                                Customer satisfaction is our transparency. We match thousands of workers daily.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full lg:w-auto">
                            <StatBox count="10K" label="Global Happy Clients" icon={<Users className="w-6 h-6 text-primary" />} />
                            <StatBox count="15K" label="Bookings Completed" icon={<Award className="w-6 h-6 text-primary" />} />
                            <StatBox count="500" label="Verified Labours" icon={<Hammer className="w-6 h-6 text-primary" />} />
                            <StatBox count="4.9" label="Average Rating" icon={<ShieldCheck className="w-6 h-6 text-primary" />} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action Banner (CTA) matching CTA section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 text-white min-h-[350px] flex items-center justify-center p-8 md:p-16">
                        {/* Background Overlay */}
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2000')] bg-cover bg-center opacity-25"></div>
                        <div className="absolute inset-0 bg-slate-950/70 bg-gradient-to-b from-primary/10 to-slate-950/90"></div>

                        <div className="relative z-10 text-center max-w-2xl space-y-6">
                            <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                                Let's Build <br /> <span className="italic text-primary">Better</span> Services
                            </h2>
                            <p className="text-gray-300 text-base md:text-lg">
                                Ready to find qualified builders, electrical experts, and clean support nearby? Or want to join our network to earn daily? Contact us today!
                            </p>
                            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
                                <Link to="/find-labour" className="w-full sm:w-auto bg-primary hover:bg-primaryDark text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-orange-500/25 transition-all text-center">
                                    Find Labour Now
                                </Link>
                                <Link to="/find-work" className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-8 rounded-full border border-slate-700 hover:border-slate-600 transition-all text-center">
                                    Register as Worker
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

const CoreValueCard = ({ icon, title }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-slate-50 border border-slate-100 hover:border-primary/20 p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-3 transition-all duration-300 shadow-sm hover:shadow-md h-[120px]"
    >
        <div className="bg-orange-50 p-2 rounded-lg">
            {icon}
        </div>
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 tracking-tight leading-tight">{title}</h4>
    </motion.div>
);

const ServiceItemCard = ({ image, title, description, link }) => (
    <div className="group relative rounded-2xl overflow-hidden shadow-xl border border-slate-800/80 bg-slate-800/40 hover:border-primary/40 transition-all duration-500 h-[380px] flex flex-col justify-end">
        {/* Background Image */}
        <div 
            className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" 
            style={{ backgroundImage: `url(${image})` }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent group-hover:via-slate-900/40 transition-all duration-500"></div>

        {/* Content details overlay */}
        <div className="relative p-6 z-10 space-y-4">
            <span className="bg-primary/95 text-white text-xs font-bold uppercase tracking-wider py-1 px-3.5 rounded-full inline-block">
                Daily Labour
            </span>
            <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
            </div>
            
            <div className="pt-2">
                <Link 
                    to={link}
                    className="w-full bg-slate-900/90 group-hover:bg-primary border border-slate-700 hover:border-transparent text-white text-sm font-bold py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-colors duration-300"
                >
                    <span>Book Service</span>
                    <span>→</span>
                </Link>
            </div>
        </div>
    </div>
);

const StatBox = ({ count, label, icon }) => (
    <div className="bg-slate-900 border border-slate-800/60 p-5 rounded-xl text-center space-y-3 shadow-md">
        <div className="w-10 h-10 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
            {icon}
        </div>
        <div>
            <p className="text-2xl font-black text-white">{count}</p>
            <p className="text-xs text-gray-500 font-medium tracking-tight mt-1">{label}</p>
        </div>
    </div>
);

export default Landing;
