import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Hammer, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

import { useAuth } from '../context/AuthContext';

const Register = () => {
    const { login } = useAuth();
    const [role, setRole] = useState('user');

    // Additional fields for Labour
    const [labourFields, setLabourFields] = useState(false);

    // State for form data
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        phone: '',
        profession: '',
        rate: '',
        location: '' // Simplification for now, address string
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setLabourFields(newRole === 'labour');
        // Optionally clear labour-specific fields if switching from labour to user
        if (newRole === 'user') {
            setFormData(prev => ({
                ...prev,
                profession: '',
                rate: '',
                location: ''
            }));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Prepare payload
            const payload = {
                role,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                ...(role === 'labour' && {
                    profession: formData.profession,
                    rate: Number(formData.rate),
                    location: { address: formData.location }
                })
            };

            const res = await axios.post('http://localhost:5000/api/auth/register', payload);

            // Success - Update Context
            // Backend returns: { _id, username, email, role, token }
            // So we pass the whole object as user data
            login(res.data, res.data.token);

            navigate('/dashboard');

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary">
                        Create an Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join DailyLabour community today
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div
                        onClick={() => handleRoleChange('user')}
                        className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${role === 'user' ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className={`p-3 rounded-full mb-2 ${role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <User className="w-6 h-6" />
                        </div>
                        <h3 className={`font-bold ${role === 'user' ? 'text-secondary' : 'text-gray-500'}`}>Hire Labour</h3>
                        <p className="text-xs text-center text-gray-400 mt-1">I want to hire help</p>
                    </div>

                    <div
                        onClick={() => handleRoleChange('labour')}
                        className={`cursor-pointer p-4 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${role === 'labour' ? 'border-primary bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className={`p-3 rounded-full mb-2 ${role === 'labour' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Hammer className="w-6 h-6" />
                        </div>
                        <h3 className={`font-bold ${role === 'labour' ? 'text-secondary' : 'text-gray-500'}`}>Work as Labour</h3>
                        <p className="text-xs text-center text-gray-400 mt-1">I want to find work</p>
                    </div>
                </div>

                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Common Fields */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" name="username" value={formData.username} onChange={handleChange} required className="input-field w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none" placeholder="John Doe" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input-field w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none" placeholder="john@example.com" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className="input-field w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none" placeholder="+91 98765 43210" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="input-field w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none" placeholder="••••••••" />
                        </div>

                        {/* Labour Specific Fields */}
                        {labourFields && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="md:col-span-2 space-y-6 pt-4 border-t border-gray-200"
                            >
                                <h3 className="text-lg font-bold text-secondary">Professional Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                                        <select name="profession" value={formData.profession} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none">
                                            <option value="">Select Profession</option>
                                            <option value="Plumber">Plumber</option>
                                            <option value="Electrician">Electrician</option>
                                            <option value="Carpenter">Carpenter</option>
                                            <option value="Painter">Painter</option>
                                            <option value="Cleaner">Cleaner</option>
                                            <option value="Gardener">Gardener</option>
                                            <option value="Helper">Helper</option>
                                            <option value="Mason">Mason</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (₹)</label>
                                        <input type="number" name="rate" value={formData.rate} onChange={handleChange} className="input-field w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none" placeholder="e.g. 200" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location / Service Area</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="input-field w-full pl-10 px-4 py-3 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary focus:outline-none" placeholder="Enter your city or area" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Work Portfolio / Images</label>
                                        <input type="file" multiple className="block w-full text-sm text-slate-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-full file:border-0
                              file:text-sm file:font-semibold
                              file:bg-orange-50 file:text-primary
                              hover:file:bg-orange-100
                            "/>
                                        <p className="text-xs text-gray-500 mt-1">Upload photos of your past work (Max 5)</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-lg text-white bg-primary hover:bg-primaryDark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg hover:shadow-xl mt-6"
                        >
                            {role === 'user' ? 'Register As User' : 'Register As Labour'}
                        </button>
                    </div>
                </form>
                <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primaryDark">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
