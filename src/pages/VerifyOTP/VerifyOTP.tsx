import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components';
import './VerifyOTP.css';

const API_BASE_URL = 'http://localhost:8000/api/auth';

const VerifyOTP: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) {
      navigate('/signup');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    const numValue = value.replace(/\D/g, '');
    
    if (numValue.length > 1) {
      // If pasting multiple digits, distribute them
      const digits = numValue.split('').slice(0, 6);
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = numValue;
      setOtp(newOtp);

      // Auto-focus next input
      if (numValue && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    // Clear errors
    if (errors.otp) {
      setErrors({});
    }
    setMessage('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pastedData.split('').forEach((digit, i) => {
      if (i < 6) {
        newOtp[i] = digit;
      }
    });
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    
    if (otpCode.length !== 6) {
      setErrors({ otp: 'Please enter all 6 digits' });
      return;
    }

    setLoading(true);
    setMessage('');
    setErrors({});

    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          otp_code: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setMessage('Account verified successfully! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        if (data.otp_code) {
          setErrors({ otp: data.otp_code[0] });
        } else if (data.email) {
          setErrors({ otp: data.email[0] });
        } else if (data.non_field_errors) {
          setErrors({ otp: data.non_field_errors[0] });
        } else {
          setErrors({ otp: 'Invalid OTP. Please try again.' });
        }
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setErrors({ otp: 'Network error. Please check your connection.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setErrors({});
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/resend-otp/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('New OTP sent to your email!');
        setTimeLeft(600); // Reset timer
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        if (data.email) {
          setErrors({ otp: data.email[0] });
        } else {
          setErrors({ otp: 'Failed to resend OTP. Please try again.' });
        }
      }
    } catch (error) {
      setErrors({ otp: 'Network error. Please try again.' });
    } finally {
      setResendLoading(false);
    }
  };

  const digitsEntered = otp.filter(d => d !== '').length;

  return (
    <div className="verify-otp-page">
      <div className="verify-otp-container">
        <div className="verify-otp-card">
          {/* Header */}
          <div className="verify-otp-header">
            <div className="verify-otp-status">
              <span className="status-dot"></span>
              <span className="status-text">VERIFY YOUR EMAIL</span>
            </div>
            <h1 className="verify-otp-title">
              Welcome to SkillMate 👋
            </h1>
            <p className="verify-otp-description">
              We've sent a <strong>6-digit code</strong> to your inbox. Enter it below to activate your account.
            </p>
          </div>

          {/* OTP Input Section */}
          <form onSubmit={handleVerify} className="verify-otp-form">
            <div className="otp-input-section">
              <label className="otp-label">ONE-TIME CODE</label>
              <div className="otp-inputs-container" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`otp-input ${errors.otp ? 'otp-input-error' : ''} ${digit ? 'otp-input-filled' : ''}`}
                    disabled={loading}
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              {errors.otp && (
                <p className="otp-error-message">{errors.otp}</p>
              )}
            </div>

            {/* Expiration Notice */}
            <div className="otp-expiration">
              <p>
                This code expires in <strong>{formatTime(timeLeft)}</strong>. Please don't share it with anyone.
              </p>
            </div>

            {/* Email Confirmation */}
            <div className="email-confirmation">
              <p>
                Sending to <strong>{email}</strong>
              </p>
              <Link to="/signup" className="change-email-link">
                Change email
              </Link>
            </div>

            {/* Buttons */}
            <div className="verify-otp-actions">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="resend-otp-btn"
              >
                {resendLoading ? 'Sending...' : 'Resend OTP'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={loading || digitsEntered !== 6}
                className="verify-otp-btn"
              >
                {loading ? 'Verifying...' : 'Verify & Continue'}
              </Button>
            </div>

            {/* Success Message */}
            {message && (
              <div className={`verify-otp-message ${message.includes('successfully') ? 'message-success' : ''}`}>
                {message}
              </div>
            )}
          </form>

          {/* Footer Status */}
          <div className="verify-otp-footer">
            <div className="footer-status">
              <span className="status-dot green"></span>
              <span>{digitsEntered}/6 digits entered</span>
            </div>
            <div className="footer-help">
              Need help? Check spam/promotions folder.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
