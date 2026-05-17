// src/pages/Pricing.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  ArrowUpCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import useSEO from '../hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtMMK = (n) =>
  Number(n) === 0 ? 'Free' : `${Number(n).toLocaleString()} MMK`;

const PLAN_STYLES = {
  basic: {
    icon:    '🏪',
    ring:    'border-gray-200 dark:border-gray-700',
    accent:  'text-gray-700 dark:text-gray-200',
    btn:     'bg-gray-800 hover:bg-gray-900 dark:bg-gray-200 dark:hover:bg-white dark:text-gray-900 text-white',
    popular: false,
  },
  professional: {
    icon:    '🚀',
    ring:    'border-green-500 shadow-green-100 dark:shadow-green-900/20',
    accent:  'text-green-600 dark:text-green-400',
    btn:     'bg-green-600 hover:bg-green-700 text-white',
    popular: true,
  },
  enterprise: {
    icon:    '🏢',
    ring:    'border-purple-500 shadow-purple-100 dark:shadow-purple-900/20',
    accent:  'text-purple-600 dark:text-purple-400',
    btn:     'bg-purple-600 hover:bg-purple-700 text-white',
    popular: false,
  },
};

const FAQS = [
  {
    q: 'Are there any setup fees?',
    a: 'No — there are no setup or onboarding fees for any plan. You only pay the monthly subscription fee if you choose a paid plan.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes. You can upgrade or downgrade any time from your Seller Dashboard → Subscription tab. Upgrades take effect immediately; downgrades require your product count to fit within the new limit.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept KBZPay, Wave Money, CB Bank transfer, and MMQR. After transferring, paste your transaction reference in the upgrade flow.',
  },
  {
    q: 'Is there a long-term contract?',
    a: 'No. All paid plans are month-to-month. Cancel any time and you will revert to the free Basic plan at the end of your billing period.',
  },
  {
    q: 'What happens if I reach my product limit?',
    a: 'You will not be able to add new products until you upgrade to a higher plan or remove existing ones. Your store and current listings remain live.',
  },
  {
    q: 'Does the commission rate apply to every order?',
    a: 'Yes. The commission is deducted from each sale and applies to the subtotal before delivery fees.',
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

const Pricing = () => {
  const SeoComponent = useSEO({
    title:       'Pricing & Plans | Pyonea Myanmar B2B Marketplace',
    description: 'Choose the right plan for your business. Free and premium tiers for sellers on Myanmar\'s leading B2B marketplace.',
    url:         '/pricing',
  });

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [plans,        setPlans]        = useState([]);
  const [currentSub,   setCurrentSub]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [openFaq,      setOpenFaq]      = useState(null);

  const isSeller = user?.role === 'seller' || user?.type === 'seller';

  // ── Fetch plans + current subscription ────────────────────────────────

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      try {
        if (isSeller) {
          // Seller-specific endpoint includes is_current flag
          const [plansRes, subRes] = await Promise.all([
            api.get('/seller/subscription/plans'),
            api.get('/seller/subscription'),
          ]);
          setPlans(plansRes.data.data ?? []);
          setCurrentSub(subRes.data.data ?? null);
        } else {
          // Public endpoint (no auth) — fallback to static if not available
          try {
            const res = await api.get('/subscription-plans');
            setPlans(res.data.data ?? []);
          } catch {
            // Use seeder defaults for public visitors
            setPlans(STATIC_PLANS);
          }
        }
      } catch {
        setPlans(STATIC_PLANS);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, [isSeller]);

  // ── CTA logic ─────────────────────────────────────────────────────────

  const handleCTA = (plan) => {
    if (!isAuthenticated) {
      navigate('/register?role=seller');
      return;
    }
    if (isSeller) {
      // Go to dashboard subscription tab
      navigate('/seller/dashboard?tab=subscription');
      return;
    }
    // Buyer or other role — prompt to register as seller
    navigate('/register?role=seller');
  };

  const ctaLabel = (plan) => {
    if (!isAuthenticated) return 'Get Started Free';
    if (isSeller && plan.is_current) return '✓ Current Plan';
    if (isSeller) return plan.price_mmk === 0 ? 'Switch to Basic' : `Upgrade to ${plan.name}`;
    return 'Register as Seller';
  };

  // ── Loading skeleton ──────────────────────────────────────────────────

  if (loading) {
    return (
      <>
        {SeoComponent}
        <div className="container mx-auto px-4 py-12">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-4 w-80 bg-gray-100 dark:bg-gray-800 rounded mx-auto mb-12 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[0,1,2].map(i => <div key={i} className="h-80 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />)}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {SeoComponent}
      <div className="container mx-auto px-4 py-12 space-y-16">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-semibold px-4 py-1.5 rounded-full">
            <SparklesIcon className="w-4 h-4" />
            Seller Plans — No Hidden Fees
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-gray-100">
            Choose the right plan for your business
          </h1>
          <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400">
            Start free and scale as you grow. Upgrade any time — cancel any time.
          </p>
        </div>

        {/* ── Plan cards ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const styles    = PLAN_STYLES[plan.slug] ?? PLAN_STYLES.basic;
            const isCurrent = plan.is_current;

            return (
              <div
                key={plan.id ?? plan.slug}
                className={`relative flex flex-col rounded-2xl border-2 shadow-lg bg-white dark:bg-gray-800 ${styles.ring} ${styles.popular ? 'md:-translate-y-2' : ''} transition-transform duration-200`}
              >
                {/* Badge */}
                {styles.popular && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="bg-green-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-4 inset-x-0 flex justify-center">
                    <span className="bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 text-xs font-bold px-4 py-1 rounded-full shadow">
                      Your Current Plan
                    </span>
                  </div>
                )}

                <div className="p-6 flex flex-col flex-1 space-y-5">
                  {/* Plan name + price */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-3xl">{styles.icon}</span>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{plan.name}</h2>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{plan.description}</p>
                    <p className={`text-3xl font-extrabold ${styles.accent}`}>
                      {fmtMMK(plan.price_mmk)}
                      {plan.price_mmk > 0 && <span className="text-base font-normal text-gray-400">/mo</span>}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1">
                    {[
                      { label: `${plan.product_limit_label ?? plan.product_limit} products`,        ok: true },
                      { label: `${plan.commission_percent ?? `${(plan.commission_rate*100).toFixed(0)}%`} commission`, ok: true },
                      { label: 'Analytics dashboard',  ok: plan.analytics_enabled },
                      { label: 'Bulk import / export', ok: plan.bulk_import_enabled },
                      { label: 'Priority support',     ok: plan.priority_support },
                      { label: 'Custom storefront',    ok: plan.custom_storefront },
                    ].map(({ label, ok }) => (
                      <li key={label} className="flex items-center gap-2 text-sm">
                        {ok
                          ? <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                          : <XCircleIcon     className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" />}
                        <span className={ok ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}>
                          {label}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Current plan usage bar */}
                  {isCurrent && currentSub?.products_used !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Products used</span>
                        <span>{currentSub.products_used} / {plan.product_limit === -1 ? '∞' : plan.product_limit}</span>
                      </div>
                      {plan.product_limit !== -1 && (
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${Math.min(100, (currentSub.products_used / plan.product_limit) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA button */}
                  <button
                    onClick={() => !isCurrent && handleCTA(plan)}
                    disabled={isCurrent}
                    className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5
                      ${isCurrent
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-default'
                        : styles.btn}`}
                  >
                    {isCurrent ? (
                      <><CheckCircleIcon className="w-4 h-4" /> Current Plan</>
                    ) : !isAuthenticated ? (
                      'Get Started →'
                    ) : isSeller ? (
                      <><ArrowUpCircleIcon className="w-4 h-4" /> {ctaLabel(plan)}</>
                    ) : (
                      <><LockClosedIcon className="w-4 h-4" /> Register as Seller</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {faq.q}
                  <span className="text-gray-400 ml-3 flex-shrink-0">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA banner ───────────────────────────────────────────────── */}
        {!isSeller && (
          <div className="max-w-2xl mx-auto bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-8 text-center text-white space-y-4 shadow-xl">
            <h3 className="text-2xl font-bold">Ready to start selling?</h3>
            <p className="text-green-100">Join thousands of Myanmar businesses on Pyonea. Start free, no credit card required.</p>
            <button
              onClick={() => navigate('/register?role=seller')}
              className="bg-white text-green-700 font-bold px-8 py-3 rounded-xl hover:bg-green-50 transition-colors"
            >
              Create Seller Account →
            </button>
          </div>
        )}
      </div>
    </>
  );
};

// Fallback static data (matches seeder) — used when API is unavailable
const STATIC_PLANS = [
  { id:1, slug:'basic',        name:'Basic',        description:'For small businesses getting started', price_mmk:0,      billing_cycle:'monthly', product_limit:20,  product_limit_label:'20',        commission_rate:0.05, commission_percent:'5%',  analytics_enabled:false, bulk_import_enabled:false, priority_support:false, custom_storefront:false },
  { id:2, slug:'professional', name:'Professional', description:'For growing businesses',               price_mmk:50000,  billing_cycle:'monthly', product_limit:100, product_limit_label:'100',       commission_rate:0.03, commission_percent:'3%',  analytics_enabled:true,  bulk_import_enabled:false, priority_support:true,  custom_storefront:false },
  { id:3, slug:'enterprise',   name:'Enterprise',   description:'For large businesses and wholesalers', price_mmk:150000, billing_cycle:'monthly', product_limit:-1,  product_limit_label:'Unlimited', commission_rate:0.01, commission_percent:'1%',  analytics_enabled:true,  bulk_import_enabled:true,  priority_support:true,  custom_storefront:true  },
];

export default Pricing;