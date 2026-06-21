const CATEGORY_ICONS = {
  'مواد غذائية': '🥫',
  'منتجات الألبان': '🥛',
  'مواد التنظيف': '🧴',
  'العناية الشخصية': '🧼',
  'حفاضات ومستلزمات الأطفال': '🍼',
  'مشروبات': '🥤',
  'حلويات وبسكويت': '🍪',
  'أخرى': '🛒'
};

let allProducts = [];
let activeCategory = 'الكل';

document.getElementById('year').textContent = new Date().getFullYear();

// ----- Nav toggle (mobile) -----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ----- Scroll reveal -----
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ----- Fetch products from the API -----
async function loadProducts() {
  const loader = document.getElementById('productLoader');
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    if (!res.ok) throw new Error('فشل الاتصال بالخادم');
    allProducts = await res.json();
    loader.style.display = 'none';
    renderCategoryBar();
    renderProducts();
    renderPriceList();
  } catch (err) {
    loader.innerHTML = '⚠️ تعذر تحميل المنتجات حاليًا. تحقق من رابط الخادم في js/config.js';
    console.error(err);
  }
}

function renderCategoryBar() {
  const bar = document.getElementById('catBar');
  const categories = ['الكل', ...new Set(allProducts.map(p => p.category))];
  bar.innerHTML = categories.map(c =>
    `<button class="cat-pill ${c === activeCategory ? 'active' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`
  ).join('');
  bar.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      renderCategoryBar();
      renderProducts();
    });
  });
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const list = activeCategory === 'الكل' ? allProducts : allProducts.filter(p => p.category === activeCategory);

  if (!list.length) {
    grid.innerHTML = `<div class="empty-note" style="grid-column:1/-1;">لا توجد منتجات في هذه الفئة حاليًا.</div>`;
    return;
  }

  grid.innerHTML = list.map(p => `
    <div class="product-card">
      <div class="product-img">
        ${p.image ? `<img src="${p.image}" alt="${esc(p.name)}">` : `<span>${CATEGORY_ICONS[p.category] || '🛒'}</span>`}
      </div>
      <div class="product-body">
        <span class="product-cat">${esc(p.category)}</span>
        <span class="product-name">${esc(p.name)}</span>
        ${p.description ? `<span class="product-desc">${esc(p.description)}</span>` : ''}
        <div class="product-foot">
          <span class="product-price">${Number(p.price).toFixed(2)} <small>درهم / ${esc(p.unit || 'الوحدة')}</small></span>
          <span class="stock-badge ${p.inStock ? 'stock-yes' : 'stock-no'}">${p.inStock ? 'متوفر' : 'نفذ'}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPriceList() {
  const container = document.getElementById('priceList');
  if (!allProducts.length) {
    container.innerHTML = `<div class="empty-note">لا توجد منتجات حاليًا.</div>`;
    return;
  }
  const byCategory = {};
  allProducts.forEach(p => {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  });

  container.innerHTML = Object.entries(byCategory).map(([cat, items]) => `
    <div style="margin-bottom:30px;">
      <div class="tag" style="margin-bottom:14px;">${CATEGORY_ICONS[cat] || '🛒'} ${esc(cat)}</div>
      <div class="contact-card" style="padding:8px 0;">
        ${items.map((p, i) => `
          <div class="info-row" style="${i === items.length - 1 ? 'border-bottom:none;' : ''} padding:12px 22px;">
            <div style="flex:1;">
              <b>${esc(p.name)}</b>
              <span style="display:block;">${esc(p.unit || 'الوحدة')}</span>
            </div>
            <span class="product-price" style="font-size:1.05rem;">${Number(p.price).toFixed(2)} <small>درهم</small></span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ----- Contact form (mailto fallback, no backend mail server required) -----
document.getElementById('contactForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const name = document.getElementById('cName').value.trim();
  const contact = document.getElementById('cContact').value.trim();
  const message = document.getElementById('cMessage').value.trim();
  const subject = encodeURIComponent('رسالة من موقع تغذية عامة رضا');
  const body = encodeURIComponent(`الاسم: ${name}\nمعلومات التواصل: ${contact}\n\nالرسالة:\n${message}`);
  window.location.href = `mailto:contact@reda-store.ma?subject=${subject}&body=${body}`;
});

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  loadProducts();
});
