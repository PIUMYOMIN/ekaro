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
    const { progress, steps, currentStep } = useOnboardingState();
    const navigate = useNavigate();

    const currentStepIndex = steps.findIndex(step => step.id === currentStep);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header */}
            {showHeader && (
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <button
                                onClick={() => navigate('/seller')}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <HomeIcon className="w-5 h-5 mr-2" />
                                <span>Dashboard</span>
                            </button>
                            <div className="text-sm text-gray-600">
                                Seller Onboarding
                            </div>
                        </div>
                    </div>
                </header>
            )}

            {/* Progress Bar */}
            {showProgress && (
                <div className="bg-white shadow-sm">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex justify-between items-center mb-2">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex flex-col items-center relative">
                                    {/* Connection Line */}
                                    {index < steps.length - 1 && (
                                        <div className={`absolute top-5 left-1/2 w-full h-0.5 ${
                                            index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                                        }`}></div>
                                    )}
                                    
                                    <div className={`
                                        w-10 h-10 rounded-full flex items-center justify-center relative z-10
                                        ${index < currentStepIndex ? 'bg-green-500 text-white' : 
                                          index === currentStepIndex ? 'bg-green-100 text-green-700 border-2 border-green-500' : 
                                          'bg-gray-100 text-gray-500'}
                                    `}>
                                        {index < currentStepIndex ? (
                                            <CheckCircleIcon className="w-6 h-6" />
                                        ) : (
                                            <span>{step.icon}</span>
                                        )}
                                    </div>
                                    <span className={`text-xs mt-2 font-medium ${
                                        index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'
                                    }`}>
                                        {step.title}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Store Basic</span>
                            <span>Review & Submit</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                            <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <div className="text-right text-xs text-gray-600 mt-1">
                            {Math.round(progress)}% Complete
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                    {description && (
                        <p className="text-gray-600 mt-2">{description}</p>
                    )}
                    <div className="flex items-center mt-2 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Step {currentStepIndex + 1} of {steps.length}
                        </span>
                        <span className="ml-4">
                            {Math.round((currentStepIndex + 1) / steps.length * 100)}% of this step
                        </span>
                    </div>
                </div>

                {/* Child Content */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {children}
                </div>

                {/* Footer Navigation */}
                {showFooter && (
                    <div className="mt-8 flex justify-between">
                        <button
                            onClick={onBack || (() => navigate(-1))}
                            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            <span>{backLabel}</span>
                        </button>

                        {onNext && (
                            <button
                                onClick={onNext}
                                disabled={nextDisabled || loading}
                                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{nextLabel}</span>
                                        <ArrowLeftIcon className="w-5 h-5 rotate-180" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Help Section */}
            <div className="max-w-4xl mx-auto px-4 pb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <span className="text-blue-600">💡</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900">Need Help?</h4>
                            <p className="text-sm text-blue-700 mt-1">
                                If you encounter any issues during onboarding, contact our support team at 
                                <a href="mailto:support@example.com" className="font-medium ml-1">support@example.com</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;