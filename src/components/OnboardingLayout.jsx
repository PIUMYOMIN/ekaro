// components/OnboardingLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    HomeIcon
} from '@heroicons/react/24/outline';
import { useOnboardingState } from '../hooks/useOnboardingState';

const OnboardingLayout = ({
    children,
    title,
    description,
    onNext,
    onBack,
    showProgress = true,
    showHeader = true,
    showFooter = true,
    nextLabel = 'Continue',
    backLabel = 'Back',
    nextDisabled = false,
    loading = false
}) => {
    const { progress, steps, currentStep, isLoading } = useOnboardingState();
    const navigate = useNavigate();

    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    // FIX: show a full-page skeleton while onboarding state is loading so the
    // progress bar and step indicator don't flash with wrong values on mount
    if (isLoading && currentStepIndex === -1) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 text-sm">Loading onboarding...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">

            {/* Header */}
            {showHeader && (
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-3 sm:py-4">
                            <button
                                onClick={() => navigate('/seller')}
                                className="flex items-center text-gray-600 hover:text-gray-900 text-sm"
                            >
                                <HomeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
                                <span className="hidden xs:inline">Dashboard</span>
                            </button>
                            <div className="text-xs sm:text-sm text-gray-600 font-medium">
                                Seller Onboarding
                            </div>
                            {/* Step counter — visible on mobile where step labels hide */}
                            <div className="text-xs text-gray-500 sm:hidden">
                                {currentStepIndex + 1}/{steps.length}
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* Progress Bar */}
            {showProgress && (
                <div className="bg-white shadow-sm">
                    <div className="max-w-4xl mx-auto px-4 py-4">

                        {/* Step dots — FIX: responsive stepper that works on all screen sizes */}
                        <div className="flex items-center justify-between">
                            {steps.map((step, index) => (
                                <React.Fragment key={step.id}>
                                    {/* Step circle + label */}
                                    <div className="flex flex-col items-center min-w-0">
                                        <div className={`
                                            w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0
                                            ${index < currentStepIndex
                                                ? 'bg-green-500 text-white'
                                                : index === currentStepIndex
                                                    ? 'bg-green-100 text-green-700 border-2 border-green-500'
                                                    : 'bg-gray-100 text-gray-400'
                                            }
                                        `}>
                                            {index < currentStepIndex
                                                ? <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                                : <span className="text-xs sm:text-sm">{step.icon}</span>
                                            }
                                        </div>
                                        {/* Label — hidden on xs, truncated on sm */}
                                        <span className={`
                                            hidden sm:block text-xs mt-1 font-medium text-center max-w-[64px] truncate
                                            ${index <= currentStepIndex ? 'text-gray-900' : 'text-gray-400'}
                                        `}>
                                            {step.title}
                                        </span>
                                    </div>

                                    {/* Connector line between steps */}
                                    {index < steps.length - 1 && (
                                        <div className={`
                                            flex-1 h-0.5 mx-1 sm:mx-2
                                            ${index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'}
                                        `} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Progress percentage bar */}
                        <div className="mt-4 sm:mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                <div
                                    className="bg-green-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-gray-500">
                                    {/* Show current step name on mobile since labels are hidden */}
                                    <span className="sm:hidden">{steps[currentStepIndex]?.title}</span>
                                    <span className="hidden sm:inline">Step {currentStepIndex + 1} of {steps.length}</span>
                                </span>
                                <span className="text-xs text-gray-600">{Math.round(progress)}% complete</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">

                {/* Title Section */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
                    {description && (
                        <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">{description}</p>
                    )}
                </div>

                {/* Child Content */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {children}
                </div>

                {/* Footer Navigation */}
                {showFooter && (
                    <div className="mt-6 sm:mt-8 flex justify-between gap-3">
                        <button
                            onClick={onBack || (() => navigate(-1))}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                        >
                            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                            <span>{backLabel}</span>
                        </button>

                        {onNext && (
                            <button
                                onClick={onNext}
                                disabled={nextDisabled || loading}
                                className="flex flex-1 min-w-0 items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white flex-shrink-0" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{nextLabel}</span>
                                        <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 rotate-180 flex-shrink-0" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Help Section */}
            <div className="max-w-4xl mx-auto px-4 pb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                            <span className="text-blue-600 text-sm">💡</span>
                        </div>
                        <div className="min-w-0">
                            <h4 className="font-medium text-blue-900 text-sm">Need Help?</h4>
                            <p className="text-xs sm:text-sm text-blue-700 mt-0.5">
                                Contact our support team at{' '}
                                <a href="mailto:support@pyonea.com" className="font-medium underline">
                                    support@pyonea.com
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;