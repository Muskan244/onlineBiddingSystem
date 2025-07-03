import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Gavel } from 'lucide-react';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Toast from '../components/Common/Toast';
import { requestPasswordReset } from '../api/user';
import { Link } from 'react-router-dom';

interface ForgotPasswordPageProps {
  onPageChange: (page: string) => void;
}

export default function ForgotPasswordPage({ onPageChange }: ForgotPasswordPageProps) {
  const { auth } = useApp();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setToast({ type: 'error', message: 'Please enter your email address' });
      return;
    }

    if (!email.includes('@')) {
      setToast({ type: 'error', message: 'Please enter a valid email address' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setIsEmailSent(true);
      setToast({ 
        type: 'success', 
        message: res.message || 'Password reset instructions have been sent to your email' 
      });
    } catch (error: any) {
      setToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to send reset email. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setIsLoading(true);
    try {
      const res = await requestPasswordReset(email);
      setToast({ 
        type: 'success', 
        message: res.message || 'Reset email sent again. Please check your inbox.' 
      });
    } catch (error: any) {
      setToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to resend email. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Gavel className="w-12 h-12 text-primary-600" />
            <span className="text-3xl font-bold text-gray-900">BidHub</span>
          </div>
          
          {!isEmailSent ? (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Forgot your password?</h2>
              <p className="text-gray-600">
                No worries! Enter your email address and we'll send you instructions to reset your password.
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600">
                We've sent password reset instructions to <strong>{email}</strong>
              </p>
            </>
          )}
        </div>

        {!isEmailSent ? (
          /* Reset Form */
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Send Reset Instructions'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => onPageChange('login')}
                className="flex items-center justify-center space-x-2 text-primary-600 hover:text-primary-500 font-medium mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </form>
        ) : (
          /* Email Sent Confirmation */
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <p className="mb-2">
                  <strong>Didn't receive the email?</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Check your spam or junk folder</li>
                  <li>Make sure you entered the correct email address</li>
                  <li>Wait a few minutes for the email to arrive</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-primary-600 text-primary-600 rounded-lg font-medium hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Resend Email'
                )}
              </button>

              <button
                onClick={() => onPageChange('login')}
                className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Still having trouble?{' '}
            <button className="text-primary-600 hover:text-primary-500 font-medium">
              Contact Support
            </button>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Already have a reset token?{' '}
            <button
              type="button"
              onClick={() => onPageChange('reset-password')}
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              Reset your password here
            </button>
          </p>
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}