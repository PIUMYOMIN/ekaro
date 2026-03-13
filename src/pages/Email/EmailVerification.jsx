import React, { useEffect, useState } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';
import { CheckCircleIcon, XCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const EmailVerification = () => {
  const { id, hash } = useParams();
  const location = useLocation();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const expires = params.get('expires');
    const signature = params.get('signature');

    if (id && hash && expires && signature) {
      const verifyUrl = `/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`;
      api.get(verifyUrl)
        .then(async (response) => {
          await refreshUser();
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');
        })
        .catch(error => {
          setStatus('error');
          setMessage(error.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
        });
    } else {
      setStatus('error');
      setMessage('Invalid verification link.');
    }
  }, [id, hash, location, refreshUser]);

  const handleResend = async () => {
    try {
      await api.post('/email/resend');
      alert('Verification email resent. Please check your inbox.');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {status === 'verifying' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Verifying your email...</h2>
            <p className="mt-2 text-gray-600">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Email Verified!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 space-y-3">
              <Link
                to="/login"
                className="block w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition"
              >
                Go to Login
              </Link>
              <Link
                to="/"
                className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleResend}
                className="flex items-center justify-center w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Resend Verification Email
              </button>
              <Link
                to="/"
                className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;