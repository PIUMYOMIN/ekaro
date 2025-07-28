// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import CategoryBrowser from "./pages/CategoryBrowser";
// import CategoryDetail from "./pages/CategoryDetail";
import ProductComparison from "./pages/ProductComparison";
import StorefrontView from "./pages/StoreFrontView";
import ProductCard from "./components/ui/ProductCard";
import SellerDashboard from "./pages/SellerDashboard";
import Sellers from "./pages/Sellers";
import SellerProfile from "./pages/SellerProfile";
import BuyerDashboard from "./pages/BuyerDashboard";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import AdminDashboard from "./pages/Admin/Dashboard";
import PaymentMethod from './components/ui/PaymentMethod';
import OrderConfirmation from './components/ui/OrderConfirmation';
import RFQManager from './pages/RFQManager';
import Pricing from './pages/Pricing';
import AboutUs from './pages/AboutUs';
import Legal from './pages/Legal';
import HelpCenter from './pages/HelpCenter';
import BulkOrderTool from './pages/BulkOrderTool';
import OrderTracking from "./pages/OrderTracking";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<ProductList />} />
                  <Route path="/products/:category" element={<ProductList />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/categories" element={<CategoryBrowser />} />
                  {/* <Route path="/category/:id" element={<CategoryDetail />} /> */}
                  <Route path="/storefront/:id" element={<StorefrontView />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/seller" element={<SellerDashboard />} />
                  <Route path="/sellers" element={<Sellers />} />
                  <Route path="/seller/:id" element={<SellerProfile />} />
                  <Route path="/buyer" element={<BuyerDashboard />} />
                  <Route path="/rfqmanager" element={<RFQManager />} />
                  <Route path="/product-comparison" element={<ProductComparison />} />
                  <Route path="/order-tool" element={<BulkOrderTool />} />
                  <Route path="/order-tracking" element={<OrderTracking />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment" element={<PaymentMethod />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/terms" element={<Legal />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
