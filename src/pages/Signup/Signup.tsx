import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components';
import Input from '../../components/Input/Input';
import '../Login/Auth.css';

const API_BASE_URL = '/api/auth';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      const url = `${API_BASE_URL}/signup/`;
      console.log('Signup request URL:', url);
      console.log('Signup request data:', { name: formData.name, email: formData.email });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      });
      
      console.log('Signup response status:', response.status, response.statusText);

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        // If response is not JSON, show a more helpful error
        setErrors({ email: `Server error: ${response.status} ${response.statusText}. Please try again.` });
        setLoading(false);
        return;
      }

      if (response.ok) {
        // Navigate to OTP verification page
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`);
      } else {
        // Handle errors
        if (data.email) {
          setErrors({ email: Array.isArray(data.email) ? data.email[0] : data.email });
        } else if (data.password) {
          setErrors({ password: Array.isArray(data.password) ? data.password[0] : data.password });
        } else if (data.non_field_errors) {
          setErrors({ email: Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors });
        } else if (data.error) {
          setErrors({ email: data.error });
        } else {
          setErrors({ email: 'Something went wrong. Please try again.' });
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      // More detailed error message
      const errorMessage = error.message || 'Network error. Please check your connection and ensure the backend server is running.';
      setErrors({ email: errorMessage });
    } finally {
      setLoading(false);
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

            {message && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                message.includes('successfully') 
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSignup} className="auth-form">
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Create Account'}
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

