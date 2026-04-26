# Restaurant Reservation System

A multi-app restaurant reservation platform with separate client, owner, and admin frontends backed by a shared Node.js/Express API.

## Project Layout

- [client](client) - customer-facing React app for browsing restaurants, booking tables, viewing offers, and managing profile and booking history.
- [owners](owners) - owner dashboard React app for managing restaurants, menus, tables, bookings, offers, and profile settings.
- [admin](admin) - admin React app for platform administration, analytics, and moderation.
- [backend](backend) - Express API, authentication, database models, and file upload handling.

## Applications

### Client

The client app is the public-facing experience for diners.

Main routes in [client/src/App.js](client/src/App.js):

- `/` - login
- `/signup` - registration
- `/dashboard` - home page after authentication
- `/restaurants` - restaurant browsing
- `/restaurant/:id` - restaurant details
- `/offers` - active offers
- `/profile` - customer profile
- `/booking/confirmation` and `/booking/confirmation/:id` - booking success views
- `/booking/history` - booking history

Key UI pieces:

- Navigation and footer are hidden on login and signup pages.
- Protected routes wrap authenticated pages.
- A toast provider is used globally for feedback messages.

Styling structure in [client/src/styles](client/src/styles):

- [Auth.css](client/src/styles/Auth.css) - authentication pages.
- [Booking.css](client/src/styles/Booking.css) - booking screens.
- [BookingModal.css](client/src/styles/BookingModal.css) - modal booking UI.
- [HomePage.css](client/src/styles/HomePage.css) - dashboard/home layout.
- [MenuSection.css](client/src/styles/MenuSection.css) - menu sections.
- [Offers.css](client/src/styles/Offers.css) - offer cards and lists.
- [Profile.css](client/src/styles/Profile.css) - profile view.
- [RestaurantCard.css](client/src/styles/RestaurantCard.css) - restaurant cards.
- [RestaurantDetail.css](client/src/styles/RestaurantDetail.css) - restaurant detail page.
- [Spinner.css](client/src/styles/Spinner.css) - loading indicators.
- [Toast.css](client/src/styles/Toast.css) - toast notifications.
- [design.css](client/src/styles/design.css) - shared visual system.
- [modules](client/src/styles/modules) - modular CSS helpers.

### Owners

The owners app is the operational dashboard for restaurant owners.

Main routes in [owners/src/App.js](owners/src/App.js):

- `/login` - owner login
- `/signup` - owner signup
- `/` - owner dashboard
- `/restaurants` - restaurant list
- `/restaurant/new` - new restaurant form
- `/restaurant/:id` - edit restaurant form
- `/restaurant` - restaurant details
- `/menu` - menu list
- `/menu/new` - create menu item
- `/upload-menu` - bulk menu upload
- `/tables` - tables management
- `/tables/new` - create table
- `/bookings` - booking management
- `/offers` - offers management
- `/profile` - owner profile
- `/settings` - redirects to profile

Key UI pieces:

- Sidebar controls the navigation shell.
- Header provides page title, profile action, logout, and sidebar toggle.
- Auth state is checked against the backend on app load.

Styling structure in [owners/src/styles](owners/src/styles):

- [Auth.css](owners/src/styles/Auth.css) - login and signup pages.
- [Bookings.css](owners/src/styles/Bookings.css) - booking management.
- [Dashboard.css](owners/src/styles/Dashboard.css) - dashboard widgets and layout.
- [Header.css](owners/src/styles/Header.css) - top header bar.
- [Menu.css](owners/src/styles/Menu.css) - menu management screens.
- [Modal.css](owners/src/styles/Modal.css) - shared modal dialogs.
- [Offers.css](owners/src/styles/Offers.css) - offers management.
- [Profile.css](owners/src/styles/Profile.css) - profile page.
- [RestaurantDetails.css](owners/src/styles/RestaurantDetails.css) - restaurant details.
- [Restaurants.css](owners/src/styles/Restaurants.css) - restaurant lists and forms.
- [Sidebar.css](owners/src/styles/Sidebar.css) - left navigation.
- [Tables.css](owners/src/styles/Tables.css) - table management UI.
- [design.css](owners/src/styles/design.css) - shared theme and layout tokens.
- [theme-overrides.css](owners/src/styles/theme-overrides.css) - visual overrides.
- [modules](owners/src/styles/modules) - component-scoped style helpers.

### Admin

The admin app is the management console for platform-level operations.

Main routes in [admin/src/App.js](admin/src/App.js):

- `/login` - admin login
- `/signup` - admin signup
- `/` - admin dashboard
- `/owners` - owner management
- `/restaurants` - restaurant moderation
- `/customers` - customer management
- `/bookings` - booking oversight
- `/analytics` - analytics dashboard
- `/profile` - admin profile

Key UI pieces:

- Sidebar and topbar frame the application shell.
- The app verifies the stored token against the backend on mount.
- Logout is coordinated through a global app event.

Styling structure in [admin/src/styles](admin/src/styles):

- [Auth.css](admin/src/styles/Auth.css) - authentication screens.
- [Bookings.css](admin/src/styles/Bookings.css) - booking views.
- [Card.css](admin/src/styles/Card.css) - dashboard cards.
- [Customers.css](admin/src/styles/Customers.css) - customer management tables and panels.
- [Dashboard.css](admin/src/styles/Dashboard.css) - admin dashboard layout.
- [DataTable.css](admin/src/styles/DataTable.css) - table components.
- [Owners.css](admin/src/styles/Owners.css) - owner administration.
- [Profile.css](admin/src/styles/Profile.css) - admin profile page.
- [Restaurants.css](admin/src/styles/Restaurants.css) - restaurant moderation screens.
- [Sidebar.css](admin/src/styles/Sidebar.css) - sidebar navigation.
- [Topbar.css](admin/src/styles/Topbar.css) - top navigation bar.
- [design.css](admin/src/styles/design.css) - shared styling foundation.
- [modules](admin/src/styles/modules) - reusable style modules.

### Backend

The backend is an Express API with MongoDB, JWT auth, cookies, rate limiting, logging, and upload support.

Entry point: [backend/index.js](backend/index.js)

Primary responsibilities:

- Connects to MongoDB using `MONGO_URI`.
- Configures CORS for credentialed requests from the frontends.
- Applies JSON parsing, cookie parsing, logging, and rate limiting.
- Serves uploaded files from `/uploads`.
- Registers API route groups for customer, owner, admin, and public features.

Route groups mounted in the backend:

- `/api/auth` - customer/owner auth flows.
- `/api/admin/auth` - admin auth.
- `/api/admin/owners` - owner administration.
- `/api/admin/restaurants` - restaurant moderation.
- `/api/admin/customers` - customer administration.
- `/api/admin/bookings` - booking administration.
- `/api/admin/analytics` - reporting endpoints.
- `/api/owner/restaurants` - owner restaurant management.
- `/api/owner/menu` - owner menu management.
- `/api/owner/tables` - owner table management.
- `/api/owner/offers` - owner offer management.
- `/api/owner/dashboard` - owner stats and activity.
- `/api/restaurants` - public restaurant browsing.
- `/api/tables` - public table data.
- `/api/offers` - public offers.
- `/api/bookings` - customer bookings.
- `/api/owner/bookings` - owner booking tools.
- `/api/customers` - customer profile and registration.
- `/api/uploads` - upload handling.

Main backend folders:

- [backend/models](backend/models) - MongoDB models such as Admin, Booking, Customer, MenuItem, Offer, Owner, Restaurant, and Table.
- [backend/routes](backend/routes) - route handlers grouped by domain.
- [backend/middleware](backend/middleware) - auth middleware and rate limiting.
- [backend/utils](backend/utils) - logger and password validation helpers.
- [backend/uploads](backend/uploads) - uploaded assets.

## UI and CSS Architecture

The UI is split by app, with a shared pattern of app shell, route-based pages, and component-level styling.

Common patterns across the frontends:

- Authentication pages use a dedicated auth layout and auth-specific styles.
- Shell components such as sidebar, topbar, navbar, and footer are styled separately from page content.
- Tables, cards, modals, and forms each have dedicated CSS files rather than one large stylesheet.
- The design files act as shared tokens or visual foundations.

Design layers by app:

- Client: customer-facing experience with responsive booking and restaurant discovery screens.
- Owners: operational dashboard UI built around sidebar navigation and management forms.
- Admin: dense dashboard UI optimized for tables, analytics, and moderation workflows.

## Environment Variables

Backend:

- `PORT` - server port, defaults to `5000`.
- `MONGO_URI` - MongoDB connection string.
- `JWT_SECRET` - JWT signing secret.
- `CLIENT_ORIGIN` - comma-separated list of allowed frontend origins.
- `NODE_ENV` - controls production and development behavior.

Frontend apps:

- `REACT_APP_API_BASE` - backend base URL.
- `REACT_APP_API_URL` - optional alternate backend base URL used by the owner and admin apps.

## Setup and Run

Backend:

1. Install dependencies in [backend](backend).
2. Set the required environment variables.
3. Start the server with `npm start`.

Client:

1. Install dependencies in [client](client).
2. Start the app with `npm start`.
3. Build with `npm run build` when needed.

Owners:

1. Install dependencies in [owners](owners).
2. Start the app with `npm start`.
3. Build with `npm run build` when needed.

Admin:

1. Install dependencies in [admin](admin).
2. Start the app with `npm start`.
3. Build with `npm run build` when needed.

## Notes

- The repo currently uses separate React applications instead of a single monorepo UI shell.
- The backend is already configured for credentialed requests, so the client apps should use the same origin or a valid CORS configuration.
- The frontend apps rely on the backend API for authentication and data loading.

## Refactor Additions (Production Upgrade)

The project was upgraded in-place (no route or layout rewrites) with additive modules and compatible endpoint changes.

### Backend Additions

New service and utility layers:

- [backend/services/tableAllocator.js](backend/services/tableAllocator.js) - intelligent table allocation minimizing capacity waste and time-gap score.
- [backend/services/recommendationService.js](backend/services/recommendationService.js) - restaurant recommendation ranking by rating, inverse distance, and popularity.
- [backend/services/notificationService.js](backend/services/notificationService.js) - email notifications via NodeMailer (with safe fallback transport).
- [backend/services/cacheService.js](backend/services/cacheService.js) - Redis-first cache with in-memory fallback.
- [backend/utils/socket.js](backend/utils/socket.js) - shared Socket.IO emit helper.

Updated backend routes and models:

- [backend/routes/bookings.js](backend/routes/bookings.js) - transaction-safe booking creation, table conflict prevention, auto-allocation, customer cancel route, notifications, socket emits, pagination support.
- [backend/routes/restaurants.js](backend/routes/restaurants.js) - recommendation sorting and paginated response mode.
- [backend/routes/offers.js](backend/routes/offers.js) - lifecycle filtering (scheduled/active/expired) and pagination mode.
- [backend/routes/ownerOffers.js](backend/routes/ownerOffers.js) - offer lifecycle handling, update route, customer offer notifications.
- [backend/routes/ownerBookings.js](backend/routes/ownerBookings.js) - paginated owner booking list, cancellation cleanup, realtime updates.
- [backend/routes/analytics.js](backend/routes/analytics.js) - peak-hour distribution and Peak Index metrics.
- [backend/index.js](backend/index.js) - Socket.IO server bootstrap and cache initialization.
- [backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js) - refresh token helpers and centralized cookie clearing.
- [backend/routes/auth.js](backend/routes/auth.js), [backend/routes/customers.js](backend/routes/customers.js), [backend/routes/adminAuth.js](backend/routes/adminAuth.js) - refresh token endpoints and rotation.
- [backend/models/Restaurant.js](backend/models/Restaurant.js), [backend/models/Offer.js](backend/models/Offer.js), [backend/models/Booking.js](backend/models/Booking.js) - additional fields and indexes for performance.

### Frontend Additions (Non-breaking)

Client:

- [client/src/services/apiClient.js](client/src/services/apiClient.js) - reusable API request layer.
- [client/src/styles/tokens.css](client/src/styles/tokens.css) - design tokens imported in [client/src/index.css](client/src/index.css).

Owners:

- [owners/src/services/apiClient.js](owners/src/services/apiClient.js) - reusable owner API wrappers.
- [owners/src/services/socketClient.js](owners/src/services/socketClient.js) - Socket.IO owner channel connector.
- [owners/src/hooks/useRealtimeBookings.js](owners/src/hooks/useRealtimeBookings.js) - realtime booking event hook.
- [owners/src/styles/tokens.css](owners/src/styles/tokens.css) - tokenized interaction styles imported in [owners/src/index.css](owners/src/index.css).
- [owners/src/pages/Bookings.js](owners/src/pages/Bookings.js) - realtime booking updates and improved status error handling.

Admin:

- [admin/src/services/apiClient.js](admin/src/services/apiClient.js) - reusable admin API wrappers.
- [admin/src/styles/tokens.css](admin/src/styles/tokens.css) - tokenized interaction styles imported in [admin/src/index.css](admin/src/index.css).
- [admin/src/pages/Analytics.js](admin/src/pages/Analytics.js) - live stats + peak-hour visualization from backend analytics APIs.

## Suggested Verification

- Start the backend and each frontend app locally.
- Confirm login, signup, dashboard navigation, and the primary CRUD flows for owners and admin.
- Review the CSS folders if you need to change layout or theme behavior for a specific app.
