import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthPrompt({ path, onClose }) {
  return <div className="public-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="auth-prompt-title" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><div className="public-auth-modal"><button className="public-modal-close" type="button" onClick={onClose} aria-label="Close">×</button><span className="public-modal-icon">✦</span><h2 id="auth-prompt-title">Unlock your personalized journey</h2><p>Create a free CodexCrue account to use this personalized feature and keep your progress in one place.</p><div className="public-modal-actions"><Link className="public-button public-button-primary" to="/register" state={{ from: { pathname: path } }}>Sign Up</Link><Link className="public-button public-button-secondary" to="/login" state={{ from: { pathname: path } }}>Login</Link></div></div></div>;
}
