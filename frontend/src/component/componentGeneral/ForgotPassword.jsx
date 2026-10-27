import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Snackbar } from '@/components/ui/snackbar';
import { Alert as MuiAlert } from '@/components/ui/alert';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const navigate = useNavigate();

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${apiUrl}/request-reset`, { email });

      setSubmitted(true);
      setSnackbar({
        open: true,
        message: res.data.message || 'OTP sent successfully! Check your email.',
        severity: 'success',
      });

      // Redirect after delay
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setSnackbar({
        open: true,
        message:
          err.response?.data?.message ||
          'Failed to send OTP. Please try again.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Lock className="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Reset Password
          </h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a code to reset your
            password
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          {!submitted ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  We'll send a verification code to this email
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full cursor-pointer primaryBgColor accentTextColor font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <CircularProgress size={20} color="inherit" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send Verification Code</span>
                  </>
                )}
              </button>

              {/* Help Text */}
              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </form>
          ) : (
            /* Success State */
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h3>
              <p className="text-gray-600 mb-4">
                We've sent a verification code to{' '}
                <span className="font-semibold">{email}</span>
              </p>
              <p className="text-sm text-gray-500">
                Redirecting you to reset your password...
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </div>

      {/* MUI Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ borderRadius: '8px' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
