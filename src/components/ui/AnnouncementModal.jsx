// src/components/ui/AnnouncementModal.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../../config';

const BADGE_COLORS = {
  green:  'bg-green-500 text-white',
  red:    'bg-red-500 text-white',
  blue:   'bg-blue-500 text-white',
  yellow: 'bg-yellow-400 text-gray-900',
  purple: 'bg-purple-500 text-white',
  orange: 'bg-orange-500 text-white',
};

const TYPE_LABELS = {
  announcement:  { label: '📢 Announcement', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  promotion:     { label: '🔥 Promotion',    color: 'bg-orange-50 text-orange-700 border-orange-200' },
  newsletter:    { label: '📬 Newsletter',   color: 'bg-purple-50 text-purple-700 border-purple-200' },
  advertisement: { label: '💼 Sponsored',   color: 'bg-gray-50 text-gray-600 border-gray-200' },
  sponsorship:   { label: '🤝 Partnership', color: 'bg-green-50 text-green-700 border-green-200' },
};

const AnnouncementModal = ({ announcement, onClose }) => {
  const overlayRef = useRef(null);

  const close = useCallback(() => {
    if (announcement?.show_once) {
      // Remember for today — key is date + id so it resets daily
      const key = `ann_seen_${announcement.id}_${new Date().toDateString()}`;
      localStorage.setItem(key, '1');
    }
    onClose();
  }, [announcement, onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [close]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!announcement) return null;

  const type   = TYPE_LABELS[announcement.type] ?? TYPE_LABELS.announcement;
  const badge  = BADGE_COLORS[announcement.badge_color] ?? BADGE_COLORS.green;
  const imgSrc = announcement.image;

  const isExternal = announcement.cta_url?.startsWith('http');
  const CtaComponent = isExternal ? 'a' : Link;
  const ctaProps = isExternal
    ? { href: announcement.cta_url, target: '_blank', rel: 'noopener noreferrer' }
    : { to: announcement.cta_url };

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => { if (e.target === overlayRef.current) close(); }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />

        {/* Modal card */}
        <motion.div
          className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1,    opacity: 1, y: 0  }}
          exit={{    scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        >
          {/* Close button */}
          <button
            onClick={close}
            className="absolute top-3 right-3 z-20 p-1.5 bg-white/90 backdrop-blur-sm
                       rounded-full shadow-md text-gray-500 hover:text-gray-800
                       hover:bg-white transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>

          {/* Hero image */}
          {imgSrc && (
            <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
              <img
                src={imgSrc}
                alt={announcement.title}
                className="w-full h-full object-cover"
              />
              {/* Badge overlay */}
              {announcement.badge_label && (
                <span className={`absolute top-3 left-3 text-xs font-bold
                                  px-2.5 py-1 rounded-full shadow ${badge}`}>
                  {announcement.badge_label}
                </span>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-5">
            {/* Type tag */}
            <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold
                             px-2 py-0.5 rounded-full border mb-3 ${type.color}`}>
              {type.label}
            </div>

            {/* Badge (no image case) */}
            {!imgSrc && announcement.badge_label && (
              <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-3 ${badge}`}>
                {announcement.badge_label}
              </span>
            )}

            <h2 className="text-lg font-bold text-gray-900 leading-snug mb-2">
              {announcement.title}
            </h2>

            {announcement.content && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {announcement.content}
              </p>
            )}

            {/* CTA */}
            {announcement.cta_label && announcement.cta_url && (
              <CtaComponent
                {...ctaProps}
                onClick={close}
                className={`block w-full text-center py-2.5 rounded-xl text-sm font-semibold
                             transition-colors ${
                  announcement.cta_style === 'outline'
                    ? 'border-2 border-green-600 text-green-700 hover:bg-green-50'
                    : 'bg-green-600 text-white hover:bg-green-700 shadow-sm'
                }`}
              >
                {announcement.cta_label}
              </CtaComponent>
            )}

            {/* Dismiss */}
            <button
              onClick={close}
              className="mt-3 block w-full text-center text-xs text-gray-400
                         hover:text-gray-600 transition-colors py-1"
            >
              {announcement.show_once ? "Don't show again today" : 'Dismiss'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementModal;