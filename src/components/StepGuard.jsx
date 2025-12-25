// components/StepGuard.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { LazyLoadComponent } from 'react-lazy-load-image-component';
import Loading from './ui/Loading';

const StepGuard = ({ children, step }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkStepAccess();
    }, [step, location.pathname]);

    const checkStepAccess = async () => {
        setLoading(true);
        try {
            const response = await api.get('/seller/onboarding/status');
            if (response.data.success) {
                const { data } = response.data;
                
                // If user doesn't have a profile, start from beginning
                if (!data.has_profile && step !== 'store-basic') {
                    navigate('/seller/onboarding/store-basic');
                    return;
                }

                // If onboarding is already complete, go to dashboard
                if (data.onboarding_complete) {
                    navigate('/seller');
                    return;
                }

                // Check step access based on current progress
                const stepOrder = ['store-basic', 'business-details', 'address', 'documents', 'review'];
                const currentIndex = stepOrder.indexOf(data.current_step);
                const requestedIndex = stepOrder.indexOf(step);

                // If trying to skip ahead, redirect to current step
                if (requestedIndex > currentIndex + 1) {
                    navigate(`/seller/onboarding/${data.current_step}`);
                }

                // If trying to go back to completed step, allow it (for editing)
                // This is fine, we allow editing previous steps
            }
        } catch (error) {
            console.error('Step guard check failed:', error);
            // On error, redirect to dashboard
            navigate('/seller');
        }
        setLoading(false);
    };

    if (loading) return <Loading />;

    return children;
};

export default StepGuard;