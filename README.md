# Bhatti House Restaurant Management System

A mobile-first, QR-based restaurant ordering experience built with HTML, CSS, and vanilla JavaScript.

## Current phase

The client-side ordering journey is implemented as a single-page vanilla JavaScript flow:

- Semantic HTML application shell
- Shared CSS variables for color, type, spacing, radii, and shadows
- Responsive layout foundations for desktop and mobile
- Table selection with inline validation and localStorage persistence
- Menu category filtering, dish search, vegetarian filtering, and empty-result feedback
- Inline menu quantity controls with persistent cart state
- Cart drawer with quantity controls and live billing totals
- Order review with guest name, kitchen note, and pay-at-table, cash, or online payment states
- Mock order placement with a persistent order number, itemized bill, and status timeline
- Separated JavaScript modules for application, table, and menu state
- Mock menu and order data shaped for a future API integration

## Run locally

Open `index.html` in a browser. No build step or dependency installation is required.

## Frontend flow

1. Welcome and table identification
2. Menu browsing and category filtering
3. Cart and quantity management
4. Billing and order review
5. Order confirmation and tracking

The current order is intentionally mocked in the browser. The storage boundary in `js/app.js` can later be replaced with API calls without changing the customer-facing screens.

## Backend boundary

The frontend is complete as a customer-facing prototype. The next backend phase should replace the storage helpers in `js/app.js` with endpoints for table sessions, menu data, order creation, payment status, and live order tracking. Online payment is intentionally represented as `Payment pending` until a payment provider and server-side verification are connected.
