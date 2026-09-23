import { getSelectedTable, isValidTable, saveSelectedTable, tableOptions } from "./table.js";
import { menuItems, getMenuCategories } from "./menu.js";

const CART_STORAGE_KEY = "rms.cart";
const ORDER_STORAGE_KEY = "rms.currentOrder";
const app = document.querySelector("#app");

const appState = {
  selectedTable: getSelectedTable(),
  cart: readStorage(CART_STORAGE_KEY, []),
  currentOrder: readStorage(ORDER_STORAGE_KEY, null),
  menuItems,
  menuCategories: getMenuCategories(menuItems)
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const categoryLabels = {
  all: "All",
  starters: "Starters",
  "main-course": "Main course",
  breads: "Breads",
  rice: "Rice",
  beverages: "Beverages",
  desserts: "Desserts"
};

function readStorage(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(value) {
  return currency.format(value).replace("₹", "₹");
}

function getCartDetails() {
  return appState.cart
    .map((cartItem) => ({
      ...cartItem,
      item: menuItems.find((menuItem) => menuItem.id === cartItem.id)
    }))
    .filter((cartItem) => cartItem.item);
}

function getTotals() {
  const subtotal = getCartDetails().reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0);
  const serviceCharge = Math.round(subtotal * 0.05);
  const tax = Math.round((subtotal + serviceCharge) * 0.05);
  return { subtotal, serviceCharge, tax, total: subtotal + serviceCharge + tax };
}

function persistCart() {
  writeStorage(CART_STORAGE_KEY, appState.cart);
}

function setSelectedTable(tableNumber) {
  appState.selectedTable = tableNumber;
  saveSelectedTable(tableNumber);
}

function renderTableSelection() {
  const options = tableOptions.map((tableNumber) => `<option value="${tableNumber}">${tableNumber}</option>`).join("");
  app.innerHTML = `
    <section class="table-selection" aria-labelledby="table-title">
      <div class="table-selection-copy">
        <p class="eyebrow">Welcome to Bhatti House</p>
        <h1 id="table-title">Let’s get your table started.</h1>
        <p class="intro-description">Tell us where you’re sitting and we’ll bring the whole menu to you.</p>
        <p class="table-step">Step 01 <span aria-hidden="true">/</span> Table identification</p>
      </div>
      <form class="table-form" data-table-form novalidate>
        <label for="table-number">Table number</label>
        <select id="table-number" name="table-number" required>
          <option value="">Select your table</option>${options}
        </select>
        <p class="field-message" data-table-message aria-live="polite"></p>
        <p class="form-note">Your table number helps us deliver your order to the right place.</p>
        <button class="primary-action" type="submit">Continue to menu <span aria-hidden="true">&#8594;</span></button>
      </form>
    </section>`;
  app.querySelector("[data-table-form]").addEventListener("submit", handleTableSubmit);
  app.querySelector("#table-number").focus();
}

function handleTableSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const tableNumber = form.elements["table-number"].value;
  const message = form.querySelector("[data-table-message]");
  if (!isValidTable(tableNumber)) {
    message.textContent = "Please select your table number to continue.";
    form.elements["table-number"].focus();
    return;
  }
  setSelectedTable(tableNumber);
  renderMenu();
}

function renderMenu(activeCategory = "all", searchQuery = "", vegetarianOnly = false) {
  const categories = appState.menuCategories.map((category) => `
    <button class="category-tab${category === activeCategory ? " is-active" : ""}" type="button" data-category="${category}">${categoryLabels[category]}</button>`).join("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const matchesSearch = !normalizedQuery || `${item.name} ${item.description}`.toLowerCase().includes(normalizedQuery);
    const matchesDiet = !vegetarianOnly || item.vegetarian;
    return matchesCategory && matchesSearch && matchesDiet;
  });
  const cards = filteredItems.map((item) => {
    const cartItem = appState.cart.find((entry) => entry.id === item.id);
    return `<article class="menu-item">
      <div class="menu-art menu-art--${item.art}" role="img" aria-label="Illustration of ${item.name}"><span>${item.shortLabel}</span></div>
      <div class="menu-item-body">
        <div class="menu-item-heading"><h3>${item.name}</h3><span class="food-mark" aria-label="${item.vegetarian ? "Vegetarian" : "Non-vegetarian"}">${item.vegetarian ? "V" : "NV"}</span></div>
        <p>${item.description}</p>
        <div class="menu-item-footer"><strong>${formatPrice(item.price)}</strong>${cartItem ? `<div class="item-quantity" aria-label="Quantity of ${item.name}"><button type="button" data-item-change="-1" data-item-id="${item.id}" aria-label="Decrease ${item.name}">−</button><span>${cartItem.quantity}</span><button type="button" data-item-change="1" data-item-id="${item.id}" aria-label="Increase ${item.name}">+</button></div>` : `<button class="add-button" type="button" data-add-item="${item.id}">+ Add</button>`}</div>
      </div>
    </article>`;
  }).join("");
  const resultContent = cards || `<div class="menu-empty"><strong>No dishes found</strong><p>Try another search or browse every category.</p><button class="text-button" type="button" data-clear-menu>Clear filters</button></div>`;

  app.innerHTML = `
    <section class="menu-view" aria-labelledby="menu-title">
      <div class="menu-topbar"><div><p class="eyebrow">Good evening, welcome in</p><h1 id="menu-title">What are you in the mood for?</h1></div><div class="table-pill">Table <strong>${appState.selectedTable}</strong></div></div>
      <p class="menu-intro">A little something for every appetite, prepared fresh from our kitchen.</p>
      <form class="menu-tools" data-menu-tools><label class="search-field" for="menu-search"><span class="sr-only">Search menu</span><input id="menu-search" name="search" type="search" value="${searchQuery}" placeholder="Search dishes or ingredients"><span aria-hidden="true">⌕</span></label><label class="diet-toggle"><input name="vegetarian" type="checkbox"${vegetarianOnly ? " checked" : ""}><span>Vegetarian only</span></label><button class="text-button" type="submit">Search</button></form>
      <nav class="category-tabs" aria-label="Menu categories">${categories}</nav>
      <div class="menu-grid${cards ? "" : " menu-grid--empty"}">${resultContent}</div>
      ${renderCartBar()}
    </section>`;
  bindMenuEvents(activeCategory, searchQuery, vegetarianOnly);
}

function renderCartBar() {
  const count = appState.cart.reduce((total, item) => total + item.quantity, 0);
  const { total } = getTotals();
  if (!count) return "";
  return `<button class="cart-bar" type="button" data-open-cart><span><strong>${count} ${count === 1 ? "item" : "items"}</strong> in your order</span><span>${formatPrice(total)} <span aria-hidden="true">&#8594;</span></span></button>`;
}

function bindMenuEvents(activeCategory, searchQuery, vegetarianOnly) {
  app.querySelectorAll("[data-category]").forEach((button) => button.addEventListener("click", () => renderMenu(button.dataset.category, searchQuery, vegetarianOnly)));
  app.querySelectorAll("[data-add-item]").forEach((button) => button.addEventListener("click", () => addToCart(Number(button.dataset.addItem), activeCategory, searchQuery, vegetarianOnly)));
  app.querySelectorAll("[data-item-change]").forEach((button) => button.addEventListener("click", () => {
    adjustCart(Number(button.dataset.itemId), Number(button.dataset.itemChange));
    renderMenu(activeCategory, searchQuery, vegetarianOnly);
  }));
  app.querySelector("[data-menu-tools]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    renderMenu(activeCategory, form.elements.search.value, form.elements.vegetarian.checked);
  });
  app.querySelector("[data-clear-menu]")?.addEventListener("click", () => renderMenu("all"));
  app.querySelector("[data-open-cart]")?.addEventListener("click", renderCartDrawer);
}

function addToCart(itemId, activeCategory = "all", searchQuery = "", vegetarianOnly = false) {
  const existing = appState.cart.find((item) => item.id === itemId);
  if (existing) existing.quantity += 1;
  else appState.cart.push({ id: itemId, quantity: 1 });
  persistCart();
  renderMenu(activeCategory, searchQuery, vegetarianOnly);
}

function adjustCart(itemId, amount) {
  const cartItem = appState.cart.find((item) => item.id === itemId);
  if (!cartItem) return;
  cartItem.quantity += amount;
  appState.cart = appState.cart.filter((item) => item.quantity > 0);
  persistCart();
}

function renderCartDrawer() {
  const details = getCartDetails();
  const totals = getTotals();
  const items = details.map((cartItem) => `<div class="cart-line"><div><strong>${cartItem.item.name}</strong><span>${formatPrice(cartItem.item.price)} each</span></div><div class="quantity-control"><button type="button" data-cart-change="-1" data-cart-id="${cartItem.item.id}" aria-label="Decrease ${cartItem.item.name}">−</button><span>${cartItem.quantity}</span><button type="button" data-cart-change="1" data-cart-id="${cartItem.item.id}" aria-label="Increase ${cartItem.item.name}">+</button></div><strong>${formatPrice(cartItem.item.price * cartItem.quantity)}</strong></div>`).join("");
  const drawer = document.createElement("div");
  drawer.className = "drawer-layer";
  drawer.innerHTML = `<div class="drawer-backdrop" data-close-cart></div><aside class="cart-drawer" aria-label="Your order" role="dialog"><div class="drawer-heading"><div><p class="eyebrow">Table ${appState.selectedTable}</p><h2>Your order</h2></div><button class="icon-button" type="button" data-close-cart aria-label="Close order">×</button></div><div class="cart-lines">${items || `<p class="empty-state">Your order is waiting for its first dish.</p>`}</div><div class="summary"><div><span>Subtotal</span><strong>${formatPrice(totals.subtotal)}</strong></div><div><span>Service charge</span><strong>${formatPrice(totals.serviceCharge)}</strong></div><div><span>Taxes</span><strong>${formatPrice(totals.tax)}</strong></div><div class="summary-total"><span>Total</span><strong>${formatPrice(totals.total)}</strong></div></div><button class="primary-action" type="button" data-review-order ${details.length ? "" : "disabled"}>Review order <span aria-hidden="true">&#8594;</span></button></aside>`;
  document.body.appendChild(drawer);
  drawer.querySelectorAll("[data-close-cart]").forEach((element) => element.addEventListener("click", () => drawer.remove()));
  drawer.querySelectorAll("[data-cart-change]").forEach((button) => button.addEventListener("click", () => changeCart(Number(button.dataset.cartId), Number(button.dataset.cartChange), drawer)));
  drawer.querySelector("[data-review-order]")?.addEventListener("click", () => { drawer.remove(); renderBilling(); });
}

function changeCart(itemId, amount, drawer) {
  const cartItem = appState.cart.find((item) => item.id === itemId);
  if (!cartItem) return;
  cartItem.quantity += amount;
  appState.cart = appState.cart.filter((item) => item.quantity > 0);
  persistCart();
  drawer.remove();
  renderMenu();
  renderCartDrawer();
}

function renderBilling() {
  const totals = getTotals();
  const items = getCartDetails().map((cartItem) => `<div><span>${cartItem.quantity} × ${cartItem.item.name}</span><strong>${formatPrice(cartItem.item.price * cartItem.quantity)}</strong></div>`).join("");
  app.innerHTML = `<section class="billing-view" aria-labelledby="billing-title"><div class="billing-copy"><p class="eyebrow">Step 03 / Review and send</p><h1 id="billing-title">Nearly ready for the table.</h1><p class="intro-description">Review your order, add a name for the table, and choose how you’d like to settle the bill.</p><button class="text-button" type="button" data-back-menu>← Back to menu</button></div><form class="billing-form" data-billing-form novalidate><div class="order-summary"><div class="summary-heading"><span>Table ${appState.selectedTable}</span><span>${getCartDetails().length} dishes</span></div>${items}<div class="summary-total"><span>Total</span><strong>${formatPrice(totals.total)}</strong></div></div><label for="guest-name">Name for the order</label><input id="guest-name" name="guestName" type="text" placeholder="e.g. Aisha" required><label for="guest-note">Note for the kitchen <span>(optional)</span></label><textarea id="guest-note" name="note" rows="3" placeholder="Allergies or special requests"></textarea><fieldset><legend>Payment method</legend><label class="payment-option"><input type="radio" name="payment" value="at-table" checked><span><strong>Pay at the table</strong><small>Use a card machine when you’re ready.</small></span></label><label class="payment-option"><input type="radio" name="payment" value="cash"><span><strong>Cash at the table</strong><small>Settle with the service team.</small></span></label><label class="payment-option"><input type="radio" name="payment" value="online"><span><strong>Pay online</strong><small>UPI or card · payment will be connected later.</small></span></label></fieldset><p class="field-message" data-billing-message aria-live="polite"></p><button class="primary-action" type="submit">Place order <span aria-hidden="true">&#8594;</span></button></form></section>`;
  app.querySelector("[data-back-menu]").addEventListener("click", () => renderMenu());
  app.querySelector("[data-billing-form]").addEventListener("submit", handlePlaceOrder);
  app.querySelector("#guest-name").focus();
}

function handlePlaceOrder(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const guestName = form.elements.guestName.value.trim();
  const message = form.querySelector("[data-billing-message]");
  if (!guestName) {
    message.textContent = "Please add a name so the team knows who to call.";
    form.elements.guestName.focus();
    return;
  }
  const totals = getTotals();
  const orderItems = getCartDetails().map((cartItem) => ({
    id: cartItem.item.id,
    name: cartItem.item.name,
    price: cartItem.item.price,
    quantity: cartItem.quantity
  }));
  appState.currentOrder = { id: `RM${Math.floor(1000 + Math.random() * 9000)}`, table: appState.selectedTable, guestName, note: form.elements.note.value.trim(), items: orderItems, subtotal: totals.subtotal, serviceCharge: totals.serviceCharge, tax: totals.tax, total: totals.total, payment: form.elements.payment.value, createdAt: new Date().toISOString(), status: 0 };
  writeStorage(ORDER_STORAGE_KEY, appState.currentOrder);
  appState.cart = [];
  persistCart();
  renderTracking();
}

function renderTracking() {
  const order = appState.currentOrder;
  const orderItems = order.items || [];
  const billItems = orderItems.map((item) => `<div><span>${item.quantity} × ${item.name}</span><strong>${formatPrice(item.price * item.quantity)}</strong></div>`).join("");
  const paymentLabel = order.payment === "cash" ? "Cash at table" : order.payment === "online" ? "Payment pending" : "Pay at table";
  const bill = `<div class="bill-card"><div class="bill-heading"><div><p class="eyebrow">Table ${order.table}</p><h2>Your bill</h2></div><span class="bill-status">${paymentLabel}</span></div><div class="bill-lines">${billItems || `<p class="empty-state">Item details are unavailable for this older order.</p>`}</div><div class="bill-totals"><div><span>Subtotal</span><strong>${formatPrice(order.subtotal || order.total)}</strong></div><div><span>Service charge</span><strong>${formatPrice(order.serviceCharge || 0)}</strong></div><div><span>Taxes</span><strong>${formatPrice(order.tax || 0)}</strong></div><div class="summary-total"><span>Total due</span><strong>${formatPrice(order.total)}</strong></div></div></div>`;
  app.innerHTML = `<section class="tracking-view" aria-labelledby="tracking-title"><div class="tracking-heading"><div><p class="eyebrow">Order ${order.id} · Table ${order.table}</p><h1 id="tracking-title">Your order is with the kitchen.</h1><p class="intro-description">We’ll take care of the rest, ${order.guestName}.</p></div><div class="order-time"><span>Estimated time</span><strong>20–25 min</strong></div></div><div class="tracking-layout"><div class="status-card"><span class="live-dot"></span><strong>Order received</strong><p>Your order has been sent to the kitchen.</p><div class="status-track"><span class="track-fill"></span></div><small>We’ll update this page as your order progresses.</small></div><ol class="timeline"><li class="is-current"><span>01</span><div><strong>Order received</strong><p>Your order is confirmed.</p></div></li><li><span>02</span><div><strong>Preparing</strong><p>The kitchen is working on it.</p></div></li><li><span>03</span><div><strong>Ready</strong><p>We’ll let you know when it’s ready.</p></div></li><li><span>04</span><div><strong>Served</strong><p>Enjoy your meal.</p></div></li></ol>${bill}</div><button class="text-button" type="button" data-new-order>+ Add something else</button></section>`;
  app.querySelector("[data-new-order]").addEventListener("click", () => { appState.currentOrder = null; window.localStorage.removeItem(ORDER_STORAGE_KEY); renderMenu(); });
}

function renderWelcome() {
  const options = tableOptions.map((tableNumber) => `<option value="${tableNumber}">${tableNumber}</option>`).join("");
  app.innerHTML = `<div class="welcome-page">
    <section class="welcome-hero" aria-labelledby="foundation-title">
      <div class="welcome-hero-copy">
        <p class="eyebrow">An evening at Bhatti House</p>
        <h1 id="foundation-title">Gather well. Eat slowly.</h1>
        <p class="intro-description">A contemporary Indian kitchen built around the warmth of the tandoor, generous plates, and time well spent at the table.</p>
        <form class="table-form hero-table-form" data-table-form novalidate>
          <div class="hero-form-heading"><span>Begin at your table</span><span>Step 01 / 04</span></div>
          <label for="table-number">Where are you sitting?</label>
          <div class="hero-form-controls"><select id="table-number" name="table-number" required><option value="">Select your table</option>${options}</select><button class="primary-action" type="submit">View the menu <span aria-hidden="true">&#8594;</span></button></div>
          <p class="field-message" data-table-message aria-live="polite"></p>
        </form>
      </div>
      <div class="welcome-hero-image" role="img" aria-label="A beautifully prepared Indian dish served at a restaurant table">
        <div class="hero-image-note"><span class="status-dot" aria-hidden="true"></span><span>Kitchen is open</span></div>
        <span class="visual-caption">Made for the table</span>
      </div>
    </section>
    <section class="restaurant-details" aria-labelledby="details-title">
      <div class="details-heading"><p class="eyebrow">The Bhatti House way</p><h2 id="details-title">From our fire to your table.</h2></div>
      <div class="details-grid"><article><span class="detail-number">01</span><h3>Order at your pace</h3><p>Browse every dish, choose by category, and add to your table without waiting for a server.</p></article><article><span class="detail-number">02</span><h3>Made to be shared</h3><p>Seasonal ingredients, clay-oven cooking, and familiar flavours with a little more intention.</p></article><article><span class="detail-number">03</span><h3>Here when you need us</h3><p>Open today <strong>12:00 PM – 11:00 PM</strong><br>Table service · Dine-in only</p></article></div>
    </section>
  </div>`;
  app.querySelector("[data-table-form]").addEventListener("submit", handleTableSubmit);
  app.querySelector("#table-number").focus();
}

function initialiseApp() {
  if (appState.currentOrder) renderTracking();
  else renderWelcome();
}

initialiseApp();
