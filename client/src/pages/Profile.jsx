import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileRedirect = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role === 'labour') {
            navigate('/worker/profile');
        } else {
            navigate('/customer/profile');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-405 font-sans">
            Redirecting to profile configuration...
        </div>
    );
};

export default ProfileRedirect;
