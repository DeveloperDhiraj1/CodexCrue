import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, reload, sendEmailVerification, updateProfile } from 'firebase/auth';
import api from '../../services/api';
import { firebaseAuth } from '../../services/firebase';
import { firebaseErrorMessage } from '../../services/firebaseErrors';
import { initializeAuth } from '../../store/slices/authSlice';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const getPasswordStrength = (pass) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const isStrongEnough = passwordStrength >= 5;
  const isMatch = password && password === confirmPassword;
  const getMeterClass = () => passwordStrength <= 2 ? 'weak' : passwordStrength <= 4 ? 'ok' : 'strong';

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!isStrongEnough || !isMatch) return;

    setLoading(true);
    setError(null);
    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      const firebaseIdToken = await credential.user.getIdToken(true);
      await api.post('/auth/sync', { name: name.trim() }, {
        headers: { Authorization: `Bearer ${firebaseIdToken}` }
      });
      await sendEmailVerification(credential.user, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });
      setVerificationSent(true);
      setStep('verify');
    } catch (firebaseError) {
      setError(firebaseErrorMessage(firebaseError, 'Registration failed.'));
    } finally {
      setLoading(false);
    }
  };

  const sendVerification = async () => {
    if (!firebaseAuth.currentUser) {
      setError('Your registration session has expired. Please create your account again.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await sendEmailVerification(firebaseAuth.currentUser, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: false
      });
      setVerificationSent(true);
    } catch (firebaseError) {
      setError(firebaseErrorMessage(firebaseError, 'Could not resend the verification email.'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!firebaseAuth.currentUser) {
      setError('Your registration session has expired. Please create your account again.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await reload(firebaseAuth.currentUser);
      if (!firebaseAuth.currentUser.emailVerified) {
        setError('Your email is not verified yet. Open the link in your inbox, then try again.');
        return;
      }
      await firebaseAuth.currentUser.getIdToken(true);
      await dispatch(initializeAuth()).unwrap();
      navigate('/onboarding');
    } catch (firebaseError) {
      setError(firebaseErrorMessage(firebaseError, 'Verification could not be completed.'));
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo"><div className="auth-logo-dot">CC</div><span>Codex<strong>Crue</strong></span></div>
          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-subtitle">We sent a verification link to {email}. Open it, then return here.</p>
          {error && <div className="auth-error">{error}</div>}
          {verificationSent && <div style={{ backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>Verification email sent.</div>}
          <button type="button" className="auth-btn" onClick={handleVerify} disabled={loading}>
            {loading ? 'Checking...' : 'I verified my email'}
          </button>
          <button type="button" className="auth-link" onClick={sendVerification} disabled={loading} style={{ display: 'block', margin: '18px auto 0', background: 'none', border: 0, cursor: 'pointer' }}>
            Resend verification email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><div className="auth-logo-dot">CC</div><span>Codex<strong>Crue</strong></span></div>
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your personalized learning journey.</p>
        {error && <div className="auth-error">{error}</div>}
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-field"><label className="label">Full name</label><div className="auth-input-wrap"><input type="text" className="auth-input" value={name} onChange={(e) => setName(e.target.value)} required /></div></div>
          <div className="auth-field"><label className="label">Email address</label><div className="auth-input-wrap"><input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required /></div></div>
          <div className="auth-field">
            <label className="label">Password</label>
            <div className="auth-input-wrap" style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: '40px' }} />
              <button type="button" className="auth-password-toggle" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>{showPassword ? 'Hide' : 'Show'}</button>
            </div>
            {password.length > 0 && <div className="pass-meter" style={{ marginTop: '8px' }}><div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>{[1, 2, 3, 4, 5].map((level) => <div key={level} className={`pass-bar ${passwordStrength >= level ? getMeterClass() : ''}`} style={{ height: '4px', flex: 1, backgroundColor: passwordStrength >= level ? (passwordStrength <= 2 ? '#EF4444' : passwordStrength <= 4 ? '#F59E0B' : '#10B981') : '#E5E7EB', borderRadius: '2px' }} />)}</div><div className="pass-text" style={{ fontSize: '12px', color: '#6B7280' }}>Requires 8+ chars, upper/lowercase, number, special char.</div></div>}
          </div>
          <div className="auth-field"><label className="label">Confirm password</label><div className="auth-input-wrap"><input type="password" className="auth-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>{confirmPassword.length > 0 && <div style={{ fontSize: '12px', color: isMatch ? '#10B981' : '#EF4444', marginTop: '4px' }}>{isMatch ? 'Passwords match' : 'Passwords do not match'}</div>}</div>
          <button type="submit" className="auth-btn" disabled={loading || !isStrongEnough || !isMatch}>{loading ? 'Creating account...' : 'Create account'}</button>
        </form>
        <div style={{ marginTop: '24px', textAlign: 'center' }}><span className="auth-footer-text">Already have an account? </span><Link to="/login" className="auth-link">Sign in</Link></div>
      </div>
    </div>
  );
}
