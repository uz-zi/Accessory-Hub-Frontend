# AccessoryHub — Frontend Documentation

## Stack
| Tool | Purpose |
|------|---------|
| Vue 3 (Composition API) | UI framework |
| Pinia | State management |
| Vue Router 4 | Client-side routing |
| Axios | HTTP client |
| Bootstrap 5 + Bootstrap Icons | CSS framework & icons |
| Vite | Build tool / dev server |

**Dev server:** `http://localhost:3000`  
**API target:** `http://localhost:3001/api/v1` (configurable via `VITE_API_BASE_URL`)

---

## Directory Structure

```
src/
├── main.js                  # App entry point
├── App.vue                  # Root component (global layout)
├── assets/
│   └── main.css             # Global styles & design system
├── router/
│   └── index.js             # All routes + navigation guards
├── stores/
│   ├── auth.js              # Auth state (user, tokens)
│   ├── cart.js              # Cart state + API sync
│   ├── products.js          # Products, categories, wishlist
│   └── ui.js                # UI state (drawers, toasts)
├── api/
│   ├── index.js             # Axios instance + interceptors
│   ├── auth.js              # Auth endpoints
│   ├── products.js          # Products + reviews endpoints
│   ├── cart.js              # Cart endpoints
│   ├── orders.js            # Orders + payments endpoints
│   └── wishlist.js          # Wishlist endpoints
├── components/
│   ├── AppNavbar.vue        # Top navigation bar
│   ├── AppFooter.vue        # Site footer
│   ├── CartDrawer.vue       # Slide-in cart sidebar
│   ├── ProductCard.vue      # Reusable product card
│   ├── AccountSidebar.vue   # Account section nav
│   ├── ChatWidget.vue       # Floating chat bubble
│   └── ToastContainer.vue   # Toast notification renderer
├── views/
│   ├── HomeView.vue         # / — Landing page
│   ├── ProductsView.vue     # /products — Product listing
│   ├── ProductDetailView.vue# /products/:id — Product detail
│   ├── CartView.vue         # /cart — Full cart page
│   ├── CheckoutView.vue     # /checkout — Multi-step checkout
│   ├── OrderConfirmationView.vue # /order-confirmation/:id
│   ├── LoginView.vue        # /login
│   ├── RegisterView.vue     # /register
│   ├── ForgotPasswordView.vue # /forgot-password
│   ├── NotFoundView.vue     # 404 catch-all
│   └── account/
│       ├── ProfileView.vue  # /account/profile
│       ├── OrdersView.vue   # /account/orders
│       ├── OrderDetailView.vue # /account/orders/:id
│       └── WishlistView.vue # /account/wishlist
└── composables/             # (reserved for future shared logic)
```

---

## Entry Point

### `src/main.js`
Creates the Vue app, registers Pinia and Vue Router, imports Bootstrap CSS/JS and `main.css`, mounts to `#app`.

### `src/App.vue`
Root layout rendered for every page:
- Renders `AppNavbar`, `CartDrawer`, `<RouterView>`, `AppFooter`, `ChatWidget`, `ToastContainer`
- On `mounted`: calls `authStore.hydrateFromStorage()` to restore auth session from localStorage

---

## Router — `src/router/index.js`

### Public Routes
| Path | Component | Name |
|------|-----------|------|
| `/` | HomeView | home |
| `/products` | ProductsView | products |
| `/products/:id` | ProductDetailView | product-detail |
| `/cart` | CartView | cart |

### Guest-Only Routes *(redirect to `/` if already logged in)*
| Path | Component | Name |
|------|-----------|------|
| `/login` | LoginView | login |
| `/register` | RegisterView | register |
| `/forgot-password` | ForgotPasswordView | forgot-password |

### Protected Routes *(redirect to `/login` if not authenticated)*
| Path | Component | Name |
|------|-----------|------|
| `/checkout` | CheckoutView | checkout |
| `/order-confirmation/:id` | OrderConfirmationView | order-confirmation |
| `/account` | — | Redirects to account-profile |
| `/account/profile` | ProfileView | account-profile |
| `/account/orders` | OrdersView | account-orders |
| `/account/orders/:id` | OrderDetailView | account-order-detail |
| `/account/wishlist` | WishlistView | account-wishlist |

### Catch-All
| Path | Component | Name |
|------|-----------|------|
| `/:pathMatch(.*)*` | NotFoundView | not-found |

### Navigation Guards
- Sets `document.title` from route `meta.title`
- Blocks unauthenticated users from protected routes → redirects to `/login?redirect=<original-path>`
- Blocks authenticated users from guest-only routes → redirects to `/`
- Smooth scroll-to-top on navigation

---

## State Management — `src/stores/`

### `auth.js` — `useAuthStore()`

**State:**
| Field | Type | Description |
|-------|------|-------------|
| `user` | ref Object | Current user (`first_name`, `last_name`, `email`, `phone`, etc.) |
| `accessToken` | ref String | JWT access token |
| `loading` | ref Boolean | Auth operation in progress |
| `error` | ref String | Last error message |

**Computed:**
- `isAuthenticated` — `true` if token + user both exist
- `fullName` — `first_name + " " + last_name`

**Actions:**
| Action | What it does |
|--------|-------------|
| `hydrateFromStorage()` | On app start: loads token from localStorage, calls `GET /auth/me` to restore user |
| `login(credentials)` | `POST /auth/login` → stores tokens + user |
| `register(payload)` | `POST /auth/register` → stores tokens + user |
| `logout()` | `DELETE /auth/logout` → clears state + localStorage, redirects home |
| `forgotPassword(email)` | `POST /auth/forgot_password` |
| `updateProfile(payload)` | `PUT /auth/me` → updates user in state |
| `setTokens(access, refresh)` | Stores tokens in state + localStorage |
| `clearTokens()` | Clears auth state + localStorage |

---

### `cart.js` — `useCartStore()`

**State:**
| Field | Type | Description |
|-------|------|-------------|
| `items` | ref Array | Cart items `{id, product, variant, quantity, price}` |
| `coupon` | ref Object | Applied coupon `{code, discount_type, discount_value}` |
| `loading` | ref Boolean | Operation in progress |
| `synced` | ref Boolean | Whether cart is synced with server |

**Computed:**
- `subtotal` — sum of `price × quantity` for all items
- `discount` — percent or fixed discount from coupon
- `shipping` — `$4.99` if subtotal < $50, otherwise `$0` (free)
- `total` — `subtotal - discount + shipping`
- `itemCount` — total units across all items

**Actions:**
| Action | What it does |
|--------|-------------|
| `fetchCart()` | `GET /cart` — loads cart from server |
| `addItem(product, variant?, quantity?)` | `POST /cart/items` — optimistic local add then API sync |
| `updateItem(itemId, quantity)` | `PUT /cart/items/:id` |
| `removeItem(itemId)` | `DELETE /cart/items/:id` |
| `clearCart()` | `DELETE /cart` |
| `applyCoupon(code)` | `POST /cart/coupon` |
| `removeCoupon()` | `DELETE /cart/coupon` |
| `loadLocal()` | Load cart from localStorage (called on store init) |
| `persist()` | Save current cart to localStorage |

---

### `products.js` — `useProductsStore()`

**State:**
| Field | Type | Description |
|-------|------|-------------|
| `products` | ref Array | Current product list |
| `featured` | ref Array | Featured products |
| `categories` | ref Array | All categories |
| `current` | ref Object | Product currently being viewed |
| `wishlistIds` | ref Set | Set of wishlisted product IDs |
| `loading` | ref Boolean | Single product load |
| `listLoading` | ref Boolean | List load |
| `error` | ref String | Last error |
| `pagination` | ref Object | `{page, per_page, total, total_pages}` |
| `activeFilters` | ref Object | `{category, min_price, max_price, sort, search}` |

**Computed:**
- `hasMore` — `true` if more pages exist

**Actions:**
| Action | What it does |
|--------|-------------|
| `fetchProducts(params?, append?)` | `GET /products` with filters; `append=true` for load-more pagination |
| `fetchFeatured()` | `GET /products/featured` |
| `fetchCategories()` | `GET /categories` |
| `fetchProduct(id)` | `GET /products/:id` → sets `current` |
| `setFilter(key, value)` | Updates filter, resets to page 1 |
| `resetFilters()` | Clears all active filters |
| `nextPage()` | Increments page and fetches (append mode) |
| `fetchWishlist()` | `GET /wishlist` → populates `wishlistIds` |
| `toggleWishlist(productId)` | Add or remove from wishlist via API, updates Set |
| `isWishlisted(productId)` | Returns `true/false` from `wishlistIds` Set |

---

### `ui.js` — `useUiStore()`

**State:**
| Field | Type | Description |
|-------|------|-------------|
| `cartOpen` | ref Boolean | Cart drawer open/closed |
| `chatOpen` | ref Boolean | Chat widget open/closed |
| `toasts` | ref Array | Active toasts `{id, type, message, duration}` |

**Actions:**
| Action | What it does |
|--------|-------------|
| `openCart()` / `closeCart()` / `toggleCart()` | Cart drawer visibility |
| `openChat()` / `closeChat()` / `toggleChat()` | Chat widget visibility |
| `toast(message, type?, duration?)` | Adds toast (types: `success`, `error`, `warning`, `info`; default 3500ms) |
| `removeToast(id)` | Removes toast by ID |

---

## API Layer — `src/api/`

### `index.js` — Axios Instance
- Base URL: `VITE_API_BASE_URL` or `http://localhost:3001/api/v1`
- Timeout: 15 seconds
- **Request interceptor:** attaches `Authorization: Bearer <token>` from localStorage
- **Response interceptor (401 handling):**
  - Attempts silent token refresh
  - Queues all concurrent failed requests while refresh is in progress
  - Retries original requests with the new token
  - On refresh failure: clears tokens, emits `auth:logout` event, redirects to `/login`

### `auth.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `login(credentials)` | POST | `/auth/login` |
| `register(payload)` | POST | `/auth/register` |
| `logout()` | DELETE | `/auth/logout` |
| `forgotPassword(email)` | POST | `/auth/forgot_password` |
| `resetPassword(token, password)` | PUT | `/auth/reset_password` |
| `getProfile()` | GET | `/auth/me` |
| `updateProfile(payload)` | PUT | `/auth/me` |
| `changePassword(payload)` | PUT | `/auth/change_password` |

### `products.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `getAll(params)` | GET | `/products` |
| `getById(id)` | GET | `/products/:id` |
| `getFeatured()` | GET | `/products/featured` |
| `getCategories()` | GET | `/categories` |
| `getReviews(productId, params)` | GET | `/products/:id/reviews` |
| `createReview(productId, payload)` | POST | `/products/:id/reviews` |

### `cart.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `getCart()` | GET | `/cart` |
| `addItem(payload)` | POST | `/cart/items` |
| `updateItem(itemId, quantity)` | PUT | `/cart/items/:id` |
| `removeItem(itemId)` | DELETE | `/cart/items/:id` |
| `clearCart()` | DELETE | `/cart` |
| `applyCoupon(code)` | POST | `/cart/coupon` |
| `removeCoupon()` | DELETE | `/cart/coupon` |

### `orders.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `createOrder(payload)` | POST | `/orders` |
| `getOrders(params)` | GET | `/orders` |
| `getOrder(id)` | GET | `/orders/:id` |
| `cancelOrder(id)` | PUT | `/orders/:id/cancel` |
| `createPaymentIntent(payload)` | POST | `/payments/create_intent` |
| `confirmPayment(orderId, payload)` | POST | `/payments/:id/confirm` |

### `wishlist.js`
| Function | Method | Endpoint |
|----------|--------|----------|
| `getWishlist()` | GET | `/wishlist` |
| `addItem(productId)` | POST | `/wishlist` |
| `removeItem(productId)` | DELETE | `/wishlist/:id` |

---

## Components — `src/components/`

### `AppNavbar.vue`
Fixed top navigation bar present on every page.

**What it renders:**
- Brand logo (links to `/`)
- Search bar → navigates to `/products?search=<query>` on submit
- Cart icon with item count badge (caps at `99+`)
- If **authenticated**: wishlist icon, avatar circle with user initials, dropdown (Profile, Orders, Wishlist, Logout)
- If **not authenticated**: Login button

**Stores used:** `useAuthStore`, `useCartStore`, `useUiStore`

---

### `AppFooter.vue`
Dark full-width footer at the bottom of every page.

**What it renders:**
- Brand description + social links
- Shop links (categories with filtered `/products?category=<x>` URLs)
- Account links (Profile, Orders, Wishlist)
- Help links
- Newsletter subscription form (email input + subscribe button)
- Payment method icons
- Copyright with current year

---

### `CartDrawer.vue`
Slide-in panel from the right side for quick cart access.

**Triggered by:** `uiStore.cartOpen` (toggled via navbar cart icon or "Add to cart" actions)

**What it renders:**
- Cart items list: thumbnail, name, variant, quantity stepper (+/−), price, remove button
- Coupon code input (collapsible) with apply/remove and error display
- Order summary: Subtotal, Discount, Shipping, **Total**
- "View Cart" button → `/cart`
- "Checkout" button → `/checkout`
- Empty state with "Shop Now" button
- Overlay click closes drawer

**Stores used:** `useCartStore`, `useUiStore`

---

### `ProductCard.vue`
Reusable card displayed in product grids (Home, Products listing, Related products, Wishlist).

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `product` | Object | Yes | Full product object |

**What it renders:**
- Product image with hover zoom effect
- Wishlist heart button (toggles via `productsStore.toggleWishlist`)
- Badges: `NEW`, `−X%` discount, `Out of Stock`
- Product name → links to `/products/:id`
- Star rating with review count
- Price (with strikethrough original price if on sale)
- "Add to Cart" button with loading spinner; disabled if out of stock

**On add to cart:** adds item, opens cart drawer, shows success toast.

**Stores used:** `useCartStore`, `useProductsStore`, `useUiStore`, `useAuthStore`

---

### `AccountSidebar.vue`
Left sidebar navigation for all `/account/*` pages.

**What it renders:**
- Avatar circle with user initials
- Full name and email
- Nav links: Profile, Orders, Wishlist (active link highlighted)
- Logout button (calls `authStore.logout()`)

**Stores used:** `useAuthStore`

---

### `ChatWidget.vue`
Floating chat bubble fixed at bottom-right of every page.

**What it renders:**
- Bubble button with unread count badge
- Chat window with message list (user messages right-aligned, bot messages left)
- Text input + Send button
- Typing indicator (animated dots)

**Behavior:**
- Bot sends a greeting on first open
- Bot responds with hardcoded replies (stub — easily swappable for API integration)
- Auto-scrolls to latest message
- Unread badge increments when window is closed and bot replies

**Stores used:** `useUiStore`

---

### `ToastContainer.vue`
Fixed container (bottom-right, above everything) that renders all active toasts.

**Toast types → colors:**
- `success` → green
- `error` → red (Bootstrap danger)
- `warning` → yellow
- `info` → blue

Each toast has a close button and slide-in animation. Auto-removed after `duration` ms (default 3500ms) via `uiStore.removeToast(id)`.

**Stores used:** `useUiStore`

---

## Views — `src/views/`

### `HomeView.vue` — Route: `/`

Landing page. No route params or auth requirement.

**Sections (top to bottom):**
1. **Hero** — tagline, "Shop Now" + "New Arrivals" CTA buttons, 3 stat counters (5K+ products, 50K+ customers, 4.8★ rating)
2. **Trust Bar** — 4 icons: Free Shipping, Easy Returns, 2-Year Warranty, 24/7 Support
3. **Shop by Category** — 6 category tiles (Cases, Chargers, Earbuds, Screen Guards, Mounts, Cables), each links to `/products?category=<slug>`
4. **Featured Products** — fetches `GET /products/featured`, renders `ProductCard` grid; loading skeleton shown while fetching
5. **Promo Banner** — "20% off with code `WELCOME20`"
6. **New Arrivals** — takes first 4 featured products and shows them in a second grid

**API calls:** `productsStore.fetchFeatured()`, `productsStore.fetchCategories()`

---

### `ProductsView.vue` — Route: `/products`

Full product catalog with filtering, sorting, and pagination.

**URL query params read/written:** `?category=`, `?min_price=`, `?max_price=`, `?sort=`, `?search=`

**Layout:**
- **Left sidebar (desktop):** Category radio buttons, price range inputs (min/max), Apply + Clear buttons
- **Right main area:**
  - Result count + sort dropdown (Newest, Price Low→High, Price High→Low, Most Popular, Top Rated)
  - Active filter chips (removable — per chip for category, search, price)
  - Product grid of `ProductCard` components
  - Empty state with "Clear Filters" if no results
  - "Load More" button when more pages exist
- **Mobile filter offcanvas:** same filter UI, triggered by "Filters" button

**Computed:** `hasActiveFilters`, `activeCategory`

**Watchers:** `route.query` — syncs filter state if URL changes externally (e.g. navbar search)

**Store used:** `useProductsStore`

---

### `ProductDetailView.vue` — Route: `/products/:id`

Full product detail page.

**Left column:**
- Main product image (large)
- Thumbnail gallery — click to change main image

**Right column:**
- Breadcrumb: Home → Shop → Product Name
- Category badge
- Product title
- Star rating + review count (click scrolls to reviews)
- Price with strikethrough original price
- Discount badge
- **Variant selector** — buttons for each variant (color/size); selected variant controls displayed price
- **Quantity stepper** — min 1, max stock
- "Add to Cart" button (disabled if out of stock)
- Wishlist toggle button
- Trust badges (shipping, returns, warranty)

**Accordion sections:**
- Description (collapsible)
- Specifications table (collapsible)

**Reviews section:**
- Average star rating with distribution bar
- Individual review cards (rating, title, date, reviewer name)
- "No reviews yet" empty state

**Related Products:**
- Up to 4 products from the same category

**API calls:**
- `productsStore.fetchProduct(id)` — `GET /products/:id`
- `productsApi.getReviews(id)` — `GET /products/:id/reviews`
- `productsApi.getAll({category, per_page: 4})` — `GET /products` (for related)

**Stores used:** `useProductsStore`, `useCartStore`, `useUiStore`, `useAuthStore`

---

### `CartView.vue` — Route: `/cart`

Full-page cart (distinct from `CartDrawer`).

**Left column — Items list:**
- Item card per item: thumbnail, name, variant, unit price, quantity stepper, line total, remove button
- "Continue Shopping" link
- "Clear Cart" button

**Right column — Order Summary:**
- Coupon code input (collapsible), apply/remove with error display
- Subtotal, Discount, Shipping (free if ≥ $50), **Total**
- Free shipping threshold alert if subtotal < $50
- "Secure Checkout" button → `/checkout`
- Payment method icons

**Empty state:** message + "Start Shopping" button → `/products`

**Stores used:** `useCartStore`

---

### `CheckoutView.vue` — Route: `/checkout` *(protected)*

Multi-step checkout flow.

**Step indicator:** visual 2-step progress bar (Shipping → Payment)

**Step 1 — Shipping Address:**
- First name, last name
- Address line 1, Address line 2 (optional)
- City, State, ZIP
- Country dropdown (US, UK, CA, AU)
- Phone
- "Continue to Payment" button

**Step 2 — Payment Details:**
- Demo mode notice (no real charge)
- Name on card
- Card number input (auto-formats to groups of 4: `XXXX XXXX XXXX XXXX`)
- Expiry date, CVV
- Error display
- "Back" button (returns to step 1)
- "Place Order" button — calls `POST /orders` with shipping address + cart items + coupon + total

**Right sidebar (sticky):**
- Mini cart items list with thumbnails and quantity badges
- Totals: Subtotal, Discount, Shipping, **Total**

**On success:** clears cart, redirects to `/order-confirmation/:id`

**API calls:** `ordersApi.createOrder(payload)` — `POST /orders`

**Stores used:** `useCartStore`, `useAuthStore`

---

### `OrderConfirmationView.vue` — Route: `/order-confirmation/:id` *(protected)*

Order success page shown after checkout.

**Sections:**
1. **Success animation** — green circle with checkmark, "Order Confirmed!" heading, order ID display
2. **Order Details card** — items list with images, names, quantities, prices, order total
3. **What's Next** — confirmation email info, processing timeline (1–2 days), shipping timeline (3–7 days)
4. **CTA buttons** — "View My Orders" → `/account/orders` | "Continue Shopping" → `/products`

**API calls:** `ordersApi.getOrder(id)` — `GET /orders/:id`

---

### `LoginView.vue` — Route: `/login` *(guest only)*

**Form fields:**
- Email
- Password (with show/hide toggle)
- Remember me checkbox

**Behavior:**
- Calls `authStore.login()` on submit
- On success: redirects to `?redirect=` param or `/`
- Displays error from `authStore.error`

Links to: Register page, Forgot Password page

---

### `RegisterView.vue` — Route: `/register` *(guest only)*

**Form fields:**
- First name, Last name
- Email
- Password with **strength indicator:**
  - Criteria checked: 8+ chars, uppercase letter, number, special character
  - Progress bar color: red (Weak) → orange (Fair) → blue (Good) → green (Strong)
- Confirm password (inline validation)
- Terms & Privacy agreement checkbox (required)

**Submit disabled** if passwords don't match.

**Computed:** `passwordStrength` (0–4), `strengthClass`, `strengthWidth`, `strengthLabel`

**On success:** redirects to `/`

---

### `ForgotPasswordView.vue` — Route: `/forgot-password` *(guest only)*

**Form state:**
- Email input + "Send Reset Link" button
- Error display

**Success state (after submit):**
- Checkmark icon
- "Check your email" message showing which address was sent to
- "Back to Sign In" link

Calls `authStore.forgotPassword(email)` — `POST /auth/forgot_password`

---

### `NotFoundView.vue` — Route: `/:pathMatch(.*)*`

404 page. Humorous message ("missing like a charging cable before a long flight"). Buttons: Go Home, Shop Now.

---

## Account Views — `src/views/account/`

All account views share the same layout: `AccountSidebar` on the left + content on the right.

### `ProfileView.vue` — Route: `/account/profile`

**Profile form:** First name, Last name, Email, Phone → "Save Changes" button
- Calls `authStore.updateProfile(payload)` — `PUT /auth/me`
- Shows green success message on save

**Change Password form:** Current password, New password, Confirm password
- Calls `authApi.changePassword(payload)` — `PUT /auth/change_password`
- Shows success or error message

---

### `OrdersView.vue` — Route: `/account/orders`

**Order list** (paginated, 10 per page):
- Per order: Order ID, creation date, status badge (color-coded), total, item thumbnails
- "View Details" button → `/account/orders/:id`
- "Cancel Order" button (only if status is `pending`)
- "Load More Orders" button if more pages exist

**Empty state:** icon + message + "Start Shopping" button

**API calls:**
- `ordersApi.getOrders({page, per_page})` — `GET /orders`
- `ordersApi.cancelOrder(id)` — `PUT /orders/:id/cancel`

**Status badge colors:**
- `pending` → yellow
- `processing` → blue
- `shipped` → teal
- `delivered` → green
- `cancelled` → red

---

### `OrderDetailView.vue` — Route: `/account/orders/:id`

**Visual status tracker (4-step timeline):**
Steps: Pending → Processing → Shipped → Delivered
- Completed steps show green filled circles with checkmarks
- Connecting lines between steps turn green when completed
- Hidden if order is cancelled

**Left column — Items:**
- Item cards: image, name, variant, quantity, price
- Each product name links to `/products/:id`

**Right column:**
- Order Summary: Subtotal, Discount, Shipping, Total
- Shipping Address card (if address exists)

**Cancel Order button** — only shown if status is `pending`; confirms before cancelling

**API calls:**
- `ordersApi.getOrder(id)` — `GET /orders/:id`
- `ordersApi.cancelOrder(id)` — `PUT /orders/:id/cancel`

---

### `WishlistView.vue` — Route: `/account/wishlist`

**Wishlist grid:**
- Card per item: product image, name, price
- "Add to Cart" button (with spinner while adding)
- Remove button (heart icon) — removes from wishlist and updates `productsStore.wishlistIds`

**Empty state:** heart icon + message + "Browse Products" button

**API calls:**
- `wishlistApi.getWishlist()` — `GET /wishlist`
- `wishlistApi.removeItem(productId)` — `DELETE /wishlist/:id`
- `cartStore.addItem(product)` — `POST /cart/items`

---

## Global Styles — `src/assets/main.css`

**Design tokens (CSS variables):**
```css
--primary:    #6c63ff   /* purple */
--secondary:  #f7f7fb   /* light background */
--accent:     #ff6584   /* pink */
--dark:       #1a1a2e
--text:       #333344
--muted:      #6c757d
--border:     #e2e2ef
--radius:     0.75rem
--shadow:     0 4px 24px rgba(108,99,255,.10)
--navbar-h:   64px
```

**Covers:**
- Base resets (`*`, `body`, `a`)
- Bootstrap overrides (`.btn-primary`, badges)
- Product card hover effects (image zoom, wishlist button reveal, badges)
- Navbar sticky + blur backdrop
- Hero section gradient
- Category tile hover transform
- Cart drawer slide animation
- Chat widget bubble, window, messages, typing dots animation
- Checkout step indicator styles
- Star rating display
- Responsive tweaks for mobile

---

## Data Flows

### Auth Flow
```
LoginView → authStore.login() → authApi.login()
→ JWT tokens saved (state + localStorage)
→ user object in authStore.user
→ Navbar shows initials + dropdown
→ Protected routes accessible

401 response anywhere → axios interceptor → silent refresh
→ if refresh fails → clearTokens() → redirect /login
```

### Cart Flow
```
ProductCard / ProductDetailView
→ cartStore.addItem(product, variant?, qty?)
→ optimistic local update + localStorage persist
→ POST /cart/items (server sync)
→ CartDrawer opens, toast shown

CartView / CartDrawer
→ quantity stepper → cartStore.updateItem()
→ remove → cartStore.removeItem()
→ coupon input → cartStore.applyCoupon()

CheckoutView → ordersApi.createOrder()
→ cart cleared → redirect /order-confirmation/:id
```

### Product + Filter Flow
```
ProductsView mounts
→ reads route.query → syncs to activeFilters
→ productsStore.fetchProducts(filters)

User changes filter / sort
→ setFilter() → fetchProducts() → products list updates
→ URL query params updated

Load More
→ productsStore.nextPage() → fetchProducts(append=true)
→ new products appended to existing list
```

### Wishlist Flow
```
ProductCard / ProductDetailView
→ productsStore.toggleWishlist(productId)
→ add: POST /wishlist, remove: DELETE /wishlist/:id
→ wishlistIds Set updated → heart icon reflects state

WishlistView
→ wishlistApi.getWishlist() → wishlistItems array
→ remove: wishlistApi.removeItem() + productsStore.wishlistIds update
→ add to cart: cartStore.addItem()
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:3001/api/v1` | Backend API base URL |

Set in `.env` file at project root.
