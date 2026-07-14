import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardRedirect = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role === 'admin') {
            navigate('/admin/dashboard');
        } else if (user.role === 'labour') {
            navigate('/worker/dashboard');
        } else {
            navigate('/customer/home');
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-405 font-sans">
            Redirecting to role-based dashboard...
        </div>
    );
};

export default DashboardRedirect;
