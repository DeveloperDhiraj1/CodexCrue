import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';

export default function AppShell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="app-shell">
      <header className="app-topbar">
        <div className="app-brand">
          <span className="app-brand-dot"></span>
          <span>CodexCrue</span>
        </div>
        <div className="app-topbar-right">
          <span className="username-text">{user?.name || 'User'}</span>
          <div className="user-avatar">{getInitials(user?.name)}</div>
          <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
            ☰
          </button>
        </div>
      </header>

      <div className="app-body">
        {mobileMenuOpen && (
          <div
            className={`drawer-backdrop${mobileMenuOpen ? ' open' : ''}`}
            onClick={closeMobileMenu}
          />
        )}
        
        <aside className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            {!isAdmin ? (
              <>
                <div className="sidebar-section-label">Main</div>
                <NavLink to="/dashboard" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">◉</span> Dashboard
                </NavLink>
                <NavLink to="/my-learning" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">▶</span> My Learning
                </NavLink>
                <NavLink to="/learning-path" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">⟶</span> Learning Path
                </NavLink>
                <NavLink to="/recommendations" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">✦</span> Recommendations
                </NavLink>
                <NavLink to="/skill-gap" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">⌁</span> Skill Gap
                </NavLink>
                <NavLink to="/ai-assistant" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">◈</span> AI Assistant
                </NavLink>
                <NavLink to="/assessments" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">✎</span> Assessments
                </NavLink>
                <NavLink to="/progress" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">◷</span> Progress
                </NavLink>
              </>
            ) : (
              <>
                <div className="sidebar-section-label">Admin</div>
                <NavLink to="/admin" onClick={closeMobileMenu} end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">◉</span> Admin Dashboard
                </NavLink>
                <NavLink to="/admin/analytics" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">📊</span> Analytics
                </NavLink>
                <NavLink to="/admin/courses" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">📚</span> Courses
                </NavLink>
                <NavLink to="/admin/skills" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">🎯</span> Skills
                </NavLink>
                <NavLink to="/admin/resources" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">📁</span> Resources
                </NavLink>
                <NavLink to="/admin/users" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                  <span className="sidebar-link-icon">👥</span> Users
                </NavLink>
              </>
            )}

            <div className="sidebar-divider"></div>
            
            <div className="sidebar-bottom">
              <NavLink to="/profile" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-link-icon">◎</span> Profile
              </NavLink>
              <NavLink to="/settings" onClick={closeMobileMenu} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <span className="sidebar-link-icon">⚙</span> Settings
              </NavLink>
              <button onClick={handleLogout} className="sidebar-link sidebar-logout">
                <span className="sidebar-link-icon">⎋</span> Logout
              </button>
            </div>
          </nav>
        </aside>

        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
