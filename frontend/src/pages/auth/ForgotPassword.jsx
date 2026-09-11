import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { firebaseAuth } from '../../services/firebase';
import { firebaseErrorMessage } from '../../services/firebaseErrors';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim(), {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: true
      });
      setSuccess(true);
    } catch (firebaseError) {
      setError(firebaseErrorMessage(firebaseError, 'Failed to send reset instructions.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page"><div className="auth-card">
      <div className="auth-logo"><div className="auth-logo-dot">CC</div><span>Codex<strong>Crue</strong></span></div>
      <h1 className="auth-title">Forgot password?</h1>
      <p className="auth-subtitle">Enter your email and we&apos;ll send reset instructions.</p>
      {error && <div className="auth-error">{error}</div>}
      {success && <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>Check your inbox for reset instructions.</div>}
      {!success && <form className="auth-form" onSubmit={handleSubmit}><div className="auth-field"><label className="label">Email address</label><div className="auth-input-wrap"><input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required /></div></div><button type="submit" className="auth-btn" disabled={loading}>{loading ? 'Sending...' : 'Send instructions'}</button></form>}
      <div style={{ marginTop: '24px', textAlign: 'center' }}><Link to="/login" className="auth-link">Back to Sign in</Link></div>
    </div></div>
  );
}
