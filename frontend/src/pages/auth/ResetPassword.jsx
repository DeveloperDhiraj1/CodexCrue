import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { firebaseAuth } from '../../services/firebase';
import { firebaseErrorMessage } from '../../services/firebaseErrors';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const actionCode = searchParams.get('oobCode');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const isMatch = password && password === confirmPassword;

  useEffect(() => {
    if (!actionCode) {
      setError('This password reset link is missing or invalid.');
      setLoading(false);
      return;
    }
    verifyPasswordResetCode(firebaseAuth, actionCode)
      .then(setEmail)
      .catch((firebaseError) => setError(firebaseErrorMessage(firebaseError, 'This password reset link is invalid.')))
      .finally(() => setLoading(false));
  }, [actionCode]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (password.length < 8) return setError('Password must be at least 8 characters long.');
    if (!isMatch) return setError('Passwords do not match.');
    setLoading(true);
    setError(null);
    try {
      await confirmPasswordReset(firebaseAuth, actionCode, password);
      setSuccess(true);
    } catch (firebaseError) {
      setError(firebaseErrorMessage(firebaseError, 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page"><div className="auth-card">
      <div className="auth-logo"><div className="auth-logo-dot">CC</div><span>Codex<strong>Crue</strong></span></div>
      <h1 className="auth-title">Reset password</h1>
      <p className="auth-subtitle">{email ? `Set a new password for ${email}.` : 'Enter your new password below.'}</p>
      {error && <div className="auth-error">{error}</div>}
      {success && <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>Password reset successfully. You can now log in.</div>}
      {!success && !error && <form className="auth-form" onSubmit={handleSubmit}><div className="auth-field"><label className="label">New password</label><div className="auth-input-wrap"><input type="password" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required /></div></div><div className="auth-field"><label className="label">Confirm new password</label><div className="auth-input-wrap"><input type="password" className="auth-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>{confirmPassword.length > 0 && <div style={{ fontSize: '12px', color: isMatch ? '#10B981' : '#EF4444', marginTop: '4px' }}>{isMatch ? 'Passwords match' : 'Passwords do not match'}</div>}</div><button type="submit" className="auth-btn" disabled={loading || !isMatch || password.length === 0}>{loading ? 'Resetting...' : 'Reset password'}</button></form>}
      <div style={{ marginTop: '24px', textAlign: 'center' }}><Link to="/login" className="auth-link">Back to Sign in</Link></div>
    </div></div>
  );
}
