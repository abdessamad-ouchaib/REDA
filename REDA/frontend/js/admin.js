let TOKEN = localStorage.getItem('reda_admin_token') || null;
let products = [];
let editingId = null;
let pendingImage = ''; // base64 string of the chosen image

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');

// ----- Affichage initial selon présence du token -----
function showDashboard() {
  loginScreen.style.display = 'none';
  dashboard.style.display = 'block';
  loadProducts();
}
function showLogin() {
  dashboard.style.display = 'none';
  loginScreen.style.display = 'flex';
}
if (TOKEN) showDashboard(); else showLogin();

// ----- Connexion -----
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUser').value.trim();
  const password = document.getElementById('loginPass').value;
  const errBox = document.getElementById('loginError');
  errBox.style.display = 'none';

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'فشل تسجيل الدخول');

    TOKEN = data.token;
    localStorage.setItem('reda_admin_token', TOKEN);
    showDashboard();
  } catch (err) {
    errBox.textContent = err.message;
    errBox.style.display = 'block';
  }
});

// ----- Déconnexion -----
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('reda_admin_token');
  TOKEN = null;
  showLogin();
});

// ----- Charger les produits -----
async function loadProducts() {
  const loader = document.getElementById('adminLoader');
  loader.style.display = 'block';
  try {
    const res = await fetch(`${API_BASE_URL}/products`);
    products = await res.json();
    renderTable(products);
  } catch (err) {
    showToast('تعذر تحميل المنتجات', true);
  } finally {
    loader.style.display = 'none';
  }
}

function renderTable(list) {
  const body = document.getElementById('productsTableBody');
  document.getElementById('prodCount').textContent = products.length;

  if (!list.length) {
    body.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:30px;">لا توجد منتجات.</td></tr>`;
    return;
  }

  body.innerHTML = list.map(p => `
    <tr>
      <td>${p.image ? `<img class="row-thumb" src="${p.image}">` : `<div class="row-thumb"></div>`}</td>
      <td><b>${esc(p.name)}</b></td>
      <td>${esc(p.category)}</td>
      <td>${Number(p.price).toFixed(2)} درهم</td>
      <td><span class="badge-stock ${p.inStock ? 'stock-yes' : 'stock-no'}">${p.inStock ? 'متوفر' : 'نفذ'}</span></td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="تعديل" onclick="editProduct('${p._id}')">✏️</button>
          <button class="icon-btn danger" title="حذف" onclick="deleteProduct('${p._id}')">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('');
}

// ----- Recherche -----
document.getElementById('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = products.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  renderTable(filtered);
});

// ----- Upload image -> base64 -----
document.getElementById('productImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast('الصورة كبيرة جدًا، اختر صورة أصغر من 2MB', true);
    e.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    pendingImage = reader.result;
    const preview = document.getElementById('imgPreview');
    preview.src = pendingImage;
    preview.style.display = 'block';
    document.getElementById('imgUploadText').textContent = 'تم اختيار الصورة (اضغط لتغييرها)';
  };
  reader.readAsDataURL(file);
});

// ----- Ajout / modification -----
document.getElementById('productForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'جارٍ الحفظ...';

  const payload = {
    name: document.getElementById('pName').value.trim(),
    category: document.getElementById('pCategory').value,
    price: parseFloat(document.getElementById('pPrice').value),
    unit: document.getElementById('pUnit').value.trim() || 'الوحدة',
    description: document.getElementById('pDescription').value.trim(),
    inStock: document.getElementById('pInStock').checked,
    image: pendingImage
  };

  try {
    const url = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;
    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${TOKEN}` },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'حدث خطأ');

    showToast(editingId ? '✅ تم تعديل المنتج بنجاح' : '✅ تمت إضافة المنتج بنجاح');
    resetForm();
    loadProducts();
  } catch (err) {
    if (err.message.includes('401') || /جلسة|تسجيل الدخول/.test(err.message)) {
      showToast('انتهت الجلسة، الرجاء تسجيل الدخول من جديد', true);
      setTimeout(() => { localStorage.removeItem('reda_admin_token'); TOKEN = null; showLogin(); }, 1200);
    } else {
      showToast(err.message, true);
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'حفظ المنتج';
  }
});

function editProduct(id) {
  const p = products.find(x => x._id === id);
  if (!p) return;
  editingId = id;
  document.getElementById('formTitle').textContent = '✏️ تعديل المنتج';
  document.getElementById('productId').value = id;
  document.getElementById('pName').value = p.name;
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pUnit').value = p.unit || '';
  document.getElementById('pDescription').value = p.description || '';
  document.getElementById('pInStock').checked = p.inStock;
  pendingImage = p.image || '';
  if (pendingImage) {
    document.getElementById('imgPreview').src = pendingImage;
    document.getElementById('imgPreview').style.display = 'block';
    document.getElementById('imgUploadText').textContent = 'تم اختيار الصورة (اضغط لتغييرها)';
  }
  document.getElementById('cancelEditBtn').style.display = 'block';
  document.getElementById('submitBtn').textContent = 'حفظ التعديلات';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('cancelEditBtn').addEventListener('click', resetForm);

function resetForm() {
  editingId = null;
  pendingImage = '';
  document.getElementById('productForm').reset();
  document.getElementById('formTitle').textContent = '➕ إضافة منتج جديد';
  document.getElementById('imgPreview').style.display = 'none';
  document.getElementById('imgUploadText').textContent = 'اضغط لاختيار صورة';
  document.getElementById('cancelEditBtn').style.display = 'none';
  document.getElementById('submitBtn').textContent = 'حفظ المنتج';
}

async function deleteProduct(id) {
  if (!confirm('هل أنتم متأكدون من حذف هذا المنتج؟')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'تعذر الحذف');
    showToast('🗑️ تم حذف المنتج');
    loadProducts();
  } catch (err) {
    showToast(err.message, true);
  }
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (isError ? ' error' : '');
  setTimeout(() => { toast.className = 'toast'; }, 2800);
}

function esc(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
