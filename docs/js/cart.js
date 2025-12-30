/* ================== CONFIG ================== */
const API_URL =
  "https://script.google.com/macros/s/AKfycbwJblWxDTa3sOUQQwm5xoX3Cua6ixm0nFPHuXqRGRU7I0iP4d86vVIdWrXJP2ei8_km/exec";

/* ================== SAFE GUARDS ================== */
if (typeof showNotification !== "function") {
  function showNotification(msg) {
    console.log("[NOTIFY]", msg);
  }
}

/* ================== STATE ================== */
let SALES_CART = [];
let ALL_ITEMS = [];

/* ================== FETCH DATA ================== */
async function fetchSales() {
  try {
    const res = await fetch(API_URL + "?mode=sales");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("API ERROR:", err);
    return [];
  }
}

/* ================== INIT ================== */
document.addEventListener("DOMContentLoaded", async () => {
  ALL_ITEMS = await fetchSales();
  renderResults(ALL_ITEMS);
  updateCartDisplay();
});

/* ================== RENDER ================== */
function renderResults(items) {
  const box = document.getElementById("results");
  if (!box) return;

  if (!items.length) {
    box.innerHTML = "<p style='text-align:center'>لا توجد بيانات</p>";
    return;
  }

  box.innerHTML = items
    .map(
      (item) => `
    <div class="product-card" style="border:1px solid #ddd;padding:8px;margin:6px;border-radius:8px">
      <div><b>${item.part}</b> - ${item.name}</div>
      <div>الكمية: ${item.qty}</div>
      <div>سعر البيع: ${item.maxPrice}</div>
      <button onclick='addToCart(${encodeURIComponent(
        JSON.stringify(item)
      )})'>
        إضافة للسلة
      </button>
    </div>
  `
    )
    .join("");
}

/* ================== CART ================== */
function addToCart(encodedItem) {
  const item = JSON.parse(decodeURIComponent(encodedItem));
  const existing = SALES_CART.find((c) => c.part === item.part);

  if (!existing) {
    SALES_CART.push({
      ...item,
      cartQty: 1,
      cartNewPrice: item.maxPrice,
    });
    showNotification("تمت الإضافة للسلة");
    updateCartDisplay();
  }
}

function removeFromCart(part) {
  SALES_CART = SALES_CART.filter((c) => c.part !== part);
  updateCartDisplay();
  const ov = document.querySelector(".cart-overlay");
  if (ov) ov.remove();
}

function updateCartDisplay() {
  const btn = document.getElementById("cartBtn");
  const count = document.getElementById("cartCount");
  if (!btn || !count) return;

  if (SALES_CART.length) {
    btn.style.display = "flex";
    count.style.display = "flex";
    count.textContent = SALES_CART.length;
  } else {
    btn.style.display = "none";
    count.style.display = "none";
  }
}

/* ================== CART UI ================== */
function openCart() {
  if (!SALES_CART.length) {
    showNotification("السلة فارغة");
    return;
  }

  const old = document.querySelector(".cart-overlay");
  if (old) old.remove();

  let totalCost = 0;
  let totalSale = 0;

  SALES_CART.forEach((i) => {
    totalCost += i.cost * i.cartQty;
    totalSale += i.cartNewPrice * i.cartQty;
  });

  const profit = totalSale - totalCost;
  const vatTotal = totalSale * 1.15;

  const ov = document.createElement("div");
  ov.className = "cart-overlay";
  ov.innerHTML = `
    <div class="cart-card">
      <h3>سلة المبيعات</h3>

      ${SALES_CART.map(
        (i) => `
        <div style="margin-bottom:6px">
          <b>${i.part}</b> - ${i.name}<br>
          Qty:
          <input type="number" min="1" value="${i.cartQty}"
            onchange="updateQty('${i.part}',this.value)">
          Price:
          <input type="number" value="${i.cartNewPrice}"
            onchange="updatePrice('${i.part}',this.value)">
          <button onclick="removeFromCart('${i.part}')">✕</button>
        </div>
      `
      ).join("")}

      <hr>
      <div>التكلفة: ${totalCost.toFixed(2)}</div>
      <div>البيع: ${totalSale.toFixed(2)}</div>
      <div>الربح: ${profit.toFixed(2)}</div>
      <div>الإجمالي مع الضريبة: ${vatTotal.toFixed(2)}</div>

      <button onclick="this.closest('.cart-overlay').remove()">إغلاق</button>
    </div>
  `;

  document.body.appendChild(ov);
}

/* ================== UPDATE ================== */
function updateQty(part, qty) {
  const item = SALES_CART.find((i) => i.part === part);
  if (!item) return;
  item.cartQty = Math.max(1, Number(qty));
  openCart();
}

function updatePrice(part, price) {
  const item = SALES_CART.find((i) => i.part === part);
  if (!item) return;
  item.cartNewPrice = Math.max(0, Number(price));
  openCart();
}
