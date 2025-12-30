/* ================== CART FUNCTIONS ================== */

let SALES_CART = [];

/* إضافة للعربة */
function addToCart(item){
  const existing = SALES_CART.find(c => c.part === item.part);
  if(!existing){
    SALES_CART.push({
      ...item,
      cartQty: 1
    });
    showNotification("✓ تم إضافة الصنف للعربة");
    updateCartDisplay();
    runSearchSales();
  }
}

/* حذف من العربة */
function removeFromCart(part){
  SALES_CART = SALES_CART.filter(c => c.part !== part);
  updateCartDisplay();
  const cartOverlay = document.querySelector(".cart-overlay");
  if(cartOverlay) cartOverlay.remove();
  if (typeof runSearchSales === "function") runSearchSales();
}

/* تحديث أيقونة العربة */
function updateCartDisplay(){
  const cartBtn   = document.getElementById("cartBtn");
  const cartCount = document.getElementById("cartCount");
  if(!cartBtn || !cartCount) return;

  if(SALES_CART.length > 0){
    cartBtn.style.display = "flex";
    cartCount.textContent = SALES_CART.length;
    cartCount.style.display = "flex";
  }else{
    cartBtn.style.display = "none";
    cartCount.style.display = "none";
  }
}

/* فتح العربة */
function openCart(){
  if(!SALES_CART.length){
    showNotification("السلة فارغة");
    return;
  }

  const existing = document.querySelector(".cart-overlay");
  if(existing) existing.remove();

  let totalCost = 0;
  let totalNewPrice = 0;

  SALES_CART.forEach(item => {
    const cost = (Number(item.cost) || 0) * item.cartQty;
    const price = (Number(item.cartNewPrice) || Number(item.maxPrice) || 0) * item.cartQty;
    totalCost += cost;
    totalNewPrice += price;
  });

  const totalProfit = totalNewPrice - totalCost;
  const profitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;
  const totalWithTax = totalNewPrice * 1.15;

  const ov = document.createElement("div");
  ov.className = "cart-overlay";
  ov.innerHTML = `
    <div class="cart-card">
      <div class="cart-header">
        <strong>سلة المبيعات</strong>
        <button class="cart-close" onclick="this.closest('.cart-overlay').remove()">✕</button>
      </div>

      ${SALES_CART.map((item,i)=>`
        <div class="cart-row" onclick="selectCartRow('${item.part}')">
          <div><b>${i+1}.</b> ${item.part}</div>
          <input type="number" min="1" value="${item.cartQty}"
            onchange="updateCartQty('${item.part}',this.value)">
          <input type="number" step="0.01"
            value="${(item.cartNewPrice||item.maxPrice||0)}"
            oninput="updateCartNewPrice('${item.part}',this.value,true)">
          <button onclick="event.stopPropagation();removeFromCart('${item.part}')">✕</button>
        </div>
      `).join("")}

      <div class="current-item-profit" id="currentItemProfit">
        <div class="current-item-title">Item profit</div>
        <div class="current-item-values">
          <span id="currentItemCost">Cost: 0</span>
          <span id="currentItemProfitValue">Profit: 0</span>
          <span id="currentItemProfitPercent">0%</span>
        </div>
      </div>

      <div class="cart-totals">
        <div>التكلفة: ${totalCost.toFixed(2)}</div>
        <div>البيع: ${totalNewPrice.toFixed(2)}</div>
        <div>الربح: ${totalProfit.toFixed(2)} (${profitPercent.toFixed(1)}%)</div>
        <div>مع الضريبة: ${totalWithTax.toFixed(2)}</div>
      </div>
    </div>
  `;
  document.body.appendChild(ov);
}

/* تحديد صنف داخل العربة */
function selectCartRow(part){
  updateCurrentItemProfit(part);
}

/* حساب ربح الصنف الحالي */
function updateCurrentItemProfit(part){
  const item = SALES_CART.find(c => c.part === part);
  if(!item) return;

  const cost = Number(item.cost || 0);
  const price = Number(item.cartNewPrice || item.maxPrice || 0);
  const qty = item.cartQty;

  const profitUnit = price - cost;
  const totalProfit = profitUnit * qty;
  const percent = cost > 0 ? (profitUnit / cost) * 100 : 0;

  document.getElementById("currentItemProfit").style.display = "block";
  document.getElementById("currentItemCost").textContent = "Cost: " + cost.toFixed(2);
  document.getElementById("currentItemProfitValue").textContent = "Profit: " + totalProfit.toFixed(2);
  document.getElementById("currentItemProfitPercent").textContent = percent.toFixed(1) + "%";
}

/* تغيير الكمية */
function updateCartQty(part, qty){
  const item = SALES_CART.find(c => c.part === part);
  if(!item) return;
  item.cartQty = Math.max(1, parseInt(qty));
  openCart();
}

/* تحديث السعر */
function updateCartNewPrice(part, price, live=false){
  const item = SALES_CART.find(c => c.part === part);
  if(!item) return;
  item.cartNewPrice = Math.max(0, parseFloat(price||0));
  updateCurrentItemProfit(part);
  if(!live) openCart();
}
