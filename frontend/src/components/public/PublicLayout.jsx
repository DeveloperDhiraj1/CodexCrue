import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PublicLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <div className="public-layout">
      <nav className={`public-nav ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="public-brand">
          <Link to="/" onClick={closeMobileMenu}>
            <span className="public-brand-dot"></span>
            <span className="public-brand-name">CodexCrue</span>
          </Link>
        </div>

        <button className="public-menu-toggle" onClick={toggleMobileMenu}>
          ☰
        </button>

        <div className="public-nav-links">
          <NavLink to="/" onClick={closeMobileMenu} end>Home</NavLink>
          <a href="/#how-it-works" onClick={closeMobileMenu}>How It Works</a>
          <NavLink to="/courses" onClick={closeMobileMenu}>Courses</NavLink>
          <a href="/#features" onClick={closeMobileMenu}>Features</a>
          <NavLink to="/about" onClick={closeMobileMenu}>About</NavLink>
        </div>

        <div className="public-nav-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="btn-primary" onClick={closeMobileMenu}>Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-login" onClick={closeMobileMenu}>Login</Link>
              <Link to="/register" className="btn-signup" onClick={closeMobileMenu}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <main className="public-main">
        {children}
      </main>

      <footer className="public-footer">
        <div className="footer-inner">
          <div className="footer-col footer-brand">
            <div className="public-brand">
              <span className="public-brand-dot"></span>
              <span className="public-brand-name">CodexCrue</span>
            </div>
            <p>Your AI-powered learning journey.</p>
          </div>
          <div className="footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="/#features">Features</a></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/ai-assistant">AI Assistant</Link></li>
              <li><Link to="/learning-path">Learning Paths</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><a href="mailto:hello@codexcrue.com">Contact</a></li>
              <li><Link to="/login">Sign in</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 CodexCrue. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
