import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useSEO from "../hooks/useSEO";
import {
  TruckIcon,
  ClockIcon,
  MapPinIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  PhoneIcon,
  CheckCircleIcon,
  XCircleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon as CheckCircleSolid } from "@heroicons/react/24/solid";

// ─── Data ─────────────────────────────────────────────────────────────────────

const DOMESTIC_ZONES = [
  {
    zone: "Yangon (City)",
    areas: "All Yangon townships",
    standard: "1–2 business days",
    express: "Same day / Next day",
    freight: "On request",
  },
  {
    zone: "Yangon (Outskirts)",
    areas: "Hlegu, Hmawbi, Taikkyi, Thanlyin",
    standard: "2–3 business days",
    express: "Next day",
    freight: "On request",
  },
  {
    zone: "Mandalay Region",
    areas: "Mandalay, Pyin Oo Lwin, Meiktila",
    standard: "3–5 business days",
    express: "2–3 business days",
    freight: "On request",
  },
  {
    zone: "Other Major Cities",
    areas: "Naypyidaw, Bago, Mawlamyine, Pathein",
    standard: "4–6 business days",
    express: "2–4 business days",
    freight: "On request",
  },
  {
    zone: "Remote Areas",
    areas: "Kachin, Kayah, Kayin, Chin, Mon, Rakhine, Shan states",
    standard: "6–10 business days",
    express: "Not available",
    freight: "On request",
  },
];

const SHIPPING_METHODS = [
  {
    icon: TruckIcon,
    name: "Standard Shipping",
    desc: "The default option for most orders. Reliable door-to-door delivery via Myanmar's major logistics networks.",
    details: ["Available nationwide", "Tracking number provided for orders over 50,000 MMK", "Cost calculated by weight and destination at checkout"],
    color: "blue",
  },
  {
    icon: ClockIcon,
    name: "Express Shipping",
    desc: "Faster delivery for time-sensitive orders. Available in Yangon and selected major cities.",
    details: ["Same-day delivery available within Yangon for orders placed before 12 PM", "Next-day delivery to Mandalay", "Higher shipping cost applies"],
    color: "green",
  },
  {
    icon: CubeIcon,
    name: "Freight / Bulk Shipping",
    desc: "For large, heavy, or palletised orders where standard parcel services aren't suitable.",
    details: ["Available for orders over 50 kg or oversized items", "Quote-based — contact the seller or our support team", "Delivery time negotiated based on order size and location"],
    color: "purple",
  },
  {
    icon: GlobeAltIcon,
    name: "International Shipping",
    desc: "Optional for sellers. Not all sellers ship internationally — check the product listing for availability.",
    details: ["Subject to Myanmar export regulations and destination customs", "Buyer is responsible for import duties and taxes", "Delivery times vary widely by destination country"],
    color: "amber",
  },
];

const PACKAGING_RULES = [
  "Use appropriate box or packaging material for the product type and weight",
  "Fill empty space with padding (bubble wrap, foam, paper) to prevent movement",
  "Seal all seams and edges with strong packing tape",
  "Fragile items must be double-boxed with at least 5 cm of cushioning on all sides",
  "Label the outer package clearly with the recipient's name, address, and contact number",
  "Include a packing slip inside the package with order details",
];

const LOST_STEPS = [
  { step: "Report within 7 days", desc: "Contact the seller via the order page within 7 days of the estimated delivery date." },
  { step: "Seller investigation", desc: "The seller has 48 hours to investigate with their courier and provide an update." },
  { step: "Pyonea mediation", desc: "If unresolved, raise a dispute and Pyonea's support team will mediate." },
  { step: "Resolution", desc: "Eligible claims receive a full refund or replacement shipment within 5–7 business days." },
];

const FAQS = [
  {
    q: "Can I choose my own courier?",
    a: "Buyers cannot choose a specific courier — that is determined by the seller. If you have a strong preference, contact the seller before placing your order to discuss options.",
  },
  {
    q: "What if the seller hasn't shipped my order within the stated handling time?",
    a: "Contact the seller through the order page. If there's no response within 24 hours, you can raise a dispute and Pyonea support will step in to assist.",
  },
  {
    q: "Do shipping costs include insurance?",
    a: "Basic coverage is included for shipments via most courier partners. For high-value goods, sellers may offer additional insurance — check the listing or contact the seller.",
  },
  {
    q: "Can I change my shipping address after placing an order?",
    a: "Address changes are only possible before the seller ships the order. Contact the seller immediately through the order page. Once shipped, the address cannot be changed.",
  },
  {
    q: "Why does my tracking number not show any updates?",
    a: "It can take up to 24 hours for a new tracking number to appear in the courier's system. If there's no update after 48 hours, contact the seller to verify the tracking number is correct.",
  },
  {
    q: "Are public holidays counted in delivery estimates?",
    a: "No. All delivery time estimates are in business days (Monday–Saturday, excluding Myanmar public holidays). Orders placed on public holidays begin processing on the next business day.",
  },
];

const colorMap = {
  blue:   { bg: "bg-blue-50 dark:bg-blue-900/20",   border: "border-blue-100 dark:border-blue-800",   icon: "text-blue-600 dark:text-blue-400",   title: "text-blue-800 dark:text-blue-200"   },
  green:  { bg: "bg-green-50 dark:bg-green-900/20",  border: "border-green-100 dark:border-green-800",  icon: "text-green-600 dark:text-green-400",  title: "text-green-800 dark:text-green-200"  },
  purple: { bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-100 dark:border-purple-800", icon: "text-purple-600 dark:text-purple-400", title: "text-purple-800 dark:text-purple-200" },
  amber:  { bg: "bg-amber-50 dark:bg-amber-900/20",  border: "border-amber-100 dark:border-amber-800",  icon: "text-amber-600 dark:text-amber-400",  title: "text-amber-800 dark:text-amber-200"  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionCard = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 ${className}`}>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
      <Icon className="w-5 h-5 text-green-700 dark:text-green-400" />
    </div>
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>}
    </div>
  </div>
);

const AccordionItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
    >
      <span className="font-medium text-gray-800 dark:text-slate-100 pr-4 text-sm sm:text-base">{question}</span>
      <ChevronDownIcon
        className={`flex-shrink-0 w-5 h-5 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
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
          <div className="px-5 py-4 text-sm text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700 leading-relaxed">
            {answer}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const ShippingInfo = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const SeoComponent = useSEO({
    title: "Shipping Information | Pyonea Myanmar B2B Marketplace",
    description:
      "Everything you need to know about shipping on Pyonea — delivery zones, estimated times, packaging requirements, and how to handle lost or damaged shipments.",
    url: "/shipping",
  });

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
              Shipping
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Shipping Information
            </h1>
            <p className="mt-4 text-base sm:text-lg text-green-100 max-w-2xl leading-relaxed">
              Learn how orders are shipped on Pyonea — from handling times and
              delivery zones to packaging standards and what to do if something
              goes wrong.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/track-order"
                className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors text-sm"
              >
                Track Your Order
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-green-400 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                Contact Support
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Handling time", value: "≤ 3 days", sub: "Standard commitment", color: "text-green-600 dark:text-green-400" },
            { label: "Tracking provided", value: "> 50K MMK", sub: "All qualifying orders", color: "text-blue-600 dark:text-blue-400" },
            { label: "Nationwide delivery", value: "All states", sub: "Domestic coverage", color: "text-purple-600 dark:text-purple-400" },
            { label: "Dispute window", value: "7 days", sub: "After delivery date", color: "text-amber-600 dark:text-amber-400" },
          ].map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-5 text-center"
            >
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-1">{label}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Shipping methods ── */}
        <section>
          <SectionCard>
            <SectionHeader
              icon={TruckIcon}
              title="Shipping Methods"
              subtitle="Sellers choose which methods to offer. Available options are shown at checkout."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {SHIPPING_METHODS.map(({ icon: Icon, name, desc, details, color }) => {
                const c = colorMap[color];
                return (
                  <div
                    key={name}
                    className={`rounded-xl border p-5 ${c.bg} ${c.border}`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Icon className={`w-6 h-6 flex-shrink-0 ${c.icon}`} />
                      <h3 className={`font-semibold text-sm ${c.title}`}>{name}</h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 mb-3 leading-relaxed">{desc}</p>
                    <ul className="space-y-1.5">
                      {details.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-slate-400">
                          <CheckCircleSolid className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </section>

        {/* ── Delivery zones & times ── */}
        <section>
          <SectionCard>
            <SectionHeader
              icon={MapPinIcon}
              title="Delivery Zones & Estimated Times"
              subtitle="Times are in business days after dispatch. Actual delivery may vary by courier and conditions."
            />
            <div className="overflow-x-auto -mx-2 px-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-600">
                    <th className="text-left py-3 pr-4 font-semibold text-gray-700 dark:text-slate-300 min-w-[140px]">Zone</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-700 dark:text-slate-300 min-w-[180px]">Coverage Areas</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-700 dark:text-slate-300">Standard</th>
                    <th className="text-left py-3 pr-4 font-semibold text-gray-700 dark:text-slate-300">Express</th>
                    <th className="text-left py-3 font-semibold text-gray-700 dark:text-slate-300">Freight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {DOMESTIC_ZONES.map(({ zone, areas, standard, express, freight }) => (
                    <tr key={zone} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-slate-100">{zone}</td>
                      <td className="py-3 pr-4 text-gray-500 dark:text-slate-400 text-xs">{areas}</td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 text-xs font-medium">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          {standard}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {express === "Not available" ? (
                          <span className="inline-flex items-center gap-1 text-gray-400 dark:text-slate-500 text-xs">
                            <XCircleIcon className="w-3.5 h-3.5" />
                            Not available
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-blue-700 dark:text-blue-400 text-xs font-medium">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            {express}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-gray-500 dark:text-slate-400 text-xs">{freight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-slate-500">
              * Business days are Monday–Saturday, excluding Myanmar public holidays. Orders placed
              after 3 PM are processed the following business day.
            </p>
          </SectionCard>
        </section>

        {/* ── Handling time ── */}
        <section>
          <SectionCard>
            <SectionHeader
              icon={ClockIcon}
              title="Handling Time"
              subtitle="The time a seller takes to prepare and dispatch your order after payment is confirmed."
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Standard handling", value: "1–3 business days", desc: "Default for all sellers", bg: "bg-green-50 dark:bg-green-900/20", border: "border-green-100 dark:border-green-800", val: "text-green-800 dark:text-green-200" },
                { label: "Express handling", value: "Same day / Next day", desc: "Where offered by seller", bg: "bg-blue-50 dark:bg-blue-900/20", border: "border-blue-100 dark:border-blue-800", val: "text-blue-800 dark:text-blue-200" },
                { label: "Bulk / Freight",   value: "3–7 business days", desc: "For large or custom orders", bg: "bg-purple-50 dark:bg-purple-900/20", border: "border-purple-100 dark:border-purple-800", val: "text-purple-800 dark:text-purple-200" },
              ].map(({ label, value, desc, bg, border, val }) => (
                <div key={label} className={`rounded-xl border p-4 ${bg} ${border}`}>
                  <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                  <p className={`text-base font-bold ${val}`}>{value}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
              ))}
            </div>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg text-sm text-amber-800 dark:text-amber-300">
              <strong className="font-semibold">Seller obligation:</strong> Sellers must ship within
              the handling time stated on their listing. If an order cannot be dispatched on time,
              the seller must notify the buyer immediately. Failure to do so may affect their
              performance rating.
            </div>
          </SectionCard>
        </section>

        {/* ── Packaging standards ── */}
        <section>
          <SectionCard>
            <SectionHeader
              icon={CubeIcon}
              title="Packaging Standards"
              subtitle="All sellers on Pyonea must meet these minimum packaging requirements."
            />
            <ul className="space-y-3">
              {PACKAGING_RULES.map((rule, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="text-sm text-gray-700 dark:text-slate-300">{rule}</span>
                </li>
              ))}
            </ul>
            <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-sm text-blue-800 dark:text-blue-300">
              <strong className="font-semibold">Note for buyers:</strong> If your order arrives with
              visibly damaged packaging, photograph it before opening and report it within 48 hours
              via the order page.
            </div>
          </SectionCard>
        </section>

        {/* ── Lost / damaged ── */}
        <section>
          <SectionCard>
            <SectionHeader
              icon={ExclamationTriangleIcon}
              title="Lost or Damaged Shipments"
              subtitle="Follow these steps if your order doesn't arrive or arrives in poor condition."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {LOST_STEPS.map(({ step, desc }, i) => (
                <div key={step} className="relative">
                  <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600 h-full">
                    <span className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-bold flex items-center justify-center mb-3 flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-1">{step}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleSolid className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200">Eligible for refund/replacement</p>
                </div>
                <ul className="space-y-1 text-xs text-green-700 dark:text-green-300">
                  <li>Order not delivered within 7 days of estimated date</li>
                  <li>Items arrived visibly damaged or broken</li>
                  <li>Wrong item received</li>
                  <li>Significant quantity shortage</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <XCircleIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200">Not eligible</p>
                </div>
                <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                  <li>Reported more than 7 days after estimated delivery</li>
                  <li>Buyer-caused damage after receipt</li>
                  <li>Delays due to incorrect address provided by buyer</li>
                  <li>Delays from customs (international orders)</li>
                </ul>
              </div>
            </div>
          </SectionCard>
        </section>

        {/* ── Seller responsibilities ── */}
        <section>
          <SectionCard>
            <SectionHeader
              icon={ShieldCheckIcon}
              title="Seller Shipping Responsibilities"
              subtitle="Sellers on Pyonea are accountable for the following."
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Ship within the committed handling time stated on the listing",
                "Provide a valid tracking number for all orders over 50,000 MMK",
                "Notify the buyer immediately if the order will be delayed",
                "Package all items safely to prevent transit damage",
                "Offer at least one standard domestic shipping option",
                "Respond to buyer shipping queries within 24 hours",
                "Honor the delivery estimates shown at checkout",
                "Comply with all applicable courier and customs regulations",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600">
                  <CheckCircleSolid className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 dark:text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </SectionCard>
        </section>

        {/* ── FAQs ── */}
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-5">
            Shipping FAQs
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
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
          <div className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <TruckIcon className="w-10 h-10 flex-shrink-0 text-green-200" />
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-1">Need help with a shipment?</h3>
                <p className="text-green-100 text-sm">
                  Our support team is available Monday to Friday, 9 AM – 6 PM (Myanmar Standard Time).
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors text-sm"
                >
                  Contact Support
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
                <Link
                  to="/track-order"
                  className="inline-flex items-center gap-2 border border-green-300 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors text-sm"
                >
                  Track Order
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Related links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Return Policy",      to: "/return-policy",      desc: "How to return items and get refunds" },
            { label: "Seller Guidelines",  to: "/seller-guidelines",  desc: "Shipping rules for sellers" },
            { label: "FAQ",                to: "/faq",                 desc: "More common questions answered" },
          ].map(({ label, to, desc }) => (
            <Link
              key={to}
              to={to}
              className="group p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-green-400 dark:hover:border-green-600 transition-colors"
            >
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 group-hover:text-green-700 dark:group-hover:text-green-400 transition-colors">
                {label}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{desc}</p>
            </Link>
          ))}
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500 text-center pb-2">
          Last updated: April 2026 ·{" "}
          <Link to="/contact" className="text-green-600 dark:text-green-400 hover:underline">
            Contact us
          </Link>{" "}
          if you have questions not covered here.
        </p>

      </div>
    </>
  );
};

export default ShippingInfo;
