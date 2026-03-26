import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import useSEO from "../hooks/useSEO";
import {
  CheckCircleIcon,
  XCircleIcon,
  ChevronDownIcon,
  ShieldCheckIcon,
  CubeIcon,
  CurrencyDollarIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

// ─── Data ────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "eligibility",   label: "Eligibility",       icon: ShieldCheckIcon },
  { id: "products",      label: "Product Standards",  icon: CubeIcon },
  { id: "pricing",       label: "Pricing & Fees",     icon: CurrencyDollarIcon },
  { id: "shipping",      label: "Shipping",           icon: TruckIcon },
  { id: "communication", label: "Communication",      icon: ChatBubbleLeftRightIcon },
  { id: "documents",     label: "Documents",          icon: DocumentTextIcon },
  { id: "prohibited",    label: "Prohibited Items",   icon: ExclamationTriangleIcon },
  { id: "performance",   label: "Performance",        icon: StarIcon },
];

const ELIGIBILITY_REQUIREMENTS = [
  "Registered business in Myanmar (LLC, sole proprietorship, or partnership)",
  "Valid National Registration Card (NRC) or company registration certificate",
  "Active Myanmar bank account for payment processing",
  "Valid phone number and email address for account verification",
  "Agreement to Pyonea's Terms of Service and Seller Policy",
];

const PRODUCT_DOS = [
  "Provide accurate, complete product descriptions in English and Myanmar",
  "Upload high-quality images (minimum 800×800px, white or neutral background)",
  "Set correct minimum order quantities (MOQ) and pricing in MMK",
  "Keep inventory levels updated to avoid overselling",
  "List products in the correct category for discoverability",
  "Respond to buyer product inquiries within 24 hours",
];

const PRODUCT_DONTS = [
  "Misrepresent product quality, dimensions, or specifications",
  "Use stock photos that don't accurately represent your product",
  "List counterfeit, replica, or unauthorized branded goods",
  "Set deceptive pricing (artificially inflated before discounts)",
  "Post duplicate listings for the same product",
  "Use another seller's images without permission",
];

const PROHIBITED_CATEGORIES = [
  { name: "Counterfeit goods", detail: "Any item infringing on trademarks, patents, or copyrights" },
  { name: "Controlled substances", detail: "Drugs, pharmaceuticals requiring prescriptions, narcotics" },
  { name: "Weapons & explosives", detail: "Firearms, ammunition, knives intended as weapons, explosives" },
  { name: "Stolen property", detail: "Any item obtained through illegal means" },
  { name: "Hazardous chemicals", detail: "Chemicals that pose health or environmental risks without proper licensing" },
  { name: "Adult content", detail: "Pornographic materials or age-restricted products without proper verification" },
  { name: "Wildlife products", detail: "Products from endangered species or banned under CITES" },
  { name: "Gambling equipment", detail: "Devices primarily designed for gambling purposes" },
];

const PERFORMANCE_METRICS = [
  { label: "Order fulfillment rate", target: "≥ 95%", description: "Orders shipped within the committed timeframe" },
  { label: "On-time delivery rate", target: "≥ 90%", description: "Orders delivered by the estimated delivery date" },
  { label: "Response rate",         target: "≥ 85%", description: "Buyer messages replied to within 24 hours" },
  { label: "Minimum seller rating", target: "≥ 3.5 ★", description: "Average rating from confirmed buyers" },
  { label: "Return/dispute rate",   target: "≤ 5%",  description: "Orders resulting in a dispute or return" },
];

const SHIPPING_RULES = [
  { rule: "Ship within the committed handling time stated in your listing (default: 3 business days)" },
  { rule: "Provide a valid tracking number for all shipments above 50,000 MMK" },
  { rule: "Package items securely to prevent damage during transit" },
  { rule: "Notify buyers immediately if an order will be delayed beyond the committed date" },
  { rule: "Offer at least one standard domestic shipping option for all listings" },
  { rule: "International shipping is optional but must comply with customs regulations" },
];

const FEES = [
  { plan: "Basic",        listing: "Up to 20 products", commission: "5%",  monthly: "Free",            badge: null },
  { plan: "Professional", listing: "Up to 100 products", commission: "3%", monthly: "50,000 MMK",      badge: "Popular" },
  { plan: "Enterprise",   listing: "Unlimited",          commission: "1%", monthly: "150,000 MMK",     badge: null },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionAnchor = ({ id }) => <div id={id} className="scroll-mt-24" />;

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
      <Icon className="w-5 h-5 text-green-700" />
    </div>
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  </div>
);

const AccordionItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-gray-50 transition-colors"
    >
      <span className="font-medium text-gray-800 pr-4">{question}</span>
      <ChevronDownIcon
        className={`flex-shrink-0 w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-5 py-4 text-sm text-gray-600 bg-gray-50 border-t border-gray-100 leading-relaxed">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const SellerGuidelines = () => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const SeoComponent = useSEO({
    title: "Seller Guidelines | Pyonea Myanmar B2B Marketplace",
    description:
      "Everything you need to know to sell successfully on Pyonea — eligibility, product standards, prohibited items, performance requirements, and fees.",
    url: "/seller-guidelines",
  });

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveSection(id);
  };

  const faqs = [
    {
      q: "How long does seller verification take?",
      a: "After submitting all required documents, verification typically takes 2–5 business days. You'll receive an email notification once your account is approved or if additional information is needed.",
    },
    {
      q: "Can I sell as an individual without a registered business?",
      a: "Currently Pyonea requires at least a sole proprietorship registration. We're working on an individual seller program — sign up for updates on our pricing page.",
    },
    {
      q: "What happens if my performance metrics drop below the minimums?",
      a: "You'll first receive a warning notification with a 30-day improvement window. If metrics remain below threshold, your account may be temporarily suspended pending review. Repeated violations can result in permanent removal.",
    },
    {
      q: "Are there any upfront fees to join Pyonea?",
      a: "No. The Basic plan is completely free. Commission fees are only charged when you complete a sale. Paid plans unlock lower commission rates and more product listings.",
    },
    {
      q: "Can I list products in both English and Myanmar language?",
      a: "Yes — and we strongly encourage it. Listings with both English and Myanmar content rank higher in search results and reach more buyers.",
    },
    {
      q: "What image format and resolution is required for product photos?",
      a: "JPEG or PNG, minimum 800×800px, maximum 5MB per image. Up to 8 images per product. The primary image should have a white or neutral background.",
    },
  ];

  return (
    <>
      {SeoComponent}

      {/* ── Hero ── */}
      <div className="bg-gradient-to-br from-green-700 to-emerald-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-200 mb-3">
              For Sellers
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Seller Guidelines
            </h1>
            <p className="mt-4 text-base sm:text-lg text-green-100 max-w-2xl leading-relaxed">
              These guidelines help us maintain a trusted, high-quality
              marketplace for every buyer and seller in Myanmar. Please read
              them carefully before listing your first product.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors text-sm"
              >
                Become a Seller
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <a
                href="#eligibility"
                onClick={(e) => { e.preventDefault(); scrollTo("eligibility"); }}
                className="inline-flex items-center gap-2 border border-green-400 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                Read Guidelines
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ── Sticky sidebar nav ── */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-2">
                Contents
              </p>
              <nav className="space-y-0.5">
                {SECTIONS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      activeSection === id
                        ? "bg-green-50 text-green-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs font-semibold text-green-800 mb-1">Need help?</p>
                <p className="text-xs text-green-700 mb-3">
                  Our seller support team is available Mon–Fri, 9am–6pm.
                </p>
                <Link
                  to="/contact"
                  className="text-xs font-medium text-green-700 hover:text-green-900 underline underline-offset-2"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0 space-y-12">

            {/* ── 1. Eligibility ── */}
            <section>
              <SectionAnchor id="eligibility" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <SectionHeader
                  icon={ShieldCheckIcon}
                  title="Eligibility Requirements"
                  subtitle="You must meet all of the following before applying to sell on Pyonea."
                />
                <ul className="space-y-3">
                  {ELIGIBILITY_REQUIREMENTS.map((req, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircleSolid className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                  <strong className="font-semibold">Note:</strong> Pyonea reserves the right to
                  request additional verification documents at any time to maintain marketplace
                  integrity.
                </div>
              </div>
            </section>

            {/* ── 2. Product Standards ── */}
            <section>
              <SectionAnchor id="products" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <SectionHeader
                  icon={CubeIcon}
                  title="Product Standards"
                  subtitle="Maintaining listing quality protects buyers and keeps your store visible in search."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <CheckCircleIcon className="w-4 h-4" /> Required
                    </h3>
                    <ul className="space-y-2.5">
                      {PRODUCT_DOS.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <CheckCircleSolid className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <XCircleIcon className="w-4 h-4" /> Not Allowed
                    </h3>
                    <ul className="space-y-2.5">
                      {PRODUCT_DONTS.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                          <XCircleIcon className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 3. Pricing & Fees ── */}
            <section>
              <SectionAnchor id="pricing" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <SectionHeader
                  icon={CurrencyDollarIcon}
                  title="Pricing & Fees"
                  subtitle="No hidden charges. Commission is only collected on completed transactions."
                />
                <div className="overflow-x-auto -mx-2 px-2">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 pr-4 font-semibold text-gray-700">Plan</th>
                        <th className="text-left py-3 pr-4 font-semibold text-gray-700">Monthly Fee</th>
                        <th className="text-left py-3 pr-4 font-semibold text-gray-700">Commission</th>
                        <th className="text-left py-3 font-semibold text-gray-700">Listings</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {FEES.map(({ plan, listing, commission, monthly, badge }) => (
                        <tr key={plan} className={badge ? "bg-green-50" : ""}>
                          <td className="py-3 pr-4 font-medium text-gray-900">
                            {plan}
                            {badge && (
                              <span className="ml-2 inline-block text-[10px] font-bold uppercase tracking-wide bg-green-600 text-white px-1.5 py-0.5 rounded">
                                {badge}
                              </span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-gray-700">{monthly}</td>
                          <td className="py-3 pr-4 text-gray-700">{commission}</td>
                          <td className="py-3 text-gray-700">{listing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-4 text-xs text-gray-500">
                  * All prices in MMK. Commission is calculated on the final transaction value
                  excluding shipping costs.{" "}
                  <Link to="/pricing" className="text-green-600 underline underline-offset-2 hover:text-green-800">
                    View full pricing details →
                  </Link>
                </p>
                <div className="mt-5 p-4 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
                  <strong className="font-semibold">Payment policy:</strong> Pyonea releases seller
                  payouts every Monday for the previous week's completed orders, minus commission
                  and any outstanding dispute holds.
                </div>
              </div>
            </section>

            {/* ── 4. Shipping ── */}
            <section>
              <SectionAnchor id="shipping" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <SectionHeader
                  icon={TruckIcon}
                  title="Shipping Requirements"
                  subtitle="Reliable fulfilment is one of the most important factors in your seller rating."
                />
                <ul className="space-y-3">
                  {SHIPPING_RULES.map(({ rule }, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* ── 5. Communication ── */}
            <section>
              <SectionAnchor id="communication" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <SectionHeader
                  icon={ChatBubbleLeftRightIcon}
                  title="Communication Standards"
                  subtitle="Professional, timely communication builds trust and drives repeat business."
                />
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <p>
                    All buyer communications must remain within the Pyonea platform. Directing
                    buyers to external channels (phone, social media, third-party messaging apps)
                    before an order is placed is a violation of our seller policy.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    {[
                      { label: "First response", value: "Within 24 hrs", bg: "bg-green-50 border-green-100", text: "text-green-700", bold: "text-green-800" },
                      { label: "Order updates",  value: "Proactively",   bg: "bg-blue-50 border-blue-100",   text: "text-blue-700",  bold: "text-blue-800"  },
                      { label: "Dispute reply",  value: "Within 48 hrs", bg: "bg-amber-50 border-amber-100", text: "text-amber-700", bold: "text-amber-800" },
                    ].map(({ label, value, bg, text, bold }) => (
                      <div
                        key={label}
                        className={`rounded-lg p-4 border ${bg}`}
                      >
                        <p className={`text-xs font-semibold uppercase tracking-wide ${text} mb-1`}>
                          {label}
                        </p>
                        <p className={`text-lg font-bold ${bold}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2">
                    Messages should be polite and professional. Harassment, discriminatory
                    language, or pressure tactics towards buyers will result in immediate account
                    suspension.
                  </p>
                </div>
              </div>
            </section>

            {/* ── 6. Required Documents ── */}
            <section>
              <SectionAnchor id="documents" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <SectionHeader
                  icon={DocumentTextIcon}
                  title="Required Documents"
                  subtitle="All documents must be valid, legible, and uploaded in JPEG, PNG, or PDF format (max 5MB each)."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      title: "Business Registration Certificate",
                      detail: "Form 6 or equivalent from DICA / relevant authority",
                      required: true,
                    },
                    {
                      title: "Owner NRC / Director NRC",
                      detail: "Clear copy of both sides of the National Registration Card",
                      required: true,
                    },
                    {
                      title: "Bank Account Proof",
                      detail: "Bank statement or passbook showing your account name and number",
                      required: true,
                    },
                    {
                      title: "Tax Identification Number (TIN)",
                      detail: "Issued by the Internal Revenue Department",
                      required: true,
                    },
                    {
                      title: "Product Certification / Licenses",
                      detail: "Required for food, health, pharmaceutical or regulated products",
                      required: false,
                    },
                    {
                      title: "Import/Export License",
                      detail: "Required if selling imported goods or exporting from Myanmar",
                      required: false,
                    },
                  ].map(({ title, detail, required }) => (
                    <div
                      key={title}
                      className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50"
                    >
                      <DocumentTextIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {title}
                          {required ? (
                            <span className="ml-2 text-[10px] font-bold text-red-600 uppercase">Required</span>
                          ) : (
                            <span className="ml-2 text-[10px] font-medium text-gray-400 uppercase">If applicable</span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── 7. Prohibited Items ── */}
            <section>
              <SectionAnchor id="prohibited" />
              <div className="bg-white rounded-xl border border-red-100 shadow-sm p-6 sm:p-8">
                <SectionHeader
                  icon={ExclamationTriangleIcon}
                  title="Prohibited Items"
                  subtitle="Listing any of the following will result in immediate removal and may lead to permanent account termination."
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PROHIBITED_CATEGORIES.map(({ name, detail }) => (
                    <div
                      key={name}
                      className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 border border-red-100"
                    >
                      <XCircleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">{name}</p>
                        <p className="text-xs text-red-600 mt-0.5">{detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-xs text-gray-500">
                  This list is not exhaustive. Pyonea may remove any listing deemed harmful,
                  illegal, or inconsistent with our community standards.{" "}
                  <Link to="/contact" className="text-green-600 underline underline-offset-2 hover:text-green-800">
                    Contact us if you're unsure.
                  </Link>
                </p>
              </div>
            </section>

            {/* ── 8. Performance Standards ── */}
            <section>
              <SectionAnchor id="performance" />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <SectionHeader
                  icon={StarIcon}
                  title="Performance Standards"
                  subtitle="Pyonea monitors seller performance monthly. Staying above these thresholds keeps your store in good standing."
                />
                <div className="space-y-3">
                  {PERFORMANCE_METRICS.map(({ label, target, description }) => (
                    <div
                      key={label}
                      className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                      </div>
                      <span className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                        {target}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  <p className="font-semibold text-gray-800 mb-1">Consequence ladder</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-gray-600">
                    <li>First breach → Warning notification + 30-day improvement window</li>
                    <li>Second breach (within 90 days) → Temporary listing suspension (7 days)</li>
                    <li>Third breach (within 90 days) → Account review; potential permanent removal</li>
                  </ol>
                </div>
              </div>
            </section>

            {/* ── FAQs ── */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-5">Frequently Asked Questions</h2>
              <div className="space-y-2">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    question={faq.q}
                    answer={faq.a}
                    isOpen={openFaq === i}
                    onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  />
                ))}
              </div>
            </section>

            {/* ── CTA ── */}
            <section>
              <div className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-white text-center">
                <h2 className="text-2xl font-bold mb-2">Ready to start selling?</h2>
                <p className="text-green-100 text-sm mb-6 max-w-xl mx-auto">
                  Join thousands of Myanmar businesses on Pyonea. Create your free seller account
                  and reach buyers across the country.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors text-sm"
                  >
                    Create Seller Account
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 border border-green-300 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    Talk to Support
                  </Link>
                </div>
              </div>
            </section>

            {/* ── Last updated ── */}
            <p className="text-xs text-gray-400 text-center pb-4">
              Last updated: March 2026 · Questions?{" "}
              <Link to="/contact" className="text-green-600 hover:underline">
                Contact us
              </Link>
            </p>

          </main>
        </div>
      </div>
    </>
  );
};

export default SellerGuidelines;