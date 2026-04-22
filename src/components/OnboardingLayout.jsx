// components/OnboardingLayout.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeftIcon,
    CheckCircleIcon,
    HomeIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useOnboardingState } from '../hooks/useOnboardingState';

const OnboardingLayout = ({
    children,
    title,
    description,
    currentStepOverride,
    onNext,
    onBack,
    showProgress = true,
    showHeader   = true,
    showFooter   = true,
    nextLabel    = 'Continue',
    backLabel    = 'Back',
    nextDisabled = false,
    loading      = false,
}) => {
    const { progress, steps, currentStep, isLoading } = useOnboardingState();
    const { t }  = useTranslation();
    const navigate = useNavigate();

    const activeStep = currentStepOverride || currentStep;
    const currentStepIndex = steps.findIndex(step => step.id === activeStep);

    if (isLoading && currentStepIndex === -1) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:bg-gray-900 dark:from-gray-900 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('onboarding_layout.loading')}</p>
                </div>
            </div>
        );
    }

    const safeIndex = Math.max(0, currentStepIndex);
    const pct       = Math.min(100, Math.max(0, progress));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

            {/* ── Top bar ───────────────────────────────────────────────── */}
            {showHeader && (
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center justify-between h-14">
                            <button
                                onClick={() => navigate('/seller')}
                                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400
                                           hover:text-green-700 dark:hover:text-green-400 transition-colors"
                            >
                                <HomeIcon className="w-4 h-4" />
                                <span className="hidden sm:inline">{t('sidebar.dashboard') || 'Dashboard'}</span>
                            </button>

                            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 tracking-tight">
                                {t('onboarding_layout.seller_onboarding')}
                            </span>

                            {/* Step counter — always shown */}
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20
                                             border border-green-200 dark:border-green-800 px-2.5 py-1 rounded-full">
                                {safeIndex + 1} / {steps.length}
                            </span>
                        </div>
                    </div>
                </header>
            )}

            {/* ── Progress section ──────────────────────────────────────── */}
            {showProgress && (
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-5">

                        {/* ── DESKTOP stepper (sm and up) ─────────────────── */}
                        <div className="hidden sm:flex items-start gap-0">
                            {steps.map((step, index) => {
                                const done    = index < safeIndex;
                                const current = index === safeIndex;
                                const last    = index === steps.length - 1;

                                return (
                                    <React.Fragment key={step.id}>
                                        {/* Step node */}
                                        <div className="flex flex-col items-center" style={{ minWidth: 0 }}>
                                            {/* Circle */}
                                            <div className={`
                                                w-9 h-9 rounded-full flex items-center justify-center
                                                text-sm font-semibold flex-shrink-0 transition-all duration-300
                                                ${done
                                                    ? 'bg-green-500 text-white'
                                                    : current
                                                    ? 'bg-white dark:bg-gray-800 border-2 border-green-500 text-green-600 dark:text-green-400 shadow-sm shadow-green-100'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-600'}
                                            `}>
                                                {done
                                                    ? <CheckCircleIcon className="w-5 h-5" />
                                                    : <span>{step.icon}</span>
                                                }
                                            </div>

                                            {/* Label */}
                                            <span className={`
                                                mt-1.5 text-[11px] font-medium text-center leading-tight
                                                w-16 break-words
                                                ${current ? 'text-green-700 dark:text-green-400' : done ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}
                                            `}>
                                                {step.title}
                                            </span>
                                        </div>

                                        {/* Connector */}
                                        {!last && (
                                            <div className="flex-1 mt-4 mx-1">
                                                <div className={`
                                                    h-0.5 rounded-full transition-colors duration-300
                                                    ${index < safeIndex ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}
                                                `} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>

                        {/* ── MOBILE progress (below sm) ──────────────────── */}
                        {/* Step pills — one per step, filled up to current */}
                        <div className="sm:hidden">
                            {/* Step name + percentage */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{steps[safeIndex]?.icon}</span>
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        {steps[safeIndex]?.title}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-green-700 dark:text-green-400">{Math.round(pct)}%</span>
                            </div>

                            {/* Segmented pill bar — one segment per step */}
                            <div className="flex gap-1">
                                {steps.map((step, index) => {
                                    const done    = index < safeIndex;
                                    const current = index === safeIndex;
                                    return (
                                        <div
                                            key={step.id}
                                            className={`
                                                flex-1 h-1.5 rounded-full transition-all duration-300
                                                ${done    ? 'bg-green-500'
                                                : current ? 'bg-green-300'
                                                :           'bg-gray-200 dark:bg-gray-700'}
                                            `}
                                        />
                                    );
                                })}
                            </div>

                            {/* Previous / Next step hint */}
                            <div className="flex items-center justify-between mt-2">
                                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                    {safeIndex > 0 ? `↑ ${steps[safeIndex - 1]?.title}` : ''}
                                </span>
                                <span className="text-[11px] text-gray-400 dark:text-gray-500">
                                    {safeIndex < steps.length - 1 ? `${steps[safeIndex + 1]?.title} →` : 'Last step'}
                                </span>
                            </div>
                        </div>

                        {/* ── Desktop progress bar (below stepper) ────────── */}
                        <div className="hidden sm:block mt-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {t('onboarding_layout.step_of', {
                                        current: safeIndex + 1,
                                        total: steps.length,
                                    })}
                                </span>
                                <span className="text-xs font-bold text-green-700 dark:text-green-400">{Math.round(pct)}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-full
                                               rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Main content ─────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8">

                {(title || description) && (
                    <div className="mb-5 sm:mb-6">
                        {title && (
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                {title}
                            </h1>
                        )}
                        {description && (
                            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">{description}</p>
                        )}
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {children}
                </div>

                {showFooter && (
                    <div className="mt-5 sm:mt-6 flex items-center gap-3">
                        <button
                            onClick={onBack || (() => navigate(-1))}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 border border-gray-300 dark:border-gray-600
                                       text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors
                                       disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium
                                       flex-shrink-0"
                        >
                            <ArrowLeftIcon className="w-4 h-4 flex-shrink-0" />
                            <span>{backLabel || t('onboarding_layout.back')}</span>
                        </button>

                        {onNext && (
                            <button
                                onClick={onNext}
                                disabled={nextDisabled || loading}
                                className="flex flex-1 items-center justify-center gap-2 px-4 sm:px-6 py-2.5
                                           bg-green-600 text-white rounded-xl hover:bg-green-700
                                           active:bg-green-800 transition-colors
                                           disabled:opacity-50 disabled:cursor-not-allowed
                                           text-sm font-semibold shadow-sm"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white flex-shrink-0" />
                                        <span>Saving…</span>
                                    </>
                                ) : (
                                    <>
                                        <span>{nextLabel}</span>
                                        <ChevronRightIcon className="w-4 h-4 flex-shrink-0" />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── Help banner ──────────────────────────────────────────── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
                <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800
                                rounded-xl px-4 py-3">
                    <span className="text-base flex-shrink-0">💡</span>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                            {t('onboarding_layout.need_help')}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                            {t('onboarding_layout.contact_support')}{' '}
                            <a href="mailto:support@pyonea.com"
                               className="font-semibold underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300">
                                support@pyonea.com
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingLayout;
