import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
    Zap, MapPin, Upload, X, ChevronDown, Sparkles,
    Clock, Calendar, DollarSign, Phone, MessageSquare,
    ArrowLeft, CheckCircle, Loader2, Star
} from 'lucide-react';

const SERVICES = ['Electrician','Plumber','Painter','Carpenter','Mason','Housekeeper','Cleaner','Gardener','Mechanic','Other'];
const SERVICE_EMOJIS = { Electrician:'⚡',Plumber:'🚰',Painter:'🎨',Carpenter:'🛠️',Mason:'🧱',Housekeeper:'🏠',Cleaner:'🧹',Gardener:'🌿',Mechanic:'🔧',Other:'👷' };

// ── AI keyword fill ────────────────────────────────────────────────────────────
const AI_RULES = [
    { keywords: ['fan','wire','electric','switch','socket','power','light','bulb','fuse'], service:'Electrician', title:'Electrical Repair Work', desc:'Need an electrician for electrical repair. Worker should bring required tools.', budget:[300,700] },
    { keywords: ['pipe','leak','tap','sink','drain','water','toilet','flush','plumb'], service:'Plumber', title:'Plumbing Repair Work', desc:'Need a plumber to fix plumbing issue. Worker should bring required tools.', budget:[250,600] },
    { keywords: ['paint','wall','colour','coat','brush','ceiling'], service:'Painter', title:'Painting Work', desc:'Need a painter for painting work. Worker should bring paint and brushes.', budget:[500,2000] },
    { keywords: ['wood','furniture','door','window','carpenter','cabinet','shelf'], service:'Carpenter', title:'Carpentry Work', desc:'Need a carpenter for wood/furniture work.', budget:[400,1200] },
    { keywords: ['brick','cement','wall','mason','construction','crack','repair'], service:'Mason', title:'Masonry / Construction Work', desc:'Need a mason for construction or repair work.', budget:[500,1500] },
    { keywords: ['clean','sweep','mop','dust','house','wash','broom'], service:'Cleaner', title:'House Cleaning', desc:'Need a cleaner for thorough house cleaning.', budget:[300,800] },
    { keywords: ['garden','plant','grass','trim','lawn','flower'], service:'Gardener', title:'Garden Maintenance', desc:'Need a gardener to maintain the garden.', budget:[200,600] },
    { keywords: ['car','vehicle','engine','tyre','mechanic','bike','motor'], service:'Mechanic', title:'Vehicle Repair', desc:'Need a mechanic for vehicle repair/service.', budget:[500,2000] },
];

const aiFill = (text) => {
    const lower = text.toLowerCase();
    for (const rule of AI_RULES) {
        if (rule.keywords.some(k => lower.includes(k))) {
            return {
                service: rule.service,
                title: rule.title,
                description: rule.desc + '\n\nUser note: ' + text,
                budgetMin: rule.budget[0],
                budgetMax: rule.budget[1],
                urgency: lower.includes('urgent') || lower.includes('emergency') ? 'emergency' : 'today'
            };
        }
    }
    return null;
};

// ── Input components ───────────────────────────────────────────────────────────
const Label = ({ children }) => (
    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{children}</label>
);
const Input = ({ className = '', ...props }) => (
    <input className={`w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors ${className}`} {...props} />
);

// ── Main Component ─────────────────────────────────────────────────────────────
const PostRequirement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        service: '', title: '', description: '', urgency: 'today',
        date: '', time: '', budgetMin: 200, budgetMax: 1000, budgetType: 'fixed',
        address: '', lat: null, lng: null, contactPreference: 'both',
        preferredWorker: []
    });
    const [images, setImages] = useState([]);
    const [aiInput, setAiInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef();

    const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

    const handleAiFill = async () => {
        if (!aiInput.trim()) return;
        setAiLoading(true);
        await new Promise(r => setTimeout(r, 800)); // simulate thinking
        const result = aiFill(aiInput);
        if (result) {
            setForm(f => ({ ...f, ...result }));
        } else {
            setError('Could not detect service type. Please fill manually.');
        }
        setAiLoading(false);
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 5) { setError('Max 5 images allowed'); return; }
        const readers = files.map(file => new Promise(res => {
            const r = new FileReader();
            r.onload = (ev) => res(ev.target.result);
            r.readAsDataURL(file);
        }));
        Promise.all(readers).then(results => {
            setImages(prev => [...prev, ...results]);
        });
    };

    const togglePreferred = (val) => {
        setForm(f => ({
            ...f,
            preferredWorker: f.preferredWorker.includes(val)
                ? f.preferredWorker.filter(v => v !== val)
                : [...f.preferredWorker, val]
        }));
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) { setError('Geolocation not supported'); return; }
        navigator.geolocation.getCurrentPosition(
            pos => {
                set('lat', pos.coords.latitude);
                set('lng', pos.coords.longitude);
                set('address', `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
            },
            () => setError('Could not get location')
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.service) { setError('Please select a service type'); return; }
        if (!form.title.trim()) { setError('Please add a job title'); return; }
        setSubmitting(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/requests', {
                ...form,
                images
            }, { headers: { Authorization: `Bearer ${token}` } });
            setSuccess(true);
            setTimeout(() => navigate('/customer/my-requirements'), 2500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post requirement');
        } finally {
            setSubmitting(false);
        }
    };

    if (success) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 text-white px-4">
            <div className="w-20 h-20 rounded-full bg-green-500/15 border-2 border-green-500 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div className="text-center">
                <h2 className="text-2xl font-black">Requirement Posted! 🎉</h2>
                <p className="text-slate-400 mt-2">Nearby workers are being notified...</p>
            </div>
            <div className="flex gap-2 items-center text-slate-500 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Redirecting to My Requirements...
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans pb-16">

            {/* ── Hero ── */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #EA580C 50%, #0F172A 100%)', minHeight: '160px', borderRadius: '0 0 2rem 2rem' }}>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <div className="max-w-2xl mx-auto px-4 py-8">
                    <button onClick={() => navigate('/customer/home')} className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-semibold mb-4 cursor-pointer transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-black text-white">Need a Worker? 🔧</h1>
                    <p className="text-white/60 mt-1 text-sm">Post your requirement — nearby workers will respond within minutes.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 mt-8 space-y-6">

                {/* ── AI Fill ── */}
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 border border-purple-700/30 rounded-3xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-black text-purple-300 uppercase tracking-wider">✨ AI Auto-Fill</span>
                    </div>
                    <p className="text-slate-400 text-xs mb-3">Describe your problem in plain words — AI will fill the form for you.</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder='e.g. "My kitchen sink is leaking badly"'
                            value={aiInput}
                            onChange={e => setAiInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAiFill()}
                            className="flex-1 bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                        <button
                            onClick={handleAiFill}
                            disabled={aiLoading || !aiInput.trim()}
                            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
                        >
                            {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            Fill
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-950/30 border border-red-800/40 text-red-400 rounded-2xl p-4 text-sm font-semibold flex items-center gap-2">
                        <X className="w-4 h-4 flex-shrink-0" />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto cursor-pointer"><X className="w-3 h-3" /></button>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* ── Service Type ── */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5">
                        <Label>Service Type *</Label>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {SERVICES.map(s => (
                                <button
                                    key={s} type="button"
                                    onClick={() => set('service', s)}
                                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                                        form.service === s
                                            ? 'bg-primary/15 border-primary text-primary shadow-lg shadow-orange-500/10'
                                            : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-white'
                                    }`}
                                >
                                    <span className="text-xl">{SERVICE_EMOJIS[s]}</span>
                                    <span className="text-center leading-tight">{s}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Job Title + Description ── */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5 space-y-4">
                        <div>
                            <Label>Job Title *</Label>
                            <Input
                                type="text"
                                placeholder="e.g. Need Electrician for Fan Repair"
                                value={form.title}
                                onChange={e => set('title', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label>Description</Label>
                            <textarea
                                rows={4}
                                placeholder="Describe your work in detail... Ceiling fan stopped working. Need repair today. Bring required tools."
                                value={form.description}
                                onChange={e => set('description', e.target.value)}
                                className="w-full bg-slate-800/60 border border-slate-700/60 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors resize-none"
                            />
                        </div>
                    </div>

                    {/* ── Urgency ── */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5">
                        <Label>Urgency</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { val: 'emergency', label: '🚨 Emergency', sub: 'Within 1 hour' },
                                { val: 'today',     label: '☀️ Today',     sub: 'Same day'     },
                                { val: 'tomorrow',  label: '📅 Tomorrow',  sub: 'Next day'     },
                                { val: 'scheduled', label: '🗓️ Schedule',  sub: 'Pick date'    },
                            ].map(({ val, label, sub }) => (
                                <button
                                    key={val} type="button"
                                    onClick={() => set('urgency', val)}
                                    className={`flex flex-col items-center gap-0.5 py-3 px-2 rounded-2xl border text-xs transition-all cursor-pointer ${
                                        form.urgency === val
                                            ? 'bg-primary/15 border-primary text-white'
                                            : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600 hover:text-white'
                                    }`}
                                >
                                    <span className="font-bold">{label}</span>
                                    <span className="text-slate-500 text-[10px]">{sub}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Date & Time ── */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5">
                        <Label>Date & Time</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">Date</p>
                                <Input type="date" value={form.date} onChange={e => set('date', e.target.value)} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">Time</p>
                                <Input type="time" value={form.time} onChange={e => set('time', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* ── Budget ── */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Budget</Label>
                            <div className="flex gap-2">
                                {['fixed','hourly'].map(t => (
                                    <button key={t} type="button" onClick={() => set('budgetType', t)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase transition-colors cursor-pointer ${form.budgetType === t ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
                                    >
                                        {t === 'fixed' ? '₹ Fixed' : '₹/hr Hourly'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">Min (₹)</p>
                                <Input type="number" min="0" value={form.budgetMin} onChange={e => set('budgetMin', Number(e.target.value))} />
                            </div>
                            <div>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mb-1.5">Max (₹)</p>
                                <Input type="number" min="0" value={form.budgetMax} onChange={e => set('budgetMax', Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="bg-slate-800/40 rounded-xl p-3 text-center">
                            <p className="text-white font-black text-lg">₹{form.budgetMin} – ₹{form.budgetMax}
                                <span className="text-slate-400 text-sm font-semibold ml-1">{form.budgetType === 'hourly' ? '/hr' : ' fixed'}</span>
                            </p>
                        </div>
                    </div>

                    {/* ── Location ── */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5 space-y-3">
                        <Label>Location</Label>
                        <button
                            type="button"
                            onClick={handleGetLocation}
                            className="flex items-center gap-2 w-full py-3 px-4 bg-blue-600/15 hover:bg-blue-600/25 border border-blue-600/30 rounded-xl text-blue-400 font-bold text-sm transition-colors cursor-pointer"
                        >
                            <MapPin className="w-4 h-4" /> Use My Current Location
                        </button>
                        <Input
                            type="text"
                            placeholder="Or type your address / area..."
                            value={form.address}
                            onChange={e => set('address', e.target.value)}
                        />
                        {form.lat && (
                            <p className="text-green-400 text-xs font-semibold flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Location captured: {form.lat?.toFixed(4)}, {form.lng?.toFixed(4)}
                            </p>
                        )}
                    </div>

                    {/* ── Images ── */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5 space-y-3">
                        <Label>Upload Photos (Max 5)</Label>
                        <div
                            onClick={() => images.length < 5 && fileRef.current.click()}
                            className="border-2 border-dashed border-slate-700 hover:border-primary rounded-2xl p-6 text-center cursor-pointer transition-colors group"
                        >
                            <Upload className="w-8 h-8 text-slate-600 group-hover:text-primary mx-auto mb-2 transition-colors" />
                            <p className="text-slate-500 text-sm font-semibold">Click to upload photos</p>
                            <p className="text-slate-600 text-xs mt-0.5">Broken pipe, wall crack, painting area...</p>
                        </div>
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                        {images.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {images.map((img, i) => (
                                    <div key={i} className="relative w-16 h-16">
                                        <img src={img} alt="" className="w-16 h-16 object-cover rounded-xl" />
                                        <button
                                            type="button"
                                            onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center cursor-pointer"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Preferred Worker ── */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5">
                        <Label>Preferred Worker (Optional)</Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { val: 'experienced', label: '💼 Experienced Only' },
                                { val: 'verified',    label: '✅ Verified Workers' },
                                { val: 'highest_rated', label: '⭐ Highest Rated'  },
                                { val: 'nearest',     label: '📍 Nearest Worker'  },
                            ].map(({ val, label }) => (
                                <button
                                    key={val} type="button"
                                    onClick={() => togglePreferred(val)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                                        form.preferredWorker.includes(val)
                                            ? 'bg-primary/15 border-primary text-primary'
                                            : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Contact Preference ── */}
                    <div className="bg-slate-900 border border-slate-800/60 rounded-3xl p-5">
                        <Label>Contact Preference</Label>
                        <div className="flex gap-3">
                            {[
                                { val: 'chat', label: '💬 Chat', icon: <MessageSquare className="w-4 h-4" /> },
                                { val: 'call', label: '📞 Call', icon: <Phone className="w-4 h-4" /> },
                                { val: 'both', label: '🔀 Both', icon: null },
                            ].map(({ val, label }) => (
                                <button
                                    key={val} type="button"
                                    onClick={() => set('contactPreference', val)}
                                    className={`flex-1 py-3 rounded-2xl border text-sm font-bold transition-all cursor-pointer ${
                                        form.contactPreference === val
                                            ? 'bg-primary/15 border-primary text-primary'
                                            : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-white hover:border-slate-600'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── Submit ── */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-primary to-orange-500 hover:from-orange-600 hover:to-orange-600 text-white font-black text-base rounded-2xl shadow-2xl shadow-orange-500/30 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-3"
                    >
                        {submitting
                            ? <><Loader2 className="w-5 h-5 animate-spin" /> Posting Requirement...</>
                            : <><Zap className="w-5 h-5" /> Post Requirement — Notify Nearby Workers</>
                        }
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PostRequirement;
