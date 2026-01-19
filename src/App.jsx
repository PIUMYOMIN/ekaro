import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";

// Layout
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";

// Public Pages
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import CategoryBrowser from "./pages/CategoryBrowser";
import Sellers from "./pages/Sellers";
import SellerProfile from "./pages/SellerProfile";
import ProductComparison from "./pages/ProductComparison";
import BulkOrderTool from "./pages/BulkOrderTool";
import OrderTracking from "./pages/OrderTracking";
import Pricing from "./pages/Pricing";
import AboutUs from "./pages/AboutUs";
import Legal from "./pages/Legal";
import HelpCenter from "./pages/HelpCenter";

// Auth Pages
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

// Protected Pages
import BuyerDashboard from "./pages/BuyerDashboard";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import SellerDashboard from "./pages/Seller/SellerDashboard";
import AdminDashboard from "./pages/Admin/Dashboard";

// Admin Management
import CategoryCreate from "./pages/Admin/categories/CategoryCreate";
import CategoryEdit from "./pages/Admin/categories/CategoryEdit";

// Seller Product Management
import ProductCreate from "./pages/Seller/products/ProductCreate";
import ProductEdit from "./pages/Seller/products/ProductEdit";
import ProductView from "./pages/Seller/products/ProductView";

import StoreBasicInfo from "./pages/Seller/StoreBasicInfo";
import BusinessDetails from "./pages/Seller/BusinessDetails";
import AddressInfo from "./pages/Seller/AddressInfo";

// Common Components
import PaymentMethod from "./components/ui/PaymentMethod";
import OrderConfirmation from "./components/ui/OrderConfirmation";
import RFQManager from "./pages/RFQManager";

// Route Guards
import ProtectedRoute from "./components/ProtectedRoute";
import GuestRoute from "./components/GuestRoute";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import DocumentUpload from './pages/Seller/DocumentUpload';
import ReviewSubmit from "./pages/Seller/ReviewSubmit";
import StepGuard from "./components/StepGuard";
import Error from "./pages/Errors/404";
import SellerRouteGuard from "./components/SellerRouteGuard";

function App() {
  return <I18nextProvider i18n={i18n}>
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/categories" element={<CategoryBrowser />} />
                <Route path="/sellers" element={<Sellers />} />
                <Route path="/sellers/:id" element={<SellerProfile />} />
                <Route path="/product-comparison" element={<ProductComparison />} />
                <Route path="/bulk-order-tool" element={<BulkOrderTool />} />
                <Route path="/order-tracking" element={<OrderTracking />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/terms" element={<Legal />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/legal" element={<Legal />} />
                <Route path="/privacy-policy" element={<Legal />} />
                <Route path="/page-not-found" element={<Error />} />

                {/* Guest-only Routes */}
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

                {/* Seller Onboarding Routes */}
                <Route path="/seller/onboarding/store-basic" element={
                  <StepGuard step="store-basic">
                    <StoreBasicInfo />
                  </StepGuard>
                } />
                <Route path="/seller/onboarding/business-details" element={
                  <StepGuard step="business-details">
                    <BusinessDetails />
                  </StepGuard>
                } />
                <Route path="/seller/onboarding/address" element={
                  <StepGuard step="address">
                    <AddressInfo />
                  </StepGuard>
                } />
                <Route path="/seller/onboarding/documents" element={
                  <StepGuard step="documents">
                    <DocumentUpload />
                  </StepGuard>
                } />
                <Route path="/seller/onboarding/review-submit" element={
                  <StepGuard step="review">
                    <ReviewSubmit />
                  </StepGuard>
                } />

                {/* Buyer Routes */}
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/payment" element={<ProtectedRoute roles={["buyer"]}><PaymentMethod /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute roles={["buyer"]}><Checkout /></ProtectedRoute>} />
                <Route path="/buyer" element={<ProtectedRoute roles={["buyer"]}><BuyerDashboard /></ProtectedRoute>} />
                <Route path="/buyer/dashboard" element={<ProtectedRoute roles={["buyer"]}><BuyerDashboard /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

                {/* Seller Routes */}
                {/* <Route path="/seller" element={<ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>} /> */}
                <Route path="/seller" element={
                  <ProtectedRoute roles={["seller"]}>
                    <SellerRouteGuard>
                      <SellerDashboard />
                    </SellerRouteGuard>
                  </ProtectedRoute>
                } />
                {/* <Route path="/seller/dashboard" element={<ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>} /> */}
                <Route path="/seller/dashboard" element={
                  <ProtectedRoute roles={["seller"]}>
                    <SellerRouteGuard>
                      <SellerDashboard />
                    </SellerRouteGuard>
                  </ProtectedRoute>
                } />
                <Route path="/seller/products" element={<ProtectedRoute roles={["seller"]}><ProductView /></ProtectedRoute>} />
                <Route path="/seller/products/create" element={<ProtectedRoute roles={["seller"]}><ProductCreate /></ProtectedRoute>} />
                <Route path="/seller/products/:id/edit" element={<ProtectedRoute roles={["seller"]}><ProductEdit /></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/dashboard" element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/categories/create" element={<ProtectedRoute roles={["admin"]}><CategoryCreate /></ProtectedRoute>} />
                <Route path="/admin/categories/:id/edit" element={<ProtectedRoute roles={["admin"]}><CategoryEdit /></ProtectedRoute>} />

                {/* Shared Routes */}
                <Route path="/products/create" element={<ProtectedRoute roles={["seller", "admin"]}><ProductCreate /></ProtectedRoute>} />
                <Route path="/products/:id/edit" element={<ProtectedRoute roles={["seller", "admin"]}><ProductEdit /></ProtectedRoute>} />
                <Route path="/rfqmanager" element={<ProtectedRoute roles={["buyer", "seller", "admin"]}><RFQManager /></ProtectedRoute>} />
                <Route path="/payment-method" element={<ProtectedRoute roles={["buyer", "seller", "admin"]}><PaymentMethod /></ProtectedRoute>} />
                <Route path="/order-confirmation" element={<ProtectedRoute roles={["buyer", "seller", "admin"]}><OrderConfirmation /></ProtectedRoute>} />
                <Route path="/order-tracking/:orderId" element={<ProtectedRoute><OrderTrackingPage /></ProtectedRoute>} />

                {/* Catch-all route for 404 */}
                <Route path="*" element={<Error />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  </I18nextProvider>;
}

export default App;
