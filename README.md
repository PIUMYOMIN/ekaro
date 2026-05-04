# Pyonea Frontend (React + Vite)

This is the frontend SPA for the Pyonea B2B marketplace. It supports three main roles:

- Buyer: browsing, cart, checkout, RFQ, orders, wishlist
- Seller: onboarding, product management, delivery zones, order operations
- Admin: moderation, analytics, seller verification, delivery fee operations, finance views

The frontend consumes the Laravel API from the backend project (`myanmar-b2b`) using `axios`.

## 1) Tech stack

- React 19 + Vite 7
- React Router 6
- TailwindCSS
- Axios
- i18next (`react-i18next`)
- Heroicons + Headless UI
- Recharts / Chart.js for dashboards
- Google reCAPTCHA v3 (via `react-google-recaptcha-v3`)

## 2) Project structure

Main source root: `src/`

- `src/pages/` - route-level pages (public, auth, buyer, seller, admin)
- `src/components/` - reusable UI and role-specific modules
- `src/context/` - app-wide providers (auth, cart, wishlist, notifications, theme, cookie)
- `src/utils/` - api client, helpers, analytics
- `src/locales/` - i18n language files
- `src/data/` - static datasets (for fallback locations and similar utilities)

Entry files:

- `src/main.jsx` - app bootstrap
- `src/App.jsx` - provider tree and route registration
- `src/utils/api.js` - axios instance and auth/error interceptors

## 3) Environment variables

Create `.env.local` (or `.env`) in this frontend root.

Required:

- `VITE_API_URL`  
  Example: `http://localhost:8000/api/v1`

Recommended:

- `VITE_API_WITH_CREDENTIALS=true`  
  Use `false` for strict bearer-token-only mode.
- `VITE_IMAGE_BASE_URL`  
  Example: `http://localhost:8000/storage`
- `VITE_RECAPTCHA_SITE_KEY`  
  For login/register/report protection
- `VITE_GA_MEASUREMENT_ID`  
  Optional analytics
- `VITE_APP_URL`  
  Public frontend URL (used in config)
- `VITE_DEFAULT_PRODUCT_IMAGE`  
  Optional fallback product image path

## 4) Install and run

```bash
npm install
npm run dev
```

Default Vite URL is usually `http://localhost:5173`.

Other scripts:

```bash
npm run build
npm run preview
npm run lint
```

## 5) Authentication and API behavior

- JWT/Sanctum token is read from `localStorage.token` and attached as `Authorization: Bearer ...`.
- If a 401 response occurs, local auth data is cleared and user is redirected to `/login`.
- `withCredentials` is enabled unless `VITE_API_WITH_CREDENTIALS=false`.
- Route access is enforced by:
  - `ProtectedRoute`
  - `GuestRoute`
  - seller guards (`SellerRouteGuard`, onboarding `StepGuard`)

## 6) Routing overview

All routes are defined in `src/App.jsx`.

Public routes:

- Home, products, sellers, categories
- Bulk order tool (`/bulk-order-tool`)
- Legal/help pages
- Public order tracking, newsletter confirmation/unsubscribe

Auth routes:

- `/login`, `/register`, `/forgot-password`, `/reset-password`

Buyer routes:

- `/cart`, `/checkout`, `/buyer`, `/wishlist`
- payment and order-related flows

Seller routes:

- `/seller/dashboard`
- Onboarding flow:
  - `/seller/onboarding/store-basic`
  - `/seller/onboarding/business-details`
  - `/seller/onboarding/address`
  - `/seller/onboarding/delivery-zones`
  - `/seller/onboarding/documents`
  - `/seller/onboarding/review-submit`
- Product management routes

Admin routes:

- `/admin`, `/admin/dashboard`
- category and financial management pages

Shared authenticated routes:

- RFQ manager
- order confirmation / order tracking details
- payment success
- reports center

## 7) Core business modules

### Buyer side

- Catalog and product details
- Cart management
- Checkout with OTP confirmation flow
- Dynamic shipping/fees fetch from `/orders/checkout-fees`
- Wishlist
- RFQ sending and quote acceptance/rejection

### Seller side

- Multi-step onboarding + document upload
- Delivery area and shipping zone setup
- Product CRUD, variants, options, discounts, coupons
- Order management and delivery method choice
- Wallet / COD invoice interactions

### Admin side

- Seller verification and document review
- Product/review/contact/report moderation
- Commission rule management
- Analytics and financial reports
- Delivery fee collection + platform logistics operations

## 8) Checkout fee display policy

Buyer checkout is designed to avoid exposing internal platform commission details directly.  
Current UI combines buyer-facing shipping-related charges into a neutral presentation while preserving backend accounting fields (`shipping_fee`, `tax_amount`) in API payloads.

## 9) Internationalization

- i18n provider is mounted at app root.
- Locale files are in `src/locales/`.
- Add keys in `en.json` (and other locales) for all new UI text.

## 10) Analytics and cookies

- GA pageviews are tracked only when analytics cookies are accepted.
- Cookie consent is handled through cookie context + banner.
- Route-based tracking is wired in `GARouteTracker`.

## 11) Build and deployment notes

- Standard static build output is `dist/`.
- `gh-pages` deploy script exists:
  - `npm run predeploy`
  - `npm run deploy`
- Ensure API base URL and image base URL are correctly set per environment.

## 12) Troubleshooting

- Network/CORS issues:
  - verify backend is running
  - verify `VITE_API_URL` points to `/api/v1`
  - verify backend CORS credentials policy matches frontend mode
- 401 loops:
  - clear `localStorage`
  - verify token freshness and backend auth guards
- Missing images/documents:
  - verify `VITE_IMAGE_BASE_URL`
  - verify backend storage symlink and filesystem permissions

## 13) Development standards

- Use `npm run lint` before merge.
- Keep role-sensitive logic in route guards and backend authorization.
- Do not expose internal settlement/commission breakdowns to buyer-facing UI unless product policy changes.
