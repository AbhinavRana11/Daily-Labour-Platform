import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const WorkerNav = () => {
  const { user } = useAuth();
  return (
    <>
      <Link to="/" className="text-gray-200 hover:text-primary transition-colors font-semibold text-sm tracking-wide uppercase">Home</Link>
      <Link to="/worker/requests" className="text-gray-200 hover:text-primary transition-colors font-semibold text-sm tracking-wide uppercase">Job Requests</Link>
      <Link to="/dashboard" className="text-gray-200 hover:text-primary transition-colors font-semibold text-sm tracking-wide uppercase">Dashboard</Link>
    </>
  );
};

export default WorkerNav;
