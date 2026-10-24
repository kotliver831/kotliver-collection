import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  AlertCircle, 
  ShieldCheck, 
  X, 
  Info,
  Mail,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Send,
  HelpCircle
} from 'lucide-react';
import { firebaseService, getStoredFirebaseConfig, getFirebaseInstances } from '../../services/firebaseService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (email: string) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('jamjam8314@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(false);
  const [activeTab, setActiveTab] = useState<'password' | 'google'>('password');
  const [unverifiedEmailUser, setUnverifiedEmailUser] = useState<string | null>(null);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);

  useEffect(() => {
    const config = getStoredFirebaseConfig();
    setIsFirebaseConfigured(!!(config && config.apiKey && config.projectId));
    setError('');
    setStatusMessage(null);
    setSuccessMessage(null);
    setUnverifiedEmailUser(null);
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Email & Password Login
  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(null);
    setUnverifiedEmailUser(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your admin email address.');
      return;
    }

    if (!password) {
      setError('Please enter your admin password.');
      return;
    }

    // Strict client pre-check for authorized store owner
    const expectedOwnerEmail = 'jamjam8314@gmail.com';
    if (trimmedEmail.toLowerCase() !== expectedOwnerEmail) {
      setError(`Access Denied: Account "${trimmedEmail}" is not authorized. Only the store owner (${expectedOwnerEmail}) is permitted to manage this store.`);
      return;
    }

    setIsLoading(true);
    setStatusMessage('Authenticating with Firebase Authentication...');

    try {
      const authResult = await firebaseService.signInWithEmail(trimmedEmail, password);

      if (!authResult.isEmailVerified) {
        setUnverifiedEmailUser(authResult.email || expectedOwnerEmail);
      }

      setIsLoading(false);
      setStatusMessage(null);
      onLoginSuccess(authResult.email || expectedOwnerEmail);
    } catch (err: any) {
      console.error('Admin Email/Password login error:', err);
      setIsLoading(false);
      setStatusMessage(null);

      const errorCode = err?.code || '';
      const errorMessage = err?.message || '';

      if (errorCode === 'auth/invalid-credential' || errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
        setError(
          `[${errorCode || 'auth/invalid-credential'}] Invalid credentials for jamjam8314@gmail.com. If you have not created this user in Firebase yet, open Firebase Console > Authentication > Users, click "Add user", enter "jamjam8314@gmail.com" and your password, and verify "Email/Password" is enabled under Sign-in method.`
        );
      } else if (errorCode === 'auth/operation-not-allowed') {
        setError(
          `[${errorCode}] Email/Password sign-in provider is disabled in Firebase Console. Go to Firebase Console > Authentication > Sign-in method and enable "Email/Password".`
        );
      } else if (errorCode === 'auth/too-many-requests') {
        setError(
          `[${errorCode}] Access to this account has been temporarily disabled due to many failed login attempts. Please reset your password or try again later.`
        );
      } else if (errorCode === 'auth/user-disabled') {
        setError(`[${errorCode}] This administrator account has been disabled in Firebase Console.`);
      } else if (errorCode === 'auth/network-request-failed') {
        setError(`[${errorCode}] Network error: Unable to reach Firebase Authentication servers. Check your connection or Netlify firewall.`);
      } else {
        setError(errorCode ? `[${errorCode}] ${errorMessage}` : (errorMessage || 'Failed to authenticate admin. Please check your credentials and Firebase configuration.'));
      }
    }
  };

  // Google Popup Login with Firebase Auth
  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMessage(null);
    setUnverifiedEmailUser(null);
    setStatusMessage('Connecting to Google Authentication...');
    setIsGoogleLoading(true);

    try {
      const authResult = await firebaseService.signInWithGoogle();

      if (!authResult.isEmailVerified) {
        setUnverifiedEmailUser(authResult.email || 'jamjam8314@gmail.com');
      }

      setIsGoogleLoading(false);
      setStatusMessage(null);
      onLoginSuccess(authResult.email || 'jamjam8314@gmail.com');
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setIsGoogleLoading(false);
      setStatusMessage(null);

      const code = err?.code || '';
      const message = err?.message || '';

      if (code === 'auth/popup-closed-by-user') {
        setError(`[${code}] Google sign-in popup was closed before completing.`);
      } else if (code === 'auth/popup-blocked') {
        setError(`[${code}] Google sign-in popup was blocked by your browser. Please allow popups for this site.`);
      } else if (code === 'auth/unauthorized-domain') {
        setError(
          `[${code}] Domain "${window.location.hostname}" is not authorized for OAuth in Firebase. Add this domain in Firebase Console > Authentication > Settings > Authorized domains.`
        );
      } else {
        setError(code ? `[${code}] ${message}` : (message || 'Firebase Google Sign-In failed. Verify OAuth credentials.'));
      }
    }
  };

  // Forgot Password / Password Reset Link
  const handleForgotPassword = async () => {
    const targetEmail = email.trim() || 'jamjam8314@gmail.com';
    setError('');
    setStatusMessage('Sending password reset email...');
    try {
      await firebaseService.sendPasswordReset(targetEmail);
      setStatusMessage(null);
      setSuccessMessage(`Password reset link sent to ${targetEmail}. Please check your inbox or spam folder.`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      setStatusMessage(null);
      setError(err?.message || 'Failed to send password reset email. Ensure the user exists in Firebase Console.');
    }
  };

  // Send Verification Email
  const handleSendVerificationEmail = async () => {
    setIsSendingVerification(true);
    setError('');
    try {
      await firebaseService.sendVerificationEmail();
      setSuccessMessage('Verification email has been sent to jamjam8314@gmail.com. Check your inbox and click the link.');
    } catch (err: any) {
      console.error('Send verification error:', err);
      setError(err?.message || 'Failed to send verification email.');
    } finally {
      setIsSendingVerification(false);
    }
  };

  // Check verification status
  const handleCheckVerification = async () => {
    setIsCheckingVerification(true);
    setError('');
    try {
      const user = await firebaseService.reloadCurrentUser();
      if (user?.emailVerified) {
        setUnverifiedEmailUser(null);
        setSuccessMessage('Email verified successfully! You have full Firestore write access.');
      } else {
        setError('Email is still unverified. Please click the link in your email, or in Firebase Console go to Authentication > Users and mark the user as verified.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh user profile.');
    } finally {
      setIsCheckingVerification(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-900 text-[#D4A72C] flex items-center justify-center mx-auto mb-3 shadow-md border border-[#D4A72C]/30">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-serif-brand text-gray-900">
            Kotliver Admin Access
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Authorized administration and store governance portal
          </p>
        </div>

        {/* Authentication Mode Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'password'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('google');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Google Sign-In
          </button>
        </div>

        {/* Status / Loading Banner */}
        {statusMessage && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 flex items-center gap-2 animate-pulse">
            <Info className="w-4 h-4 shrink-0 text-blue-600" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="leading-snug">{successMessage}</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div className="flex-1 text-left leading-relaxed">{error}</div>
          </div>
        )}

        {/* Unverified Email Warning Banner */}
        {unverifiedEmailUser && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <div className="text-left leading-relaxed">
                <span className="font-semibold block text-amber-900">Email Verification Pending</span>
                Your account is authenticated, but Firebase email verification is not complete. Cloud Firestore rules require verified email for saving database changes.
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSendVerificationEmail}
                disabled={isSendingVerification}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3 h-3" />
                <span>{isSendingVerification ? 'Sending...' : 'Send Verification Email'}</span>
              </button>
              <button
                type="button"
                onClick={handleCheckVerification}
                disabled={isCheckingVerification}
                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingVerification ? 'animate-spin' : ''}`} />
                <span>Check Status</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Auth Mode Content */}
        {isFirebaseConfigured ? (
          <div>
            {activeTab === 'password' ? (
              /* Email & Password Form */
              <form onSubmit={handleEmailPasswordLogin} className="space-y-4">
                <div>
                  <label 
                    htmlFor="admin-email" 
                    className="block text-xs font-semibold text-gray-700 mb-1 text-left"
                  >
                    Admin Email
                  </label>
                  <div className="relative">
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jamjam8314@gmail.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    />
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label 
                      htmlFor="admin-password" 
                      className="block text-xs font-semibold text-gray-700"
                    >
                      Admin Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-[11px] text-[#176B4D] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="admin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#176B4D] focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                    />
                    <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-[#176B4D] hover:bg-[#12533B] text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#D4A72C]" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#D4A72C]" />
                      <span>Login to Admin Panel</span>
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Google Sign-In Mode */
              <div className="space-y-4">
                <p className="text-xs text-gray-500 text-left leading-relaxed">
                  Authenticate with your verified Google account. You must sign in using the designated store owner email.
                </p>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full py-3 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 text-xs font-bold text-gray-800 flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isGoogleLoading ? 'Connecting to Google...' : 'Sign in with Google (jamjam8314@gmail.com)'}</span>
                </button>
              </div>
            )}

            {/* Zero-Trust Owner Security Footnote */}
            <div className="mt-5 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 flex items-start gap-2 text-left">
              <ShieldCheck className="w-4 h-4 text-[#176B4D] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block text-emerald-950">Authorized Store Account:</span>
                <span className="font-mono text-[10px] text-emerald-800 font-bold">jamjam8314@gmail.com</span>
                <p className="text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                  Only the verified owner account can access store governance and Cloud Firestore records.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Firebase Configuration Setup Diagnostic Notice */
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2 text-left">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <HelpCircle className="w-4 h-4" />
              <span>Firebase Auth Setup Required</span>
            </div>
            <p className="leading-relaxed text-amber-800">
              Firebase credentials not found. To enable Admin authentication:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-800 font-medium">
              <li>Ensure <code>firebase-applet-config.json</code> exists with valid <code>projectId</code> and <code>apiKey</code>.</li>
              <li>Or set <code>VITE_FIREBASE_API_KEY</code> and <code>VITE_FIREBASE_PROJECT_ID</code> in Netlify Environment Variables.</li>
              <li>Enable <strong>Email/Password</strong> and/or <strong>Google</strong> under Firebase Console &gt; Authentication.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};
