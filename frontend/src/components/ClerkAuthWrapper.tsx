import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { LogOut, Mail, Lock, User as UserIcon, X, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const IS_CLERK_ENABLED = false;

interface UserType {
  id: string;
  email: string;
  firstName: string;
  imageUrl: string;
}

interface AuthContextType {
  isSignedIn: boolean;
  user: UserType | null;
  isLoading: boolean;
  openSignIn: () => void;
  openSignUp: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isSignedIn: false,
  user: null,
  isLoading: true,
  openSignIn: () => {},
  openSignUp: () => {},
  logout: () => {},
});

// Helper to mask email securely: e.g. u*****@gmail.com
function maskEmail(emailStr: string): string {
  if (!emailStr) return "";
  const [local, domain] = emailStr.split("@");
  if (!local || !domain) return emailStr;
  if (local.length <= 2) return `${local[0]}*****@${domain}`;
  return `${local[0]}${"*".repeat(Math.max(3, Math.min(5, local.length - 2)))}${local[local.length - 1]}@${domain}`;
}

export function ClerkAuthContainer({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals status: 'signin' | 'signup' | 'verify_otp' | 'forgot_password' | 'reset_password' | null
  const [modalType, setModalType] = useState<"signin" | "signup" | "verify_otp" | "forgot_password" | "reset_password" | null>(null);
  
  // Core Auth Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Verification Specific States
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const [otpEmail, setOtpEmail] = useState("");
  const [otpPurpose, setOtpPurpose] = useState<"verify" | "reset_password">("verify");
  const [timerCountdown, setTimerCountdown] = useState(120); // 120 seconds (02:00)
  const [shakeTrigger, setShakeTrigger] = useState(false);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState(false);

  // For sandbox and Resend configuration errors
  const [debugOtp, setDebugOtp] = useState("");
  const [emailError, setEmailError] = useState("");

  // Focus references for OTP inputs
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer logic for OTP Resend countdown
  useEffect(() => {
    let interval: any = null;
    if (modalType === "verify_otp" && timerCountdown > 0 && !isSuccessAnimated) {
      interval = setInterval(() => {
        setTimerCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [modalType, timerCountdown, isSuccessAnimated]);

  // Check auth state on first load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set modal opening behaviors
  const openSignIn = () => {
    setModalType("signin");
    setEmail("");
    setPassword("");
    setFormError("");
    setFormSuccess("");
    setDebugOtp("");
    setEmailError("");
    setIsSubmitting(false);
  };

  const openSignUp = () => {
    setModalType("signup");
    setEmail("");
    setPassword("");
    setFirstName("");
    setFormError("");
    setFormSuccess("");
    setDebugOtp("");
    setEmailError("");
    setIsSubmitting(false);
  };

  const handleCloseModal = () => {
    if (isSuccessAnimated) return; // Prevent closing mid-success state transition
    setModalType(null);
    setFormError("");
    setFormSuccess("");
    setDebugOtp("");
    setEmailError("");
    setOtpValues(Array(6).fill(""));
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.reload();
  };

  // Helper formatting for countdown digits (e.g. 01:59)
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  /**
   * Action: Signup Submit
   */
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError("Email and password are required.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      if (data.needsVerification) {
        setOtpEmail(data.email);
        setOtpPurpose("verify");
        setOtpValues(Array(6).fill(""));
        setTimerCountdown(120);
        setModalType("verify_otp");
        if (data.debugOtp) setDebugOtp(data.debugOtp);
        if (data.emailError) setEmailError(data.emailError);
        // Auto focus first OTP input after a brief delay for rendering
        setTimeout(() => {
          if (otpRefs.current[0]) otpRefs.current[0].focus();
        }, 150);
      } else {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setModalType(null);
      }
    } catch (err: any) {
      setFormError(err.message || "Something went wrong during sign up.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Action: Login Submit
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setFormError("Please enter your email and password.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.needsVerification) {
        setOtpEmail(data.email);
        setOtpPurpose("verify");
        setOtpValues(Array(6).fill(""));
        setTimerCountdown(120);
        setModalType("verify_otp");
        if (data.debugOtp) setDebugOtp(data.debugOtp);
        if (data.emailError) setEmailError(data.emailError);
        // Auto focus first input
        setTimeout(() => {
          if (otpRefs.current[0]) otpRefs.current[0].focus();
        }, 150);
      } else {
        localStorage.setItem("token", data.token);
        setUser(data.user);
        setModalType(null);
      }
    } catch (err: any) {
      setFormError(err.message || "Invalid credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Action: Forgot Password Submit
   */
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFormError("Please enter your registered email address.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to trigger reset");
      }

      setOtpEmail(email);
      setOtpPurpose("reset_password");
      setOtpValues(Array(6).fill(""));
      setTimerCountdown(120);
      setModalType("verify_otp");
      if (data.debugOtp) setDebugOtp(data.debugOtp);
      if (data.emailError) setEmailError(data.emailError);
      // Focus first OTP field
      setTimeout(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }, 150);
    } catch (err: any) {
      setFormError(err.message || "No account associated with that email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Action: Reset Password Submit (Final step)
   */
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setFormError("Please enter a new secure password.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      const otpCode = otpValues.join("");
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp: otpCode, newPassword: password })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Reset failed");
      }

      setIsSuccessAnimated(true);
      setTimeout(() => {
        setIsSuccessAnimated(false);
        setModalType("signin");
        setFormSuccess("Password reset successful! Please log in.");
        setPassword("");
        setFormError("");
      }, 1800);
    } catch (err: any) {
      setFormError(err.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Action: OTP Verification Code Verification
   */
  const handleVerifyOtpSubmit = async (enteredOtp?: string) => {
    const finalOtp = enteredOtp || otpValues.join("");
    if (finalOtp.length !== 6) {
      setFormError("Please enter all 6 digits of the code.");
      return;
    }
    setFormError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, otp: finalOtp, purpose: otpPurpose })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Success branch
      if (otpPurpose === "reset_password") {
        // Transition to entering a brand new password
        setIsSuccessAnimated(true);
        setTimeout(() => {
          setIsSuccessAnimated(false);
          setModalType("reset_password");
          setPassword("");
          setFormError("");
          setFormSuccess("");
        }, 1200);
      } else {
        // Normal Login/Verification Flow
        setIsSuccessAnimated(true);
        setTimeout(() => {
          setIsSuccessAnimated(false);
          localStorage.setItem("token", data.token);
          setUser(data.user);
          setModalType(null);
          // Refresh screen to secure routing context
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      setFormError(err.message || "Verification code is invalid or has expired.");
      setShakeTrigger(true);
      // Clean values to give a fresh start on incorrect code
      setOtpValues(Array(6).fill(""));
      setTimeout(() => setShakeTrigger(false), 500);
      // Focus first input box
      if (otpRefs.current[0]) otpRefs.current[0].focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Action: Resend Verification/Reset Code
   */
  const handleResendOtp = async () => {
    if (timerCountdown > 0) return; // Prevent rapid manual calls
    setFormError("");
    setFormSuccess("");

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, purpose: otpPurpose })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setTimerCountdown(60); // Reset timer to 60s standard rate limiting cooldown
      setFormSuccess("A fresh 6-digit code has been sent successfully.");
      setOtpValues(Array(6).fill(""));
      if (data.debugOtp) setDebugOtp(data.debugOtp);
      if (data.emailError) setEmailError(data.emailError);
      // Focus first input
      setTimeout(() => {
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }, 100);
    } catch (err: any) {
      setFormError(err.message || "Failed to dispatch code.");
    }
  };

  /**
   * OTP Input Interaction Event Handlers
   */
  const handleOtpChange = (index: number, val: string) => {
    const cleanNum = val.replace(/[^0-9]/g, ""); // strictly numeric
    if (!cleanNum) return;

    const updated = [...otpValues];
    // Take the last digit if they typed multiple characters somehow
    updated[index] = cleanNum[cleanNum.length - 1];
    setOtpValues(updated);

    // Auto focus next box
    if (index < 5 && cleanNum) {
      const nextInput = otpRefs.current[index + 1];
      if (nextInput) nextInput.focus();
    }

    // Auto-submit code if we just completed all 6 digits
    const potentialCode = updated.join("");
    if (potentialCode.length === 6) {
      handleVerifyOtpSubmit(potentialCode);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpValues[index] && index > 0) {
        // Field is empty and user hit backspace; clear previous field and focus it
        const updated = [...otpValues];
        updated[index - 1] = "";
        setOtpValues(updated);
        const prevInput = otpRefs.current[index - 1];
        if (prevInput) {
          prevInput.focus();
        }
      } else {
        // Clear current field
        const updated = [...otpValues];
        updated[index] = "";
        setOtpValues(updated);
      }
    } else if (e.key === "Enter") {
      const fullCode = otpValues.join("");
      if (fullCode.length === 6) {
        handleVerifyOtpSubmit();
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    const numericOnly = pasteData.replace(/[^0-9]/g, "").slice(0, 6);
    
    if (numericOnly.length > 0) {
      const updated = [...otpValues];
      for (let i = 0; i < 6; i++) {
        updated[i] = numericOnly[i] || "";
      }
      setOtpValues(updated);

      // Focus appropriate input box
      const targetIndex = Math.min(numericOnly.length, 5);
      const nextInput = otpRefs.current[targetIndex];
      if (nextInput) nextInput.focus();

      if (numericOnly.length === 6) {
        handleVerifyOtpSubmit(numericOnly);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      isSignedIn: !!user,
      user,
      isLoading,
      openSignIn,
      openSignUp,
      logout
    }}>
      {children}

      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            {/* Backdrop blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Premium Auth Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900/90 border border-slate-800/80 p-8 text-white shadow-2xl z-10 backdrop-blur-xl ${
                shakeTrigger ? "animate-bounce" : ""
              }`}
              style={{
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px 2px rgba(99, 102, 241, 0.08)"
              }}
            >
              {/* Close Button */}
              {!isSuccessAnimated && (
                <button 
                  onClick={handleCloseModal}
                  className="absolute top-5 right-5 text-slate-400 hover:text-white hover:bg-slate-800/50 p-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* SUCCESS ANIMATION OVERLAY */}
              <AnimatePresence>
                {isSuccessAnimated && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900 z-50 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0.5, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center border-2 border-indigo-500 mb-4"
                    >
                      <CheckCircle2 className="w-10 h-10 text-indigo-400" />
                    </motion.div>
                    <h4 className="text-xl font-bold tracking-tight text-white mb-2">
                      Verification Successful!
                    </h4>
                    <p className="text-slate-400 text-sm max-w-xs">
                      {otpPurpose === "reset_password" 
                        ? "Identity confirmed. Redirecting to password reset page..." 
                        : "Welcome aboard! Initializing your resume dashboard..."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* VIEW 1: SIGN IN PAGE */}
              {modalType === "signin" && (
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-extrabold tracking-tight text-white mb-1">
                      Welcome Back
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Sign in to your AI Resume Architect account
                    </p>
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-5">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs mb-5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input 
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setModalType("forgot_password");
                            setFormError("");
                            setFormSuccess("");
                          }}
                          className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input 
                          type="password"
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition-all mt-6 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-6 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
                    Don't have an account?{" "}
                    <button 
                      onClick={openSignUp}
                      className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 2: SIGN UP PAGE */}
              {modalType === "signup" && (
                <div>
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-extrabold tracking-tight text-white mb-1">
                      Create Account
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Register to craft outstanding resumes
                    </p>
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-5">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <input 
                          type="text"
                          placeholder="Your first name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input 
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Choose Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input 
                          type="password"
                          placeholder="At least 6 characters"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition-all mt-6 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </form>

                  <div className="text-center mt-6 pt-4 border-t border-slate-800/60 text-xs text-slate-400">
                    Already have an account?{" "}
                    <button 
                      onClick={openSignIn}
                      className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* VIEW 3: FORGOT PASSWORD PAGE */}
              {modalType === "forgot_password" && (
                <div>
                  <button 
                    onClick={() => setModalType("signin")}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mb-5 font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>

                  <div className="mb-6">
                    <h3 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
                      Forgot Password?
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Enter your email below and we'll send a 6-digit OTP code to verify your identity.
                    </p>
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-5">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input 
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition-all mt-6 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Send Reset Code"
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* VIEW 4: VERIFY OTP PAGE */}
              {modalType === "verify_otp" && (
                <div>
                  <button 
                    onClick={() => {
                      setModalType(otpPurpose === "reset_password" ? "forgot_password" : "signup");
                      setFormError("");
                      setFormSuccess("");
                    }}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mb-5 font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Change Email
                  </button>

                  <div className="mb-6">
                    <h3 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
                      Verify your email
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      We sent a 6-digit verification code to <span className="text-indigo-300 font-semibold">{maskEmail(otpEmail)}</span>.
                    </p>
                  </div>

                  {emailError && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-300 p-4 rounded-xl text-xs mb-5 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                        <div>
                          <p className="font-bold">Email Delivery Issue detected</p>
                          <p className="text-amber-400/80 mt-1">Resend API returned: "{emailError}"</p>
                          <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
                            <strong>Note:</strong> Free Resend keys only allow sending emails to the Resend account owner's email address. To continue testing right now, please use the retrieved code below:
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {debugOtp && (
                    <div className="bg-indigo-950/40 border border-indigo-500/20 rounded-xl p-4 mb-5 text-center">
                      <p className="text-slate-400 text-[11px] uppercase tracking-wider font-bold mb-1">Recovered Temporary Code</p>
                      <p className="text-2xl font-mono font-black text-indigo-300 tracking-widest">{debugOtp}</p>
                    </div>
                  )}

                  {formError && (
                    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-5">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {formSuccess && (
                    <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl text-xs mb-5">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formSuccess}</span>
                    </div>
                  )}

                  {/* 6-box OTP grid */}
                  <div className="grid grid-cols-6 gap-2 mb-6">
                    {otpValues.map((digit, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={digit}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        autoFocus={i === 0}
                        className="w-full aspect-square text-center text-xl font-bold bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/40 rounded-xl focus:outline-none transition-all text-white"
                      />
                    ))}
                  </div>

                  {/* Countdown Timer Row */}
                  <div className="flex items-center justify-between mt-6 text-xs">
                    <div className="text-slate-400 flex items-center gap-1.5">
                      <span>Code valid for:</span>
                      <span className="font-mono text-indigo-400 font-bold bg-slate-950/60 px-2 py-0.5 rounded-md border border-slate-800/50">
                        {formatTimer(timerCountdown)}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={timerCountdown > 0 || isSubmitting}
                      onClick={handleResendOtp}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:hover:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSubmitting ? "animate-spin" : ""}`} />
                      Resend Code
                    </button>
                  </div>

                  <button
                    onClick={() => handleVerifyOtpSubmit()}
                    disabled={isSubmitting || otpValues.join("").length < 6}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl py-2.5 transition-all mt-6 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/10"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "Confirm Code"
                    )}
                  </button>
                </div>
              )}

              {/* VIEW 5: RESET PASSWORD PAGE */}
              {modalType === "reset_password" && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-extrabold tracking-tight text-white mb-1.5">
                      Reset Password
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Confirming your account for <span className="text-indigo-300 font-semibold">{otpEmail}</span>. Enter your brand new password below.
                    </p>
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs mb-5">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input 
                          type="password"
                          placeholder="At least 6 characters"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.98] disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition-all mt-6 text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                    >
                      {isSubmitting ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        "Save & Update Password"
                      )}
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}

export function CustomSignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useContext(AuthContext);
  if (isSignedIn) {
    return <>{children}</>;
  }
  return null;
}

export function CustomSignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useContext(AuthContext);
  if (!isSignedIn) {
    return <>{children}</>;
  }
  return null;
}

export function CustomUserButton() {
  const { user, logout, isSignedIn } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [isOpen]);

  if (!isSignedIn || !user) {
    return null;
  }

  return (
    <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all py-1.5 px-3 rounded-full cursor-pointer focus:outline-none"
      >
        <img 
          src={user.imageUrl || "/assets/image.jpg"} 
          alt={user.firstName} 
          className="w-6 h-6 rounded-full object-cover border border-indigo-500/20"
          referrerPolicy="no-referrer"
        />
        <span className="text-xs font-semibold text-slate-200">{user.firstName}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 text-white shadow-xl z-[999] py-1.5"
          >
            <div className="px-4 py-2 border-b border-slate-800">
              <p className="text-xs text-slate-400 font-medium">Signed in as</p>
              <p className="text-sm font-semibold truncate text-indigo-300">{user.email}</p>
            </div>
            
            <button
              onClick={logout}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-slate-400" />
              <span>Log Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function CustomSignInButton({ children }: { children?: React.ReactNode }) {
  const { openSignIn } = useContext(AuthContext);

  if (children && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        openSignIn();
      }
    });
  }

  return (
    <button 
      onClick={openSignIn}
      className="cursor-pointer bg-slate-900/60 border border-slate-800 hover:border-indigo-500 hover:text-white transition-all text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold"
    >
      Sign In
    </button>
  );
}

export function CustomSignUpButton({ children }: { children?: React.ReactNode }) {
  const { openSignUp } = useContext(AuthContext);

  if (children && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        openSignUp();
      }
    });
  }

  return (
    <button 
      onClick={openSignUp}
      className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/10"
    >
      Sign Up
    </button>
  );
}

export function useCustomUser() {
  const { isSignedIn, user, isLoading, openSignIn, openSignUp } = useContext(AuthContext);
  return {
    isSignedIn,
    user,
    isLoading,
    openSignIn,
    openSignUp
  };
}
