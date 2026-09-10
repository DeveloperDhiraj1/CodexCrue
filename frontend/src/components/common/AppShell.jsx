import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';

const iconPaths = {
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
  learning: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h8" /></>,
  path: <><circle cx="5" cy="18" r="2" /><circle cx="12" cy="7" r="2" /><circle cx="19" cy="17" r="2" /><path d="m6.7 16.8 3.7-7.6m3.4-.2 3.5 6.3" /></>,
  recommendations: <><path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" /><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" /></>,
  skills: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" /></>,
  ai: <><rect x="5" y="7" width="14" height="12" rx="3" /><path d="M9 7V4m6 3V4M3 11h2m14 0h2M9 13h.01M15 13h.01M9 16h6" /></>,
  assessment: <><path d="M7 3h8l4 4v14H7z" /><path d="M15 3v5h4M10 13h6M10 17h6" /></>,
  progress: <><path d="M4 19V5m0 14h16" /><path d="m7 15 3-4 3 2 5-7" /></>,
  analytics: <><path d="M4 19V5m0 14h16" /><rect x="7" y="12" width="2.5" height="4" rx=".5" /><rect x="11" y="9" width="2.5" height="7" rx=".5" /><rect x="15" y="6" width="2.5" height="10" rx=".5" /></>,
  courses: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16M8 7h8M8 11h8" /></>,
  resources: <><path d="M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></>,
  users: <><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0M17 11a3 3 0 1 0 0-6M17 14a5 5 0 0 1 4 6" /></>,
  profile: <><circle cx="12" cy="8" r="3.5" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  settings: <><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.1h-2.6V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.6-1H6v-2.6h.4A1.7 1.7 0 0 0 8 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.6v.4a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.4V14h-.4a1.7 1.7 0 0 0-1.6 1z" /></>,
  logout: <><path d="M10 5H5v14h5M14 8l4 4-4 4M8 12h10" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>
};

function Icon({ name }) { return <svg className="sidebar-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPaths[name] || iconPaths.dashboard}</svg>; }

const learnerLinks = [['dashboard', '/dashboard', 'Dashboard'], ['learning', '/my-learning', 'My Learning'], ['path', '/learning-path', 'Learning Path'], ['recommendations', '/recommendations', 'Recommendations'], ['skills', '/skill-gap', 'Skill Gap'], ['ai', '/ai-assistant', 'AI Assistant'], ['assessment', '/assessments', 'Assessments'], ['progress', '/progress', 'Progress']];
const adminLinks = [['dashboard', '/admin', 'Admin Dashboard'], ['analytics', '/admin/analytics', 'Analytics'], ['courses', '/admin/courses', 'Courses'], ['skills', '/admin/skills', 'Skills'], ['resources', '/admin/resources', 'Resources'], ['users', '/admin/users', 'Users']];

export default function AppShell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); const { user } = useSelector((state) => state.auth); const dispatch = useDispatch(); const navigate = useNavigate(); const isAdmin = user?.role === 'admin';
  const closeMenu = () => setMobileMenuOpen(false); const handleLogout = () => { dispatch(logoutUser()); navigate('/'); }; const initials = user?.name ? user.name.charAt(0).toUpperCase() : 'U'; const links = isAdmin ? adminLinks : learnerLinks;
  return <div className="app-shell"><header className="app-topbar"><button className="mobile-menu-btn" onClick={() => setMobileMenuOpen((value) => !value)} aria-label="Open navigation"><Icon name="menu" /></button><div className="app-brand" onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}><span className="app-brand-dot">CC</span><span>CodexCrue</span></div><div className="app-topbar-right"><span className="username-text">{user?.name || 'User'}</span><div className="user-avatar">{user?.avatar ? <img src={user.avatar} alt="Profile" /> : initials}</div></div></header><div className="app-body">{mobileMenuOpen && <div className="drawer-backdrop open" onClick={closeMenu} />}<aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}><nav className="sidebar-nav"><div className="sidebar-section-label">{isAdmin ? 'Admin' : 'Main'}</div>{links.map(([icon, path, label]) => <NavLink key={path} to={path} end={path === '/admin'} onClick={closeMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><span className="sidebar-link-icon"><Icon name={icon} /></span>{label}</NavLink>)}<div className="sidebar-divider" /><div className="sidebar-bottom"><NavLink to="/profile" onClick={closeMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><span className="sidebar-link-icon"><Icon name="profile" /></span>Profile</NavLink><NavLink to="/settings" onClick={closeMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}><span className="sidebar-link-icon"><Icon name="settings" /></span>Settings</NavLink><button onClick={handleLogout} className="sidebar-link sidebar-logout"><span className="sidebar-link-icon"><Icon name="logout" /></span>Logout</button></div></nav></aside><main className="app-main">{children}</main></div></div>;
}
