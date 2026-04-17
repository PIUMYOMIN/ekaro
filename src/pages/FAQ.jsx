import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useSEO from "../hooks/useSEO";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  BuildingStorefrontIcon,
  CreditCardIcon,
  TruckIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: "general",  label: "General",       icon: QuestionMarkCircleIcon },
  { id: "buying",   label: "Buying",         icon: ShoppingBagIcon },
  { id: "selling",  label: "Selling",        icon: BuildingStorefrontIcon },
  { id: "payments", label: "Payments",       icon: CreditCardIcon },
  { id: "shipping", label: "Shipping",       icon: TruckIcon },
  { id: "account",  label: "My Account",     icon: UserCircleIcon },
];

const ALL_FAQS = [
  // General
  {
    category: "general",
    q: "What is Pyonea?",
    a: "Pyonea is Myanmar's B2B wholesale marketplace connecting verified sellers with business buyers. We enable bulk purchasing, Request for Quotation (RFQ), and direct seller-to-buyer communication — all in one platform.",
  },
  {
    category: "general",
    q: "Who can use Pyonea?",
    a: "Pyonea is open to registered businesses in Myanmar. Buyers (retailers, resellers, businesses) can browse and purchase freely. Sellers must complete a verification process before listing products.",
  },
  {
    category: "general",
    q: "Is Pyonea free to use?",
    a: "Browsing and buying on Pyonea is completely free. Sellers can list up to 20 products at no cost on the Basic plan. Paid plans offer lower commission rates and higher listing limits. See our Pricing page for details.",
  },
  {
    category: "general",
    q: "What languages does Pyonea support?",
    a: "Pyonea supports English and Myanmar (Burmese). You can switch languages at any time using the language selector in the header. Sellers are encouraged to list products in both languages for maximum reach.",
  },
  {
    category: "general",
    q: "How do I contact Pyonea support?",
    a: "You can reach our support team via the Contact page, by email at contact@pyonea.com, or by phone at +95 979 211 5547. Support is available Monday to Friday, 9 AM – 6 PM (Myanmar Standard Time).",
  },

  // Buying
  {
    category: "buying",
    q: "Do I need an account to browse products?",
    a: "No. You can browse all products and seller profiles without an account. However, you'll need to register to place orders, submit RFQs, or contact sellers.",
  },
  {
    category: "buying",
    q: "What is a Minimum Order Quantity (MOQ)?",
    a: "MOQ is the smallest quantity a seller is willing to sell in a single order. Each product listing shows its MOQ. If you need a quantity below the listed MOQ, you can contact the seller directly to negotiate.",
  },
  {
    category: "buying",
    q: "What is an RFQ?",
    a: "RFQ stands for Request for Quotation. It allows you to request a custom price from one or more sellers for a specific product and quantity. Sellers respond with a quote, and you can accept, negotiate, or decline.",
  },
  {
    category: "buying",
    q: "Can I compare products from different sellers?",
    a: "Yes. Use the Product Comparison tool to compare up to four products side by side — including pricing, specifications, MOQ, and seller ratings.",
  },
  {
    category: "buying",
    q: "How do I track my order?",
    a: "Once your order is shipped, you'll receive a tracking number by email and in your buyer dashboard. You can also use the Track Your Order page with your order ID.",
  },
  {
    category: "buying",
    q: "Can I cancel or modify an order after placing it?",
    a: "You can request a cancellation before the seller ships the order. Once shipped, cancellations are subject to the seller's return policy. Contact the seller through the order page as soon as possible.",
  },

  // Selling
  {
    category: "selling",
    q: "How do I become a seller on Pyonea?",
    a: "Click 'Become a Seller' and complete the registration form. You'll need to provide your business registration certificate, owner NRC, bank account proof, and TIN. Verification typically takes 2–5 business days.",
  },
  {
    category: "selling",
    q: "What types of businesses can sell on Pyonea?",
    a: "Any Myanmar-registered business — including LLCs, sole proprietorships, and partnerships — can apply to sell. Individual sellers without business registration are not currently supported, though an individual seller program is in development.",
  },
  {
    category: "selling",
    q: "How many products can I list?",
    a: "The Basic plan (free) allows up to 20 active product listings. The Professional plan (50,000 MMK/month) allows up to 100 listings. The Enterprise plan (150,000 MMK/month) offers unlimited listings.",
  },
  {
    category: "selling",
    q: "Are there prohibited products on Pyonea?",
    a: "Yes. Counterfeit goods, controlled substances, weapons, stolen property, hazardous chemicals, adult content, wildlife products, and gambling equipment are prohibited. See the Seller Guidelines for the full list.",
  },
  {
    category: "selling",
    q: "How do I handle a buyer dispute?",
    a: "When a dispute is raised, you'll receive a notification and have 48 hours to respond via the platform. Pyonea's support team will mediate if an agreement cannot be reached. Prompt, professional responses are important for your seller rating.",
  },
  {
    category: "selling",
    q: "What performance standards must I maintain?",
    a: "Sellers must maintain: ≥95% order fulfillment rate, ≥90% on-time delivery, ≥85% response rate, ≥3.5 star average rating, and ≤5% return/dispute rate. Falling below thresholds triggers warnings and may lead to suspension.",
  },

  // Payments
  {
    category: "payments",
    q: "What payment methods are accepted?",
    a: "Pyonea accepts major Myanmar payment methods including KBZ Pay, Wave Money, AYA Pay, and bank transfer. Credit/debit card payments are available for select buyers. Payment options may vary by seller.",
  },
  {
    category: "payments",
    q: "When do sellers receive their payouts?",
    a: "Seller payouts are processed every Monday for the previous week's completed orders, minus commission fees and any outstanding dispute holds. Payments are sent directly to your registered bank account.",
  },
  {
    category: "payments",
    q: "How is commission calculated?",
    a: "Commission is a percentage of the final transaction value excluding shipping costs. Rates are 5% (Basic), 3% (Professional), and 1% (Enterprise). Commission is only charged on completed, confirmed transactions.",
  },
  {
    category: "payments",
    q: "Is it safe to pay on Pyonea?",
    a: "Yes. Pyonea uses secure payment processing and does not store your full payment details. Transactions are protected and funds are held in escrow until the buyer confirms receipt of their order.",
  },
  {
    category: "payments",
    q: "What happens if my payment fails?",
    a: "If a payment fails, your order will not be confirmed and no charge will be made. You can retry with a different payment method from your cart. Contact support if the issue persists.",
  },

  // Shipping
  {
    category: "shipping",
    q: "Who handles shipping on Pyonea?",
    a: "Shipping is handled by the individual seller. Each seller sets their own shipping rates, carriers, and handling time. Shipping options and costs are displayed on the product and checkout pages.",
  },
  {
    category: "shipping",
    q: "How long does delivery take?",
    a: "Delivery times vary by seller and destination. Most sellers ship within 3 business days. Estimated delivery dates are shown on each listing and in your order confirmation. Domestic deliveries typically take 2–7 business days.",
  },
  {
    category: "shipping",
    q: "Do sellers ship internationally?",
    a: "International shipping is optional for sellers. If a seller offers international shipping, it will be listed as a shipping option at checkout. All international shipments must comply with Myanmar customs regulations.",
  },
  {
    category: "shipping",
    q: "What if my order arrives damaged?",
    a: "Take photos of the damage immediately and report the issue through the order page within 48 hours of delivery. Pyonea will mediate with the seller to arrange a replacement or refund according to the return policy.",
  },
  {
    category: "shipping",
    q: "Can I get a tracking number for my order?",
    a: "Yes. Sellers are required to provide a tracking number for all shipments valued above 50,000 MMK. Tracking information will appear in your order details once the seller ships.",
  },

  // Account
  {
    category: "account",
    q: "How do I change my password?",
    a: "Go to your dashboard, then navigate to 'My Profile' or 'Settings'. You'll find a Change Password section where you can update your password. You'll need your current password to make the change.",
  },
  {
    category: "account",
    q: "How do I update my email address?",
    a: "Email changes require identity verification. Contact our support team at contact@pyonea.com with your account details and proof of identity to request an email update.",
  },
  {
    category: "account",
    q: "Can I have both a buyer and seller account?",
    a: "Each account has a single role — buyer, seller, or admin. If you need to both buy and sell, you'll need to use separate accounts with different email addresses.",
  },
  {
    category: "account",
    q: "How do I delete my account?",
    a: "To request account deletion, contact our support team. Note that accounts with pending orders or active disputes cannot be deleted until those are resolved. Seller accounts with transaction history may be retained for compliance purposes.",
  },
  {
    category: "account",
    q: "I forgot my password. What should I do?",
    a: "Click 'Forgot Password' on the login page and enter your registered email address. You'll receive a password reset link within a few minutes. Check your spam folder if you don't see it.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const AccordionItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-4 text-left bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
    >
      <span className="font-medium text-gray-800 dark:text-slate-100 pr-4 text-sm sm:text-base">
        {question}
      </span>
      <ChevronDownIcon
        className={`flex-shrink-0 w-5 h-5 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
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

// ─── Main component ───────────────────────────────────────────────────────────

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("general");
  const [openItem, setOpenItem] = useState(null);
  const [search, setSearch] = useState("");

  const SeoComponent = useSEO({
    title: "FAQ | Pyonea Myanmar B2B Marketplace",
    description:
      "Frequently asked questions about buying, selling, payments, shipping, and accounts on Pyonea — Myanmar's leading B2B wholesale marketplace.",
    url: "/faq",
  });

  const filteredFaqs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (q) {
      return ALL_FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(q) ||
          f.a.toLowerCase().includes(q)
      );
    }
    return ALL_FAQS.filter((f) => f.category === activeCategory);
  }, [search, activeCategory]);

  const handleSearch = (val) => {
    setSearch(val);
    setOpenItem(null);
  };

  const handleCategory = (id) => {
    setActiveCategory(id);
    setSearch("");
    setOpenItem(null);
  };

  const isSearching = search.trim().length > 0;

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
            className="max-w-2xl"
          >
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-green-200 mb-3">
              Help Center
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 text-base sm:text-lg text-green-100 max-w-xl leading-relaxed">
              Find answers to the most common questions about buying, selling,
              payments, and more on Pyonea.
            </p>

            {/* Search */}
            <div className="mt-8 relative max-w-lg">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-300 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions…"
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/15 backdrop-blur border border-white/30 text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ── Sidebar ── */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <div className="sticky top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3 px-2">
                Categories
              </p>
              <nav className="space-y-0.5">
                {CATEGORIES.map(({ id, label, icon: Icon }) => {
                  const count = ALL_FAQS.filter((f) => f.category === id).length;
                  return (
                    <button
                      key={id}
                      onClick={() => handleCategory(id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        !isSearching && activeCategory === id
                          ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium"
                          : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-slate-200"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {label}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">{count}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                <p className="text-xs font-semibold text-green-800 dark:text-green-300 mb-1">
                  Still need help?
                </p>
                <p className="text-xs text-green-700 dark:text-green-400 mb-3">
                  Our support team is available Mon–Fri, 9am–6pm.
                </p>
                <Link
                  to="/contact"
                  className="text-xs font-medium text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 underline underline-offset-2"
                >
                  Contact Support →
                </Link>
              </div>
            </div>
          </aside>

          {/* ── Mobile category tabs ── */}
          <div className="lg:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => handleCategory(id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    !isSearching && activeCategory === id
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600 hover:border-green-400 dark:hover:border-green-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── FAQ list ── */}
          <main className="flex-1 min-w-0">
            {/* Section heading */}
            {!isSearching && (
              <div className="mb-6">
                {CATEGORIES.filter((c) => c.id === activeCategory).map(
                  ({ label, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-green-700 dark:text-green-400" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">
                          {label}
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {filteredFaqs.length} question{filteredFaqs.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* Search results header */}
            {isSearching && (
              <div className="mb-5 flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  {filteredFaqs.length === 0
                    ? "No results found"
                    : `${filteredFaqs.length} result${filteredFaqs.length !== 1 ? "s" : ""} for "${search}"`}
                </p>
                <button
                  onClick={() => handleSearch("")}
                  className="text-xs text-green-600 dark:text-green-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Items */}
            {filteredFaqs.length > 0 ? (
              <div className="space-y-2">
                {filteredFaqs.map((faq, i) => (
                  <AccordionItem
                    key={`${faq.category}-${i}`}
                    question={faq.q}
                    answer={faq.a}
                    isOpen={openItem === i}
                    onToggle={() => setOpenItem(openItem === i ? null : i)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <QuestionMarkCircleIcon className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-slate-400 font-medium">No questions found</p>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                  Try a different search term or browse a category.
                </p>
              </div>
            )}

            {/* ── CTA ── */}
            <div className="mt-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-700 p-8 text-white">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <ChatBubbleLeftRightIcon className="w-10 h-10 flex-shrink-0 text-green-200" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-1">Couldn't find what you're looking for?</h3>
                  <p className="text-green-100 text-sm">
                    Our support team is here to help. Reach out and we'll get
                    back to you as quickly as possible.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-green-50 transition-colors text-sm"
                  >
                    Contact Us
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/help"
                    className="inline-flex items-center gap-2 border border-green-300 text-white font-medium px-5 py-2.5 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    Help Center
                  </Link>
                </div>
              </div>
            </div>

            {/* Related links */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Seller Guidelines", to: "/seller-guidelines", desc: "Rules and standards for sellers" },
                { label: "Return Policy",     to: "/return-policy",     desc: "How returns and refunds work" },
                { label: "Pricing & Plans",   to: "/pricing",           desc: "Compare seller subscription plans" },
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

            <p className="text-xs text-gray-400 dark:text-slate-500 text-center mt-10 pb-2">
              Last updated: April 2026 ·{" "}
              <Link to="/contact" className="text-green-600 dark:text-green-400 hover:underline">
                Suggest a question
              </Link>
            </p>
          </main>
        </div>
      </div>
    </>
  );
};

export default FAQ;
