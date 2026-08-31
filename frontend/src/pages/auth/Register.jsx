import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { initializeAuth } from '../../store/slices/authSlice';

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  
  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // OTP state
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

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
  const isStrongEnough = passwordStrength >= 3;
  const isMatch = password && password === confirmPassword;
  
  const getMeterClass = () => {
    if (passwordStrength <= 2) return 'weak';
    if (passwordStrength <= 4) return 'ok';
    return 'strong';
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isStrongEnough || !isMatch) return;
    
    setLoading(true);
    setError(null);
    try {
      await api.post('/auth/register', { name, email, password });
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setOtpLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/verify-otp', { email, otp });
      localStorage.setItem('cortex_token', response.data.data.token);
      await dispatch(initializeAuth());
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  if (step === 'verify') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-dot">CC</div>
            <span>Codex<strong>Crue</strong></span>
          </div>
          
          <h1 className="auth-title">Verify your email</h1>
          <p className="auth-subtitle">Enter the 6-digit code sent to {email}</p>
          
          {error && <div className="auth-error">{error}</div>}
          
          <form className="auth-form" onSubmit={handleVerify}>
            <div className="auth-field" style={{ textAlign: 'center' }}>
              <input 
                type="text" 
                className="otp-input auth-input" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', padding: '12px' }}
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-btn" 
              disabled={otpLoading || otp.length !== 6}
            >
              {otpLoading ? 'Verifying...' : 'Verify & continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-dot">CC</div>
          <span>Codex<strong>Crue</strong></span>
        </div>
        
        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Start your personalized learning journey.</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-field">
            <label className="label">Full name</label>
            <div className="auth-input-wrap">
              <input 
                type="text" 
                className="auth-input" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="label">Email address</label>
            <div className="auth-input-wrap">
              <input 
                type="email" 
                className="auth-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="auth-field">
            <label className="label">Password</label>
            <div className="auth-input-wrap" style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                className="auth-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button 
                type="button" 
                className="auth-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            
            {password.length > 0 && (
              <div className="pass-meter" style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div 
                      key={level} 
                      className={`pass-bar ${passwordStrength >= level ? getMeterClass() : ''}`}
                      style={{ 
                        height: '4px', 
                        flex: 1, 
                        backgroundColor: passwordStrength >= level 
                          ? (passwordStrength <= 2 ? '#EF4444' : passwordStrength <= 4 ? '#F59E0B' : '#10B981') 
                          : '#E5E7EB',
                        borderRadius: '2px',
                        transition: 'background-color 0.3s'
                      }}
                    />
                  ))}
                </div>
                <div className="pass-text" style={{ fontSize: '12px', color: '#6B7280' }}>
                  Requires 8+ chars, upper/lowercase, number, special char.
                </div>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label className="label">Confirm password</label>
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
            disabled={loading || !isStrongEnough || !isMatch}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <span className="auth-footer-text">Already have an account? </span>
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
