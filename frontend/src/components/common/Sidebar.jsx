import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Sidebar() {
  const user = useSelector((state) => state.auth.user);
  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Learning Path', path: '/learning-path' },
    { name: 'Skill Gap', path: '/skill-gap' },
    { name: 'Courses', path: '/courses' },
    { name: 'AI Assistant', path: '/ai-assistant' },
    { name: 'Profile', path: '/profile' },
    ...(user?.role === 'admin' ? [{ name: 'Admin Portal', path: '/admin' }] : [])
  ];

  return (
    <aside className="w-64 bg-white border-r border-emerald-100 min-h-[calc(100vh-73px)] p-6 shadow-sm hidden md:block">
      <nav className="space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive 
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30' 
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
