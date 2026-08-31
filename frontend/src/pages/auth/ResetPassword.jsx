import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../services/api';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const isMatch = password && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMatch) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-dot">CC</div>
          <span>Codex<strong>Crue</strong></span>
        </div>
        
        <h1 className="auth-title">Reset password</h1>
        <p className="auth-subtitle">Enter your new password below.</p>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>Password reset successfully. You can now log in.</div>}
        
        {!success && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="label">New password</label>
              <div className="auth-input-wrap">
                <input 
                  type="password" 
                  className="auth-input" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="label">Confirm new password</label>
              <div className="auth-input-wrap">
                <input 
                  type="password" 
                  className="auth-input" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              {confirmPassword.length > 0 && (
                <div style={{ fontSize: '12px', color: isMatch ? '#10B981' : '#EF4444', marginTop: '4px' }}>
                  {isMatch ? 'Passwords match' : 'Passwords do not match'}
                </div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="auth-btn" 
              disabled={loading || !isMatch || password.length === 0}
            >
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <Link to="/login" className="auth-link">Back to Sign in</Link>
        </div>
      </div>
    </div>
  );
}
