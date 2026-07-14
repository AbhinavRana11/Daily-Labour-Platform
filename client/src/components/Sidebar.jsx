import { NavLink } from 'react-router-dom';
import {
  Home,
  Search,
  Calendar,
  Clock,
  MessageSquare,
  User as UserIcon,
  DollarSign,
  Settings,
  LogOut,
  Briefcase,
  BarChart2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const { user, logout } = useAuth();

  const navMap = {
    customer: [
      { to: '/customer/home', icon: <Home />, label: 'Home' },
      { to: '/customer/find', icon: <Search />, label: 'Find Labour' },
      { to: '/customer/bookings', icon: <Calendar />, label: 'My Bookings' },
      { to: '/customer/messages', icon: <MessageSquare />, label: 'Messages' },
      { to: '/customer/profile', icon: <UserIcon />, label: 'Profile' },
    ],
    worker: [
      { to: '/worker/dashboard', icon: <Briefcase />, label: 'Dashboard' },
      { to: '/worker/today-jobs', icon: <Calendar />, label: 'Today Jobs' },
      { to: '/worker/messages', icon: <MessageSquare />, label: 'Messages' },
      { to: '/worker/earnings', icon: <DollarSign />, label: 'Earnings' },
      { to: '/worker/analytics', icon: <BarChart2 />, label: 'Analytics' },
      { to: '/worker/profile', icon: <UserIcon />, label: 'Profile' },
      { to: '/worker/settings', icon: <Settings />, label: 'Settings' },
    ],
    admin: [
      { to: '/admin/dashboard', icon: <ShieldCheck />, label: 'Dashboard' },
      { to: '/admin/users', icon: <Users />, label: 'Users' },
      { to: '/admin/workers', icon: <Briefcase />, label: 'Workers' },
      { to: '/admin/bookings', icon: <Calendar />, label: 'Bookings' },
      { to: '/admin/reviews', icon: <MessageSquare />, label: 'Reviews' },
      { to: '/admin/reports', icon: <BarChart2 />, label: 'Reports' },
    ],
  };

  const currentNav = navMap[user?.role] || [];

  return (
    <aside className="w-64 bg-white h-screen shadow-md p-4 flex flex-col">
      <div className="flex-1 space-y-2">
        {currentNav.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 p-2 rounded transition-colors ${
                isActive ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            {icon}
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-3 p-2 rounded text-red-600 hover:bg-red-50"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </aside>
  );
};
