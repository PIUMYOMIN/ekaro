// components/StepGuard.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

let _statusCache = null;
let _statusCacheTime = 0;
const CACHE_TTL_MS = 10_000;
export const invalidateOnboardingCache = () => {
    _statusCache = null;
    _statusCacheTime = 0;
};

const StepGuard = ({ children, step }) => {
    const [isValid, setIsValid]   = useState(false);
    const [loading, setLoading]   = useState(true);
    const navigate                = useNavigate();
    const { user }                = useAuth();
    const inflight                = useRef(false);
    useEffect(() => {
        if (inflight.current) return;
        inflight.current = true;

        const validateStep = async () => {
            if (!user) {
                navigate('/login');
                return;
            }

            if (user.type !== 'seller' && !user.roles?.includes('seller')) {
                navigate('/');
                return;
            }

            // ── Email must be verified before any onboarding step ──────────
            if (!user.email_verified_at) {
                navigate('/verify-email', {
                    state: { returnTo: `/seller/onboarding/${step}` }
                });
                return;
            }

            try {
                let statusData;

                // Use cached status if fresh enough — avoids one API call per step page
                const now = Date.now();
                if (_statusCache && now - _statusCacheTime < CACHE_TTL_MS) {
                    statusData = _statusCache;
                } else {
                    const response = await api.get('/seller/onboarding/status');
                    if (response.data.success) {
                        _statusCache = response.data.data;
                        _statusCacheTime = now;
                        statusData = _statusCache;
                    }
                }

                if (!statusData) {
                    navigate('/seller/onboarding/store-basic');
                    return;
                }

                // Onboarding already complete — send to dashboard
                if (statusData.onboarding_complete && !statusData.needs_onboarding) {
                    navigate('/seller/dashboard');
                    return;
                }

                const stepOrder = [
                    'store-basic',
                    'business-details',
                    'address',
                    'documents',
                    'review-submit',
                ];

                const currentIndex   = stepOrder.indexOf(statusData.current_step);
                const requestedIndex = stepOrder.indexOf(step);

                if (requestedIndex < 0) {
                    navigate('/seller/onboarding/store-basic');
                } else if (requestedIndex > currentIndex) {
                    // FIX: was silently redirecting — now preserves the current step
                    navigate(`/seller/onboarding/${statusData.current_step || 'store-basic'}`);
                } else {
                    setIsValid(true);
                }

            } catch (error) {
                console.error('Step validation failed:', error);
                navigate('/seller/onboarding/store-basic');
            } finally {
                setLoading(false);
            }
        };

        validateStep();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, step]); // navigate is stable; step + user are the only meaningful deps

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-50 to-blue-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">Validating step...</p>
                </div>
            </div>
        );
    }

    return isValid ? children : null;
};

export default StepGuard;