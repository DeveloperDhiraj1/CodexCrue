import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { loginUser } from '../../store/slices/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { isAuthenticated, loading, error, user } = useSelector(state => state.auth);
  
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || (user?.role === 'admin' ? '/admin' : '/dashboard');
    return <Navigate to={from} replace />;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      const target = location.state?.from?.pathname || (result?.user?.role === 'admin' ? '/admin' : '/dashboard');
      navigate(target, { replace: true });
    } catch (err) {
      // Error is handled by redux slice and displayed from state
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-dot">CC</div>
          <span>Codex<strong>Crue</strong></span>
        </div>
        
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to continue your learning journey.</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="label">Password</label>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '12px' }}>Forgot password?</Link>
            </div>
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
          </div>
          
          <button 
            type="submit" 
            className="auth-btn" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <span className="auth-footer-text">New to CodexCrue? </span>
          <Link to="/register" className="auth-link">Create a free account</Link>
        </div>
      </div>
    </div>
  );
}
