import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components';
import Input from '../../components/Input/Input';
import '../Login/Auth.css';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Handle signup - to be connected to backend later
      console.log('Signup attempt:', formData);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Panel - Signup Form */}
        <div className="auth-form-panel">
          <div className="auth-form-content">
            <Link to="/" className="auth-logo-link">
              <span className="logo-text text-2xl font-bold text-white mb-6 inline-block">SkillMate</span>
            </Link>
            <div className="auth-header">
              <h1 className="auth-title">Start Your Journey</h1>
              <p className="auth-subtitle">
                Create your account and discover your perfect CS domain
              </p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <Input
                type="text"
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                required
                autoComplete="name"
              />

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
              />

              <Input
                type="password"
                name="password"
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                autoComplete="new-password"
              />

              <Input
                type="password"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                required
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
              >
                Create Account
              </Button>
            </form>

            <div className="auth-divider">
              <span className="auth-divider-text">Already have an account?</span>
            </div>

            <div className="auth-switch">
              <p className="auth-switch-text">
                Sign in to your existing account{' '}
                <Link to="/login" className="auth-link-primary">
                  here
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel - Illustration & Text */}
        <div className="auth-illustration-panel">
          <div className="auth-illustration-content">
            <div className="auth-illustration-icon">🚀</div>
            <h2 className="auth-illustration-title">
              Begin Your Domain Discovery
            </h2>
            <p className="auth-illustration-text">
              Join SkillMate and take the first step toward understanding which 
              engineering domain fits you best. No pressure, no confusion—just 
              clear guidance tailored for you.
            </p>
            <div className="auth-features">
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Free to use, no hidden costs</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Personalized recommendations</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Beginner-friendly approach</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

