// src/pages/Auth/AuthLayout.jsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
            <span className="ml-2 text-xl font-bold text-green-700">
              မြန်မာ B2B
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="text-green-600 hover:text-green-800 font-medium"
            >
              အကောင့်ဝင်ရန်
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              အကောင့်ဖွင့်ရန်
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <motion.div
        className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
          <div>
            <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-full w-12 h-12" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {title}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8" />
              <span className="ml-2 text-green-700 font-medium">
                မြန်မာ B2B Marketplace
              </span>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="#" className="text-gray-500 hover:text-green-600">
                မူဝါဒ
              </Link>
              <Link to="#" className="text-gray-500 hover:text-green-600">
                ကူညီရန်
              </Link>
              <Link to="#" className="text-gray-500 hover:text-green-600">
                အကြောင်း
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center text-sm text-gray-500">
            © 2023 မြန်မာ B2B Marketplace. အခွင့်အရေးအားလုံးကို
            ခြွင်းချက်ထားသည်။
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
