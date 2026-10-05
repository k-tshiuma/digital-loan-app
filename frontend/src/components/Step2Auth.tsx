import React, { useState, useEffect, useRef } from 'react';
import {
  LogIn,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  KeyRound,
  User as UserIcon,
  Globe,
} from 'lucide-react';
import { Language, User } from '../types';
import { COUNTRY_PHONE_CODES } from '../config/appConfig';
import { t } from '../i18n/translations';
import { storageService } from '../services/storage';
import { apiService, isNetworkError } from '../services/api';

interface Step2AuthProps {
  language: Language;
  onAuthenticated: (user: User) => void;
  onBack: () => void;
}

export const Step2Auth: React.FC<Step2AuthProps> = ({
  language,
  onAuthenticated,
  onBack,
}) => {
  // Main view state: 'signin' | 'reg_location' | 'reg_disclaimer' | 'reg_step1' | 'reg_step2_otp' | 'reg_step3_pwd' | 'signin_otp' | 'signin_pwd' | 'forgot_password' | 'reset_password'
  const [authMode, setAuthMode] = useState<
    'signin' | 'reg_location' | 'reg_disclaimer' | 'reg_step1' | 'reg_step2_otp' | 'reg_step3_pwd' | 'signin_otp' | 'signin_pwd' | 'forgot_password' | 'reset_password'
  >('signin');

  // Pre-registration states
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimer] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Sign In inputs
  const [signInCountryCode, setSignInCountryCode] = useState('+972');
  const [signInPhone, setSignInPhone] = useState('50 123 4567');
  const [signInPassword, setSignInPassword] = useState('');
  const [showSignInPassword, setShowSignInPassword] = useState(false);

  // Forgot / Reset Password inputs
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [forgotSuccessMessage, setForgotSuccessMessage] = useState<string | null>(null);

  // Registration inputs
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+972');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // OTP State
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [generatedDemoCode, setGeneratedDemoCode] = useState<string>('123456');

  // Status & Error States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Format full international phone numbers
  const cleanSignInPhone = signInPhone.replace(/\D/g, '');
  const fullSignInPhone = `${signInCountryCode}${cleanSignInPhone}`;

  const cleanRegPhone = regPhone.replace(/\D/g, '');
  const fullRegPhone = `${regCountryCode}${cleanRegPhone}`;

  // Countdown timer for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if ((authMode === 'reg_step2_otp' || authMode === 'signin_otp') && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authMode, resendTimer]);

  // Password validation checks for Step 3
  const hasMinLength = regPassword.length >= 8;
  const hasNumber = /\d/.test(regPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(regPassword);
  const isPasswordValid = hasMinLength && hasNumber && hasSpecialChar;
  const passwordsMatch = regPassword === regConfirmPassword && regConfirmPassword.length > 0;

  // ----------------------------------------------------
  // Sign In Handlers
  // ----------------------------------------------------
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!cleanSignInPhone || cleanSignInPhone.length < 7) {
      setErrorMessage('Please enter a valid mobile phone number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const lookup = await apiService.lookupPhone(fullSignInPhone);
      setIsSubmitting(false);
      if (lookup.exists && lookup.hasPassword) {
        setAuthMode('signin_pwd');
      } else {
        const otpRes = await apiService.requestOtp(fullSignInPhone);
        if (otpRes.demoCode) setGeneratedDemoCode(otpRes.demoCode);
        setOtpDigits(['', '', '', '', '', '']);
        setResendTimer(otpRes.expiresInSeconds || 45);
        setAuthMode('signin_otp');
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      }
    } catch (apiErr: any) {
      // Fallback to storageService if backend is offline or unreachable
      const existingUser = storageService.findUserByPhone(fullSignInPhone);
      setIsSubmitting(false);
      if (existingUser && existingUser.password) {
        setAuthMode('signin_pwd');
      } else {
        const { code } = storageService.generateOTP(fullSignInPhone, language);
        setGeneratedDemoCode(code);
        setOtpDigits(['', '', '', '', '', '']);
        setResendTimer(45);
        setAuthMode('signin_otp');
        setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
      }
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signInPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await apiService.loginWithPassword(fullSignInPhone, signInPassword);
      setIsSubmitting(false);
      // Sync local storage session
      storageService.loginWithPassword(fullSignInPhone, signInPassword);
      onAuthenticated(user);
    } catch (apiErr: any) {
      if (isNetworkError(apiErr)) {
        const res = storageService.loginWithPassword(fullSignInPhone, signInPassword);
        setIsSubmitting(false);
        if (res.success && res.user) {
          onAuthenticated(res.user);
        } else {
          setErrorMessage(res.error || 'Invalid credentials');
        }
      } else {
        setIsSubmitting(false);
        setErrorMessage(apiErr.message || 'Incorrect password. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    const demoProfile = {
      name: 'Demo Borrower',
      email: 'borrower@lendglobal.io',
    };
    try {
      const user = await apiService.loginWithGoogleDemo(demoProfile, language);
      setIsSubmitting(false);
      storageService.loginWithGoogle(demoProfile, language);
      onAuthenticated(user);
    } catch (apiErr: any) {
      // Fallback
      const res = storageService.loginWithGoogle(demoProfile, language);
      setIsSubmitting(false);
      onAuthenticated(res.user);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotSuccessMessage(null);

    if (!forgotIdentifier.trim()) {
      setErrorMessage('Please enter your registered mobile phone number or email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiService.forgotPassword(forgotIdentifier.trim());
      setIsSubmitting(false);
      if (res.demoCode) {
        setResetCode(res.demoCode);
      }
      setForgotSuccessMessage(res.message || 'Password reset code sent!');
      setAuthMode('reset_password');
    } catch (err: any) {
      setIsSubmitting(false);
      setForgotSuccessMessage('If an account exists, a reset code has been sent.');
      setAuthMode('reset_password');
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!resetCode.trim() || resetCode.trim().length < 6) {
      setErrorMessage('Please enter the 6-digit reset code.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await apiService.resetPassword(forgotIdentifier.trim(), resetCode.trim(), newPassword);
      setIsSubmitting(false);
      onAuthenticated(user);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to reset password. Please check the code.');
    }
  };

  // ----------------------------------------------------
  // Pre-Registration Handlers
  // ----------------------------------------------------
  const handleRequestLocation = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsSubmitting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsSubmitting(false);
        setHasLocationPermission(true);
        setAuthMode('reg_disclaimer');
      },
      (error) => {
        setIsSubmitting(false);
        setLocationError("Location permission is required to proceed. Please enable it in your browser settings.");
      }
    );
  };

  const handleDisclaimerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasAgreedToDisclaimer) {
      setErrorMessage('You must agree to the monthly service charge to proceed.');
      return;
    }
    setErrorMessage(null);
    setAuthMode('reg_step1');
  };

  // ----------------------------------------------------
  // Registration Handlers
  // ----------------------------------------------------
  const handleRegStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!regFullName.trim()) {
      setErrorMessage('Please enter your full name as it appears on your passport.');
      return;
    }

    if (!regEmail.trim() || !regEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!cleanRegPhone || cleanRegPhone.length < 7) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    // Check duplicate open application
    const dupCheck = storageService.checkDuplicateOpenApplication(fullRegPhone);
    if (dupCheck.isDuplicate) {
      setErrorMessage(
        `An active application is already associated with this phone number (Request ID: ${dupCheck.existingRequestNumber})`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const otpRes = await apiService.requestOtp(fullRegPhone);
      const code = otpRes?.demoCode || storageService.generateOTP(fullRegPhone, language).code;
      setGeneratedDemoCode(code);
      storageService.generateOTP(fullRegPhone, language);
    } catch {
      const { code } = storageService.generateOTP(fullRegPhone, language);
      setGeneratedDemoCode(code);
    } finally {
      setIsSubmitting(false);
      setOtpDigits(['', '', '', '', '', '']);
      setResendTimer(45);
      setAuthMode('reg_step2_otp');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    }
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const numericVal = val.replace(/\D/g, '');
    const newDigits = [...otpDigits];

    if (numericVal.length > 1) {
      // Paste handler
      const pasted = numericVal.slice(0, 6).split('');
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();

      if (pasted.length === 6) {
        verifyOtpCode(newDigits.join(''));
      }
    } else {
      newDigits[index] = numericVal;
      setOtpDigits(newDigits);
      if (numericVal && index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
      if (numericVal && index === 5 && newDigits.every((d) => d !== '')) {
        verifyOtpCode(newDigits.join(''));
      }
    }

    setErrorMessage(null);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOtpCode = async (codeToVerify?: string) => {
    const code = codeToVerify || otpDigits.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const targetPhone = authMode === 'reg_step2_otp' ? fullRegPhone : fullSignInPhone;

    try {
      const user = await apiService.verifyOTP(targetPhone, code, language);
      setIsSubmitting(false);
      // Keep local storage synced
      storageService.verifyOTP(targetPhone, code);

      if (authMode === 'reg_step2_otp') {
        setAuthMode('reg_step3_pwd');
      } else {
        onAuthenticated(user);
      }
    } catch (apiErr: any) {
      // Demo / testing fallback: check if local storage or generated demo code accepts it
      const res = storageService.verifyOTP(targetPhone, code);
      if (res.success && res.user) {
        setIsSubmitting(false);
        if (authMode === 'reg_step2_otp') {
          setAuthMode('reg_step3_pwd');
        } else {
          onAuthenticated(res.user);
        }
        return;
      }

      setIsSubmitting(false);
      setErrorMessage(apiErr.message || 'Incorrect verification code. Please try again.');
    }
  };

  const handleRegStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isPasswordValid) {
      setErrorMessage('Please make sure your password meets all the requirements below.');
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await apiService.register({
        fullName: regFullName,
        email: regEmail,
        phoneNumber: fullRegPhone,
        password: regPassword,
        preferredLanguage: language,
      });

      storageService.registerUser({
        fullName: regFullName,
        email: regEmail,
        phoneNumber: fullRegPhone,
        password: regPassword,
        preferredLanguage: language,
      });

      setIsSubmitting(false);
      onAuthenticated(user);
    } catch (apiErr: any) {
      if (isNetworkError(apiErr)) {
        const res = storageService.registerUser({
          fullName: regFullName,
          email: regEmail,
          phoneNumber: fullRegPhone,
          password: regPassword,
          preferredLanguage: language,
        });

        setIsSubmitting(false);
        if (res.success && res.user) {
          onAuthenticated(res.user);
        } else {
          setErrorMessage(res.error || 'Failed to complete registration');
        }
      } else {
        setIsSubmitting(false);
        setErrorMessage(apiErr.message || 'Failed to complete registration');
      }
    }
  };

  const autoFillOtp = () => {
    const code = generatedDemoCode || '123456';
    const digits = code.split('').slice(0, 6);
    setOtpDigits(digits);
    verifyOtpCode(code);
  };

  // Google SVG Icon helper
  const GoogleIcon = () => (
    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.34 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );

  return (
    <div className="flex flex-col flex-1 max-w-md mx-auto w-full py-2 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. SIGN IN SCREEN (sign in.png) */}
      {/* ========================================================================= */}
      {authMode === 'signin' && (
        <div className="space-y-6">
          {/* Card Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
            {/* Header Icon + Titles */}
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Sign in to manage your loans securely.
                </p>
              </div>
            </div>

            {/* Continue with Google */}
            <div>
              <button
                type="button"
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all flex items-center justify-center gap-3 shadow-2xs hover:border-slate-400"
              >
                <GoogleIcon />
                <span>Continue with Google</span>
              </button>
            </div>

            {/* OR Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs font-semibold text-slate-400  absolute">
                OR
              </span>
            </div>

            {/* Mobile Phone Number Form */}
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 ">
                  Mobile Phone Number
                </label>
                <div className="flex rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600 transition-all shadow-2xs">
                  {/* Country Selector */}
                  <div className="relative border-r border-slate-200 bg-slate-50/80 px-3 py-2.5 flex items-center shrink-0">
                    <select
                      id="signin-country-code-select"
                      aria-label="Country Code"
                      value={signInCountryCode}
                      onChange={(e) => setSignInCountryCode(e.target.value)}
                      className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-3"
                    >
                      {COUNTRY_PHONE_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code} ({item.country})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Phone Input */}
                  <input
                    id="signin-phone-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="50 123 4567"
                    value={signInPhone}
                    onChange={(e) => setSignInPhone(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Continue Button */}
              <button
                type="submit"
                id="signin-continue-btn"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RotateCw className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Continue</span>
                )}
              </button>
            </form>

            {/* Create Account Link */}
            <div className="pt-2 text-center text-sm text-slate-600">
              <span>New here? </span>
              <button
                type="button"
                id="go-to-register-btn"
                onClick={() => {
                  setErrorMessage(null);
                  setAuthMode('reg_location');
                }}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Create your account
              </button>
            </div>
          </div>

          {/* Quick Demo Accounts Helper */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-blue-950 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick Demo Accounts (1-Click Test):</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setSignInCountryCode('+972');
                  setSignInPhone('50 123 4567');
                }}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 rounded-lg text-blue-800 text-xs font-mono font-medium border border-blue-200"
              >
                Somchai (+972 50 123 4567)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSignInCountryCode('+972');
                  setSignInPhone('54 778 8990');
                }}
                className="px-2.5 py-1 bg-white hover:bg-blue-100 rounded-lg text-blue-800 text-xs font-mono font-medium border border-blue-200"
              >
                Maria (+972 54 778 8990)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SIGN IN WITH PASSWORD VIEW */}
      {/* ========================================================================= */}
      {authMode === 'signin_pwd' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <span className="text-xs font-semibold text-slate-400 ">
                Sign In
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Enter your password
              </h1>
              <p className="text-sm text-slate-500">
                Signing in for <span className="font-semibold text-slate-800">{fullSignInPhone}</span>
              </p>
            </div>

            <form onSubmit={handlePasswordSignIn} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 ">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showSignInPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    autoFocus
                    className="w-full px-3.5 py-3 pr-10 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showSignInPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotIdentifier(fullSignInPhone);
                      setErrorMessage(null);
                      setForgotSuccessMessage(null);
                      setAuthMode('forgot_password');
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RotateCw className="w-5 h-5 animate-spin" /> : <span>Sign In</span>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const { code } = storageService.generateOTP(fullSignInPhone, language);
                    setGeneratedDemoCode(code);
                    setOtpDigits(['', '', '', '', '', '']);
                    setResendTimer(45);
                    setAuthMode('signin_otp');
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Sign in with SMS verification code instead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORGOT PASSWORD VIEW */}
      {/* ========================================================================= */}
      {authMode === 'forgot_password' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthMode('signin_pwd')}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <span className="text-xs font-semibold text-slate-400">
                Password Recovery
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Reset your password
              </h1>
              <p className="text-sm text-slate-500">
                Enter your registered mobile phone or email to receive a 6-digit reset code.
              </p>
            </div>

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Phone Number or Email
                </label>
                <input
                  type="text"
                  placeholder="e.g. +972501234567 or email@domain.com"
                  value={forgotIdentifier}
                  onChange={(e) => setForgotIdentifier(e.target.value)}
                  autoFocus
                  className="w-full px-3.5 py-3 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none font-mono"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RotateCw className="w-5 h-5 animate-spin" /> : <span>Send Reset Code</span>}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Return to Sign In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET PASSWORD VIEW */}
      {/* ========================================================================= */}
      {authMode === 'reset_password' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthMode('forgot_password')}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <span className="text-xs font-semibold text-slate-400">
                New Password
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Enter reset code
              </h1>
              <p className="text-sm text-slate-500">
                A verification code was sent to <span className="font-semibold text-slate-800">{forgotIdentifier}</span>
              </p>
            </div>

            {forgotSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{forgotSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  6-Digit Verification Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  className="w-full px-3.5 py-3 text-center text-lg font-mono font-bold tracking-widest rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  New Password (min. 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-3 pr-10 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full px-3.5 py-3 pr-10 text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? <RotateCw className="w-5 h-5 animate-spin" /> : <span>Reset Password & Sign In</span>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SIGN IN OTP VIEW */}
      {/* ========================================================================= */}
      {authMode === 'signin_otp' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
              </button>
              <span className="text-xs font-semibold text-slate-400 ">
                SMS Verification
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Verify your phone
              </h1>
              <p className="text-sm text-slate-500">
                We've sent a 6-digit code to{' '}
                <span className="font-semibold text-slate-800 dir-ltr inline-block">
                  {fullSignInPhone}
                </span>
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 dir-ltr">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-2xs"
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Auto fill demo helper */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="text-xs text-emerald-900">
                <span className="font-bold">Demo OTP:</span>{' '}
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                  {generatedDemoCode || '123456'}
                </span>
              </div>
              <button
                type="button"
                onClick={autoFillOtp}
                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1 rounded-lg"
              >
                1-Click Auto Fill
              </button>
            </div>

            <button
              type="button"
              disabled={isSubmitting || otpDigits.join('').length < 6}
              onClick={() => verifyOtpCode()}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? <RotateCw className="w-5 h-5 animate-spin" /> : <span>Verify & Continue</span>}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRE-REGISTRATION: LOCATION PERMISSION */}
      {/* ========================================================================= */}
      {authMode === 'reg_location' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>Back</span>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Globe className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Location Required
              </h1>
              <p className="text-sm text-slate-500">
                To continue with your registration and comply with local regulations, we need permission to access your device's location.
              </p>
            </div>

            {locationError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{locationError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRequestLocation}
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RotateCw className="w-5 h-5 animate-spin" />
              ) : (
                <span>Grant Location Access</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRE-REGISTRATION: MONTHLY SERVICE CHARGE DISCLAIMER */}
      {/* ========================================================================= */}
      {authMode === 'reg_disclaimer' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <button
                type="button"
                onClick={() => setAuthMode('reg_location')}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>Back</span>
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Important Notice
              </h1>
              <p className="text-sm text-slate-500">
                Please review and accept the monthly service charge disclaimer before proceeding.
              </p>
            </div>

            <form onSubmit={handleDisclaimerSubmit} className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700">
                I acknowledge and agree that by proceeding with this loan application, I am subject to the applicable monthly service charge as determined by the loan service provider. This charge is in addition to the principal and interest amounts, and it covers the ongoing management of the account.
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={hasAgreedToDisclaimer}
                    onChange={(e) => setHasAgreedToDisclaimer(e.target.checked)}
                    className="w-5 h-5 appearance-none border-2 border-slate-300 rounded-md checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all peer"
                  />
                  <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                  I agree to the Monthly Service Charge Disclaimer
                </span>
              </label>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2"
              >
                Continue to Registration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. REGISTRATION STEP 1 OF 3: USER DETAILS (reg 1.png) */}
      {/* ========================================================================= */}
      {authMode === 'reg_step1' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
            {/* Top Bar with Back Arrow + Title */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <button
                type="button"
                id="reg-step1-back-btn"
                onClick={() => setAuthMode('reg_disclaimer')}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Step Progress Bar: Step 1 of 3 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Step 1 of 3</span>
                <span className="text-slate-700">Registration</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-1/3 transition-all duration-300" />
              </div>
            </div>

            {/* Headings */}
            <div className="space-y-1 pt-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Join LendGlobal
              </h1>
              <p className="text-sm text-slate-500">
                Create an account to start your loan application.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegStep1Submit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Full Name
                </label>
                <input
                  id="reg-fullname-input"
                  type="text"
                  placeholder="As it appears on your passport"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Email Address
                </label>
                <input
                  id="reg-email-input"
                  type="email"
                  placeholder="you@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Mobile Number
                </label>
                <div className="flex rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-600/20 focus-within:border-blue-600 transition-all shadow-2xs">
                  <div className="relative border-r border-slate-200 bg-slate-50/80 px-3 py-2.5 flex items-center shrink-0">
                    <select
                      id="reg-country-code-select"
                      aria-label="Country Code"
                      value={regCountryCode}
                      onChange={(e) => setRegCountryCode(e.target.value)}
                      className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer pr-3"
                    >
                      {COUNTRY_PHONE_CODES.map((item) => (
                        <option key={item.code} value={item.code}>
                          {item.flag} {item.code}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    id="reg-phone-input"
                    type="tel"
                    inputMode="numeric"
                    placeholder="50 123 4567"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Data encrypted badge */}
              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 flex items-center gap-2.5 text-xs text-blue-900 font-medium">
                <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Your data is encrypted and secure</span>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit / Create Account Button */}
              <button
                type="submit"
                id="reg-step1-submit-btn"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RotateCw className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>

            {/* Already have account link */}
            <div className="pt-2 text-center text-sm text-slate-600">
              <span>Already have an account? </span>
              <button
                type="button"
                id="reg-signin-link-btn"
                onClick={() => {
                  setErrorMessage(null);
                  setAuthMode('signin');
                }}
                className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. REGISTRATION STEP 2 OF 3: PHONE OTP VERIFICATION (reg 2 opt.png) */}
      {/* ========================================================================= */}
      {authMode === 'reg_step2_otp' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-6">
            {/* Top Bar with Back Arrow + Title */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <button
                type="button"
                id="reg-step2-back-btn"
                onClick={() => setAuthMode('reg_step1')}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>Registration</span>
              </button>
            </div>

            {/* 3-Segment Progress Indicator */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="h-1.5 bg-blue-600 rounded-full" />
                <div className="h-1.5 bg-blue-600 rounded-full" />
                <div className="h-1.5 bg-slate-200 rounded-full" />
              </div>
              <div className="text-[11px] font-bold text-slate-400 ">
                STEP 2 OF 3
              </div>
            </div>

            {/* Headings */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Verify your phone
              </h1>
              <p className="text-sm text-slate-500">
                We've sent a 6-digit code to
              </p>
              <p className="text-base font-bold text-slate-900 dir-ltr inline-block">
                {fullRegPhone}
              </p>
            </div>

            {/* 6-Digit OTP Boxes */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 dir-ltr">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    id={`reg-otp-box-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-12 h-14 text-center text-xl font-bold text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition-all shadow-2xs"
                  />
                ))}
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 animate-shake">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Quick Demo OTP Code Auto-fill Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-xs text-emerald-950">
                  <span className="font-bold">Demo OTP:</span>{' '}
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                    {generatedDemoCode || '123456'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                id="reg-fill-demo-otp-btn"
                onClick={autoFillOtp}
                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
              >
                1-Click Auto Fill
              </button>
            </div>

            {/* Resend Code & Edit Phone */}
            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setAuthMode('reg_step1')}
                className="text-slate-500 hover:text-slate-800 font-medium underline"
              >
                Change phone number
              </button>

              {resendTimer > 0 ? (
                <span className="text-slate-400 font-medium">
                  Resend code in {resendTimer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await apiService.requestOtp(fullRegPhone);
                      const code = res?.demoCode || storageService.generateOTP(fullRegPhone, language).code;
                      setGeneratedDemoCode(code);
                      storageService.generateOTP(fullRegPhone, language);
                    } catch {
                      const { code } = storageService.generateOTP(fullRegPhone, language);
                      setGeneratedDemoCode(code);
                    }
                    setResendTimer(45);
                  }}
                  className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  Resend Now
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="button"
              id="reg-verify-otp-btn"
              disabled={isSubmitting || otpDigits.join('').length < 6}
              onClick={() => verifyOtpCode()}
              className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RotateCw className="w-5 h-5 animate-spin" />
              ) : (
                <span>Verify & Continue</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. REGISTRATION STEP 3 OF 3: SECURE ACCOUNT / PASSWORD (reg 3.png) */}
      {/* ========================================================================= */}
      {authMode === 'reg_step3_pwd' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
            {/* Top Bar with Back Arrow + Title */}
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <button
                type="button"
                id="reg-step3-back-btn"
                onClick={() => setAuthMode('reg_step2_otp')}
                className="p-1.5 -ml-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-1 text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
                <span>Registration</span>
              </button>
            </div>

            {/* 3-Segment Progress Indicator */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <div className="h-1.5 bg-blue-600 rounded-full" />
                <div className="h-1.5 bg-blue-600 rounded-full" />
                <div className="h-1.5 bg-blue-600 rounded-full" />
              </div>
              <div className="text-[11px] font-bold text-slate-400 ">
                STEP 3 OF 3
              </div>
            </div>

            {/* Headings */}
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Secure your account
              </h1>
              <p className="text-sm text-slate-500">
                Create a password to keep your application and data safe.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleRegStep3Submit} className="space-y-4">
              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="reg-new-password-input"
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-3 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm-password-input"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-3 pr-10 text-sm font-medium text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
                <div className="font-bold text-slate-800">
                  Password Requirements:
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {hasMinLength ? (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                    )}
                    <span className={hasMinLength ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                      At least 8 characters
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasNumber ? (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                    )}
                    <span className={hasNumber ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                      One number (0-9)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasSpecialChar ? (
                      <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center shrink-0" />
                    )}
                    <span className={hasSpecialChar ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                      One special character (!@#$%^&*)
                    </span>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Complete Registration Button */}
              <button
                type="submit"
                id="reg-step3-submit-btn"
                disabled={isSubmitting || !isPasswordValid || !passwordsMatch}
                className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RotateCw className="w-5 h-5 animate-spin" />
                ) : (
                  <span>Complete Registration</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
