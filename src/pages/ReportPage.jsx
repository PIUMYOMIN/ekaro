// src/pages/ReportPage.jsx
// Standalone public page for submitting reports/tickets.
// Accessible to all users (logged-in and guests) via the footer link at /report.
// Authenticated users also see a link to their ticket history.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import {
  TicketIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  PaperClipIcon,
  ArrowRightIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

// ── Constants (same as ReportForm modal) ─────────────────────────────────────

const CATEGORIES = [
  { value: 'bug',        label: 'Bug / App Error',        labelMM: ' ပရိုဂရမ်ချို့ယွင်းမှု' },
  { value: 'payment',    label: 'Payment Issue',           labelMM: ' ငွေပေးချေမှုပြဿနာ' },
  { value: 'order',      label: 'Order Problem',           labelMM: ' အော်ဒါပြဿနာ' },
  { value: 'seller',     label: 'Seller Misconduct',       labelMM: ' ရောင်းသူပြဿနာ' },
  { value: 'product',    label: 'Fake / Wrong Product',    labelMM: ' ကုန်ပစ္စည်းပြဿနာ' },
  { value: 'account',    label: 'Account Issue',           labelMM: ' အကောင့်ပြဿနာ' },
  { value: 'content',    label: 'Inappropriate Content',  labelMM: ' မသင့်တော်သောအကြောင်းအရာ' },
  { value: 'billing',    label: 'Billing Dispute',         labelMM: 'ငွေကြေးဆိုင်ရာတိုင်ကြားချက်' },
  { value: 'delivery',   label: 'Delivery Problem',        labelMM: 'ပို့ဆောင်ရေးပြဿနာ' },
  { value: 'safety',     label: 'Safety / Fraud / Scam',  labelMM: 'လုံခြုံရေး / လိမ်လည်မှု' },
  { value: 'suggestion', label: 'Suggestion / Feedback',  labelMM: 'အကြံပြုချက်' },
  { value: 'other',      label: 'Other',                   labelMM: 'အခြား' },
];

const PRIORITIES = [
  { value: 'low',      label: 'Low',      labelMM: 'နိမ့်', cls: 'text-gray-600 dark:text-slate-400' },
  { value: 'medium',   label: 'Medium',   labelMM: 'သာမန်', cls: 'text-blue-600 dark:text-blue-400' },
  { value: 'high',     label: 'High',     labelMM: 'မြင့်', cls: 'text-orange-600 dark:text-orange-400' },
  { value: 'critical', label: 'Critical', labelMM: 'အရေးပေါ်', cls: 'text-red-600 dark:text-red-400' },
];

const SLA_INFO = [
  { priority: 'critical', hours: '4',   cls: 'text-red-600 dark:text-red-400',    dot: '🔴' },
  { priority: 'high',     hours: '12',  cls: 'text-orange-600 dark:text-orange-400', dot: '🟠' },
  { priority: 'medium',   hours: '48',  cls: 'text-blue-600 dark:text-blue-400',  dot: '🔵' },
  { priority: 'low',      hours: '120', cls: 'text-gray-500 dark:text-slate-400', dot: '⚪' },
];

const INPUT_CLS = [
  'w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl text-sm',
  'bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100',
  'placeholder-gray-400 dark:placeholder-slate-500',
  'focus:ring-2 focus:ring-green-500 focus:outline-none transition-shadow',
].join(' ');

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const { t, i18n }              = useTranslation();
  const { user }                 = useAuth();
  const { executeRecaptcha }     = useGoogleReCaptcha();
  const isMM                     = i18n.language === 'my';

  const [form, setForm] = useState({
    category: '', priority: 'medium', subject: '', description: '',
    related_order_id: '', related_url: '',
    guest_name: '', guest_email: '',
  });
  const [files,   setFiles]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors,  setErrors]  = useState({});

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!executeRecaptcha) {
      setErrors({ general: 'reCAPTCHA not ready. Please refresh and try again.' });
      return;
    }

    setLoading(true);
    try {
      const recaptchaToken = await executeRecaptcha('report');

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v); });
      fd.append('recaptcha_token', recaptchaToken);
      files.forEach((f, i) => fd.append(`attachments[${i}]`, f));

      const res = await api.post('/reports', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess({ ticket_id: res.data.ticket_id });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      if (e.response?.data?.errors) {
        setErrors(e.response.data.errors);
      } else {
        setErrors({ general: e.response?.data?.message || 'Failed to submit. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center px-4 py-16">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
            {isMM ? 'တင်ပြချက် လက်ခံပြီ' : 'Report Submitted!'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mb-6 text-sm">
            {isMM
              ? 'သင့်ကိစ္စရပ်ကို မှတ်တမ်းတင်ပြီးပါပြီ။ ID ကိုသိမ်းဆည်းထားပါ။'
              : 'Your report has been logged. Save your ticket ID to track progress.'}
          </p>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl px-8 py-5 mb-6">
            <p className="text-xs text-green-700 dark:text-green-400 uppercase tracking-widest font-semibold mb-2">
              {isMM ? 'ကိစ္စရပ် ID' : 'Ticket ID'}
            </p>
            <p className="font-mono text-2xl font-black text-green-800 dark:text-green-300 tracking-widest">
              {success.ticket_id}
            </p>
          </div>

          <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">
            {isMM
              ? 'အပ်ဒိတ်များကို email သို့ ပေးပို့မည်'
              : 'Status updates will be sent to your email address'}
          </p>

          <div className="flex flex-col gap-3">
            {user && (
              <Link to="/my-reports"
                className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors text-sm">
                <TicketIcon className="h-4 w-4" />
                {isMM ? 'ကျွန်ုပ်၏ တိုင်ကြားချက်များ' : 'View My Reports'}
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            )}
            <button onClick={() => { setSuccess(null); setForm({ category: '', priority: 'medium', subject: '', description: '', related_order_id: '', related_url: '', guest_name: '', guest_email: '' }); setFiles([]); }}
              className="w-full py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-semibold">
              {isMM ? 'နောက်ထပ်တင်ပြမည်' : 'Submit Another Report'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
            <TicketIcon className="h-7 w-7 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
            {isMM ? 'တိုင်ကြားချက်တင်ပြမည်' : 'Report an Issue'}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 text-sm max-w-md mx-auto">
            {isMM
              ? 'ပြဿနာတစ်ခုတွေ့ပါက ကျွန်ုပ်တို့အားအသိပေးပါ။ ၂၄ နာရီအတွင်း ပြန်ကြားပါမည်။'
              : 'Found a bug, issue, or want to report misconduct? We take every report seriously and respond promptly.'}
          </p>
          {user && (
            <p className="mt-3 text-sm">
              <Link to="/my-reports" className="text-green-600 dark:text-green-400 hover:underline font-medium inline-flex items-center gap-1">
                View my previous reports <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Form card ── */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">

              {errors.general && (
                <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                  <ExclamationTriangleIcon className="h-4 w-4 shrink-0 mt-0.5" />
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Guest fields */}
                {!user && (
                  <div className="grid grid-cols-2 gap-4 pb-5 border-b border-gray-100 dark:border-slate-700">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                        {isMM ? 'နာမည်' : 'Your Name'} *
                      </label>
                      <input value={form.guest_name} onChange={set('guest_name')} required
                        placeholder={isMM ? 'နာမည်ထည့်ပါ' : 'Full name'}
                        className={INPUT_CLS} />
                      {errors.guest_name && <p className="text-xs text-red-500 mt-1">{errors.guest_name[0]}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                        Email *
                      </label>
                      <input type="email" value={form.guest_email} onChange={set('guest_email')} required
                        placeholder="your@email.com" className={INPUT_CLS} />
                      {errors.guest_email && <p className="text-xs text-red-500 mt-1">{errors.guest_email[0]}</p>}
                    </div>
                  </div>
                )}

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    {isMM ? 'အမျိုးအစား' : 'Category'} *
                  </label>
                  <select value={form.category} onChange={set('category')} required className={INPUT_CLS}>
                    <option value="">{isMM ? 'ရွေးချယ်ပါ…' : 'Select a category…'}</option>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{isMM ? c.labelMM : c.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category[0]}</p>}
                  {(form.category === 'safety') && (
                    <div className="mt-2 flex items-start gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                      <ExclamationTriangleIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      {isMM
                        ? 'ဤအမျိုးအစားကို ဦးစားပေး HIGH အဖြစ် အလိုအလျောက် တင်ပေးပါမည်'
                        : 'This category is automatically escalated to HIGH priority'}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    {isMM ? 'အရေးတကြီး' : 'Priority'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRIORITIES.map(p => (
                      <button key={p.value} type="button"
                        onClick={() => setForm(f => ({ ...f, priority: p.value }))}
                        className={`py-2.5 text-xs font-semibold rounded-xl border-2 transition-all ${
                          form.priority === p.value
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                        } ${p.cls}`}>
                        {isMM ? p.labelMM : p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    {isMM ? 'အကျဉ်းချုပ်' : 'Subject'} *
                  </label>
                  <input value={form.subject} onChange={set('subject')} required
                    placeholder={isMM ? 'ပြဿနာအကျဉ်းချုပ် (min 5 characters)' : 'Brief summary of the issue (min 5 characters)'}
                    className={INPUT_CLS} maxLength={200} />
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject[0]}</p>}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    {isMM ? 'အသေးစိတ်ဖော်ပြချက်' : 'Description'} *
                    <span className="ml-1 font-normal text-gray-400 dark:text-slate-500">
                      {isMM ? '(min 20 characters)' : '(min 20 characters)'}
                    </span>
                  </label>
                  <textarea value={form.description} onChange={set('description')} required
                    rows={5} maxLength={5000}
                    placeholder={isMM
                      ? 'လူကြီးမင်း၏ ပြဿနာကိုပြောပါ?'
                      : 'Describe the issue in detail — what happened, when it occurred, steps to reproduce, and what you expected to happen.'}
                    className={INPUT_CLS + ' resize-none'} />
                  <div className="flex justify-between mt-1">
                    {errors.description
                      ? <p className="text-xs text-red-500">{errors.description[0]}</p>
                      : <span />}
                    <p className="text-xs text-gray-400 dark:text-slate-500 ml-auto">
                      {form.description.length}/5000
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
                    <PaperClipIcon className="inline h-3.5 w-3.5 mr-1" />
                    {isMM ? 'ပူးတွဲဖိုင်များ' : 'Attachments'}
                    <span className="ml-1 font-normal text-gray-400 dark:text-slate-500">
                      ({isMM ? 'ပုံများ / PDF max 5' : 'screenshots or PDF, up to 5 files'})
                    </span>
                  </label>
                  <input type="file" multiple accept="image/*,.pdf"
                    onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 5))}
                    className="block w-full text-xs text-gray-500 dark:text-slate-400
                      file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0
                      file:bg-green-50 dark:file:bg-green-900/20
                      file:text-green-700 dark:file:text-green-400
                      file:text-xs file:font-semibold
                      hover:file:bg-green-100 dark:hover:file:bg-green-900/30 file:transition-colors" />
                  {files.length > 0 && (
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5">
                      {files.length} file{files.length > 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>

                {/* Optional context */}
                <details className="group">
                  <summary className="text-xs text-gray-500 dark:text-slate-400 cursor-pointer select-none hover:text-gray-700 dark:hover:text-slate-300 py-1">
                    <span className="group-open:hidden">+ </span>
                    <span className="hidden group-open:inline">− </span>
                    {isMM ? 'ဆက်စပ်သောအချက်အလက်များ (ရွေးချယ်စရာ)' : 'Add related context (optional)'}
                  </summary>
                  <div className="mt-3 space-y-3">
                    <input value={form.related_url} onChange={set('related_url')} type="url"
                      placeholder="https://pyonea.com/... (page where issue occurred)"
                      className={INPUT_CLS} />
                    <input value={form.related_order_id} onChange={set('related_order_id')} type="number"
                      placeholder="Order ID (if related to a specific order)"
                      className={INPUT_CLS} />
                  </div>
                </details>

                {/* reCAPTCHA notice + Submit */}
                <div className="pt-2 space-y-3">
                  <button type="submit" disabled={loading || !form.category || !form.subject || !form.description}
                    className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {isMM ? 'တင်ပေးနေသည်…' : 'Submitting…'}
                      </>
                    ) : (
                      <>
                        <TicketIcon className="h-4 w-4" />
                        {isMM ? 'တိုင်ကြားချက်တင်မည်' : 'Submit Report'}
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* ── Sidebar info ── */}
          <div className="space-y-4">

            {/* Response times */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-3 flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-green-600" />
                {isMM ? 'တုံ့ပြန်ချိန်' : 'Response Times'}
              </h3>
              <div className="space-y-2">
                {SLA_INFO.map(s => (
                  <div key={s.priority} className="flex items-center justify-between text-xs">
                    <span className={`font-semibold capitalize ${s.cls}`}>
                      {s.dot} {s.priority}
                    </span>
                    <span className="text-gray-500 dark:text-slate-400">
                      {isMM ? `${s.hours} နာရီ` : `${s.hours}h`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* What happens next */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5">
              <h3 className="text-sm font-bold text-gray-900 dark:text-slate-100 mb-3">
                {isMM ? 'နောက်ဆက်တွဲ' : 'What Happens Next'}
              </h3>
              <ol className="space-y-3">
                {[
                  isMM
                    ? ['တိုင်ကြားချက် ID ရမည်', 'Email မှ အတည်ပြုချက်ရမည်', 'ကျွန်ုပ်တို့ မသုံးသပ်မည်', 'ဖြေရှင်းချက် ပေးပို့မည်']
                    : ['You receive a unique ticket ID', 'Email confirmation is sent', 'Our team reviews and investigates', 'Resolution sent via email & portal'],
                ][0].map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-slate-400">
                    <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* My reports link */}
            {user && (
              <Link to="/my-reports"
                className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group">
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                    {isMM ? 'ကျွန်ုပ်၏ တိုင်ကြားချက်များ' : 'My Reports'}
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                    {isMM ? 'ယခင် တင်ပြချက်များ ကြည့်မည်' : 'Track your previous tickets'}
                  </p>
                </div>
                <ArrowRightIcon className="h-4 w-4 text-green-600 dark:text-green-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}