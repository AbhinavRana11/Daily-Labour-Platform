import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CustomerNav = () => {
  const { user } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/customer/home', label: 'Home' },
    { to: '/customer/find', label: 'Find Labour' },
    { to: '/customer/post-requirement', label: 'Post Requirement ⭐' },
    { to: '/customer/bookings', label: 'My Bookings' },
    { to: '/customer/messages', label: 'Messages' },
    { to: '/customer/profile', label: 'Profile' },
  ];

  return (
    <>
      {links.map(({ to, label }) => (
        <Link
          key={to}
          to={to}
          className={`transition-colors font-semibold text-sm tracking-wide uppercase ${
            location.pathname.startsWith(to)
              ? 'text-primary border-b-2 border-primary pb-0.5'
              : 'text-gray-200 hover:text-primary'
          }`}
        >
          {label}
        </Link>
      ))}
    </>
  );
};

export default CustomerNav;
