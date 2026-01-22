import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import Input from '../../components/Input/Input';
import './Auth.css';

const API_BASE_URL = 'http://localhost:8000/api/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        // Handle errors
        if (data.email) {
          setErrors({ email: data.email[0] });
        } else if (data.password) {
          setErrors({ password: data.password[0] });
        } else if (data.non_field_errors) {
          setErrors({ email: data.non_field_errors[0] });
        } else {
          setErrors({ email: 'Invalid email or password.' });
        }
      }
    } catch (error) {
      setErrors({ email: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel - Login Form */}
        <div className="auth-form-panel">
          <div className="auth-form-content">
            <Link to="/" className="auth-logo-link">
              <span className="logo-text text-2xl font-bold text-white mb-6 inline-block">SkillMate</span>
            </Link>
            <div className="auth-header">
              <h1 className="auth-title">Welcome Back</h1>
              <p className="auth-subtitle">
                Sign in to continue your domain discovery journey
              </p>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes('successful') 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-red-500/20 text-red-300 border border-red-500/30'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                required
                autoComplete="email"
                disabled={loading}
              />

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                autoComplete="current-password"
                disabled={loading}
              />

              <div className="auth-form-footer">
                <Link 
                  to="/admin/login" 
                  className="auth-link text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Admin Login
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="auth-divider">
              <span className="auth-divider-text">New to SkillMate?</span>
            </div>

            <div className="auth-switch">
              <p className="auth-switch-text">
                Don't have an account?{' '}
                <Link to="/signup" className="auth-link-primary">
                  Create one here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Illustration & Text */}
        <div className="auth-illustration-panel">
          <div className="auth-illustration-content">
            <div className="auth-illustration-icon">🔐</div>
            <h2 className="auth-illustration-title">
              Secure Access to Your Portal
            </h2>
            <p className="auth-illustration-text">
              Your personal domain discovery journey is safely stored here. 
              Sign in to access your recommendations, progress, and personalized guidance.
            </p>
            <div className="auth-features">
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Your data is encrypted and secure</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Access your progress anytime</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Continue where you left off</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

