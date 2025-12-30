/* ===== CART (TEST) ===== */

let SALES_CART = [];

/* تحديث أيقونة السلة */
function updateCartDisplay(){
  const btn   = document.getElementById("cartBtn");
  const count = document.getElementById("cartCount");

  if(!btn || !count) return;

  if(SALES_CART.length > 0){
    btn.style.display = "flex";
    count.textContent = SALES_CART.length;
    count.style.display = "flex";
  }else{
    btn.style.display = "none";
    count.style.display = "none";
  }
}

/* فتح السلة */
function openCart(){
  const existing = document.querySelector(".cart-overlay");
  if(existing) existing.remove();

  const ov = document.createElement("div");
  ov.className = "cart-overlay";

  ov.innerHTML = `
    <div class="cart-card">
      <h3>سلة المبيعات</h3>

      <div class="current-item-profit" style="display:block">
        <div class="current-item-title">Item profit</div>
        <div class="current-item-values">
          <span>Cost: 0.00</span>
          <span>Profit: 0.00</span>
          <span>0%</span>
        </div>
      </div>

      <button onclick="this.closest('.cart-overlay').remove()">إغلاق</button>
    </div>
  `;
  document.body.appendChild(ov);
}

/* تشغيل أولي */
document.addEventListener("DOMContentLoaded", () => {
  SALES_CART = [{ part:"TEST" }];
  updateCartDisplay();
});
