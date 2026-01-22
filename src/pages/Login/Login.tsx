import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components';
import Input from '../../components/Input/Input';
import './Auth.css';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login - to be connected to backend later
    console.log('Login attempt:', formData);
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

            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
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
              >
                Sign In
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

