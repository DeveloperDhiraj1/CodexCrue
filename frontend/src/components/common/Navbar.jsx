import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';

export default function Navbar({ onMenuToggle }) {
  const dispatch = useDispatch(); const navigate = useNavigate(); const { user } = useSelector((state) => state.auth);
  const handleLogout = () => { dispatch(logoutUser()); navigate('/login'); };
  return <header className="topbar"><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><button className="mobile-menu-button" onClick={onMenuToggle} aria-label="Open navigation">☰</button><div className="brand" onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}><span className="brand-mark">CC</span><span>Codex<span className="brand-accent">Crue</span></span></div></div><div className="topbar-actions"><div className="user-chip"><Avatar name={user?.name} src={user?.avatar} /><span>{user?.name || 'Learner'}</span></div><button className="button button-ghost" onClick={handleLogout}>Sign out</button></div></header>;
}
