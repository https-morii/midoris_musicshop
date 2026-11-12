// Plain JavaScript syntax is intentional so this file can also be compiled as app.ts.
const TOKEN_KEY = 'midori_access_token';
const SELECTED_PRODUCT_KEY = 'midori_produto_selecionado';

function apiBaseUrl() {
  if (window.MIDORI_API_URL) return window.MIDORI_API_URL.replace(/\/$/, '');
  let host = window.location.hostname;
  if (host.includes('-8000.')) host = host.replace('-8000.', '-3000.');
  const port = (host === 'localhost' || host === '127.0.0.1') && window.location.port === '8000' ? ':3000' : '';
  return `${window.location.protocol}//${host}${port}/api`;
}

async function apiRequest(path, options) {
  const requestOptions = options || {};
  const headers = Object.assign({ 'Content-Type': 'application/json' }, requestOptions.headers || {});
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, Object.assign({}, requestOptions, { headers }));
  } catch (_error) {
    throw new Error(`Não foi possível acessar a API em ${apiBaseUrl()}. Verifique se o backend está rodando e se a porta 3000 está encaminhada.`);
  }
  const text = await response.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch (_error) { data = text; }
  if (!response.ok) {
    const message = data && (data.message || data.error);
    throw new Error(Array.isArray(message) ? message.join(' ') : (message || `Erro HTTP ${response.status}`));
  }
  return data;
}

function showMessage(element, message) { if (element) element.innerText = message; }
function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}
function money(value) { return Number(value || 0).toFixed(2); }
function getToken() { return localStorage.getItem(TOKEN_KEY); }
function saveSession(session) {
  localStorage.setItem(TOKEN_KEY, session.accessToken);
  localStorage.setItem('midori_usuario_logado', JSON.stringify(session.user));
}
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('midori_usuario_logado') || 'null'); }
  catch (_error) { return null; }
}

window.mudarAba = function (tab) {
  ['home', 'perfil', 'configuracoes'].forEach((name) => {
    const section = document.getElementById(name === 'home' ? 'aba-home' : name === 'perfil' ? 'aba-perfil' : 'aba-configuracoes');
    const button = document.getElementById(name === 'home' ? 'menu-home' : name === 'perfil' ? 'menu-perfil' : 'menu-config');
    if (section) section.classList.toggle('hidden', name !== tab);
    if (button) button.classList.toggle('active', name === tab);
  });
  if (tab === 'perfil') loadProfile();
};
window.fazerLogout = function () {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('midori_usuario_logado');
  window.location.href = 'index.html';
};

async function initializeAuth() {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const message = document.getElementById('auth-message');
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  loginTab?.addEventListener('click', () => {
    loginTab.classList.add('active'); registerTab?.classList.remove('active');
    loginForm?.classList.add('active'); registerForm?.classList.remove('active'); showMessage(message, '');
  });
  registerTab?.addEventListener('click', () => {
    registerTab.classList.add('active'); loginTab?.classList.remove('active');
    registerForm?.classList.add('active'); loginForm?.classList.remove('active'); showMessage(message, '');
  });
  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage(message, 'Criando conta…');
    const password = document.getElementById('reg-password').value;
    if (password !== document.getElementById('reg-confirm-password').value) { showMessage(message, 'As senhas não coincidem!'); return; }
    try {
      const session = await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify({
        name: document.getElementById('reg-name').value.trim(),
        email: document.getElementById('reg-email').value.trim(), password,
        role: document.getElementById('reg-role').value
      }) });
      saveSession(session);
      window.location.href = 'loja.html';
    } catch (error) { showMessage(message, error.message); }
  });
  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault(); showMessage(message, 'Entrando…');
    try {
      const session = await apiRequest('/auth/login', { method: 'POST', body: JSON.stringify({
        email: document.getElementById('login-email').value.trim(),
        password: document.getElementById('login-password').value
      }) });
      saveSession(session); window.location.href = 'loja.html';
    } catch (error) { showMessage(message, error.message); }
  });
}

async function requireSession() {
  if (!getToken()) { window.location.href = 'index.html'; return null; }
  try {
    const profile = await apiRequest('/auth/me');
    localStorage.setItem('midori_usuario_logado', JSON.stringify(profile));
    return profile;
  } catch (_error) { window.fazerLogout(); return null; }
}

async function initializeShop() {
  const user = await requireSession();
  if (!user) return;
  const badge = document.getElementById('user-badge');
  if (badge) badge.innerText = `${user.name} (${user.role.toUpperCase()})`;
  const sellerPanel = document.getElementById('seller-panel');
  if (sellerPanel) sellerPanel.style.display = user.role === 'vendedor' ? 'block' : 'none';
  document.getElementById('btn-toggle-add')?.addEventListener('click', () => {
    document.getElementById('section-add-product')?.classList.toggle('hidden');
    document.getElementById('section-my-products')?.classList.add('hidden');
  });
  document.getElementById('btn-toggle-my-products')?.addEventListener('click', async () => {
    const section = document.getElementById('section-my-products');
    section?.classList.toggle('hidden');
    document.getElementById('section-add-product')?.classList.add('hidden');
    await renderProducts();
  });
  document.getElementById('form-add-product')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const imageInput = document.getElementById('prod-image-file');
    const file = imageInput.files && imageInput.files[0];
    if (!file) { alert('Por favor, selecione uma imagem.'); return; }
    if (file.size > 3 * 1024 * 1024) { alert('A imagem deve ter no máximo 3 MB.'); return; }
    try {
      const imageUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        reader.readAsDataURL(file);
      });
      await apiRequest('/products', { method: 'POST', body: JSON.stringify({
        name: document.getElementById('prod-name').value.trim(),
        price: Number(document.getElementById('prod-price').value),
        category: document.getElementById('prod-category').value.trim(), imageUrl
      }) });
      form.reset(); await renderProducts(); alert('Produto anunciado com sucesso!');
    } catch (error) { alert(error.message); }
  });
  document.getElementById('form-alterar-perfil')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    try {
      const updated = await apiRequest('/auth/me', { method: 'PATCH', body: JSON.stringify({
        name: document.getElementById('perfil-nome').value.trim(),
        telephone: document.getElementById('perfil-telefone').value.trim(),
        state: document.getElementById('perfil-estado').value.trim(),
        city: document.getElementById('perfil-cidade').value.trim(),
        neighborhood: document.getElementById('perfil-bairro').value.trim(),
        gender: document.getElementById('perfil-genero').value
      }) });
      localStorage.setItem('midori_usuario_logado', JSON.stringify(updated));
      if (badge) badge.innerText = `${updated.name} (${updated.role.toUpperCase()})`;
      alert('Perfil atualizado com sucesso!');
    } catch (error) { alert(error.message); }
  });
  document.getElementById('form-trocar-senha')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const newPassword = document.getElementById('senha-nova').value;
    if (newPassword !== document.getElementById('senha-nova-confirmacao').value) { alert('As novas senhas não coincidem!'); return; }
    try {
      await apiRequest('/auth/me/password', { method: 'PATCH', body: JSON.stringify({ currentPassword: document.getElementById('senha-atual').value, newPassword }) });
      event.currentTarget.reset(); alert('Senha alterada com sucesso!');
    } catch (error) { alert(error.message); }
  });
  document.getElementById('form-excluir-conta')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!confirm('Tem certeza? Sua conta e seus anúncios serão excluídos.')) return;
    try {
      await apiRequest('/auth/me', { method: 'DELETE', body: JSON.stringify({ password: document.getElementById('senha-excluir').value }) });
      window.fazerLogout();
    } catch (error) { alert(error.message); }
  });
  await Promise.all([renderProducts(), updateCart()]);
}

async function loadProfile() {
  try {
    const user = await apiRequest('/auth/me');
    const fields = { 'perfil-nome': user.name, 'perfil-telefone': user.telephone, 'perfil-estado': user.state,
      'perfil-cidade': user.city, 'perfil-bairro': user.neighborhood, 'perfil-genero': user.gender };
    Object.keys(fields).forEach((id) => { const element = document.getElementById(id); if (element) element.value = fields[id] || ''; });
  } catch (error) { alert(error.message); }
}

async function renderProducts() {
  try {
    const products = await apiRequest('/products');
    const list = document.getElementById('product-list');
    const myList = document.getElementById('my-products-list');
    const user = getCurrentUser();
    if (list) list.innerHTML = products.length ? products.map((product) => {
      const owns = user && Number(user.id) === Number(product.sellerId);
      return `<div class="product-card"><img src="${escapeHtml(product.imageUrl || '')}" alt="${escapeHtml(product.name)}"><h3>${escapeHtml(product.name)}</h3><p>R$ ${money(product.price)}</p><button onclick="irParaDetalhes(${Number(product.id)})">Ver Detalhes</button>${owns ? `<button onclick="removerProduto(${Number(product.id)})" style="margin-top:5px;background:#c83e59;color:white">Excluir Anúncio</button>` : ''}</div>`;
    }).join('') : '<p class="empty-msg">Nenhum produto anunciado no momento.</p>';
    if (myList) {
      const mine = products.filter((product) => user && Number(user.id) === Number(product.sellerId));
      myList.innerHTML = mine.length ? mine.map((product) => `<div class="product-card"><img src="${escapeHtml(product.imageUrl || '')}" alt="${escapeHtml(product.name)}"><h3>${escapeHtml(product.name)}</h3><p>R$ ${money(product.price)}</p><button onclick="removerProduto(${Number(product.id)})" style="background:#c83e59;color:white">Excluir Anúncio</button></div>`).join('') : '<p class="empty-msg">Não há produtos anunciados por enquanto.</p>';
    }
  } catch (error) { showMessage(document.getElementById('product-list'), error.message); }
}
window.irParaDetalhes = function (id) { localStorage.setItem(SELECTED_PRODUCT_KEY, String(id)); window.location.href = 'produto.html'; };
window.removerProduto = async function (id) {
  if (!confirm('Excluir este anúncio?')) return;
  try { await apiRequest(`/products/${id}`, { method: 'DELETE' }); await renderProducts(); alert('Produto removido.'); }
  catch (error) { alert(error.message); }
};

async function updateCart() {
  const itemsEl = document.getElementById('cart-items');
  if (!itemsEl) return;
  try {
    const cart = await apiRequest('/cart');
    const count = document.getElementById('cart-count');
    const total = document.getElementById('cart-total');
    const finish = document.getElementById('btn-finalizar');
    if (count) count.innerText = cart.totalItems;
    if (total) total.innerText = money(cart.total);
    if (finish) finish.style.display = cart.items.length ? 'block' : 'none';
    itemsEl.innerHTML = cart.items.length ? cart.items.map((item) => `<li style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span>${escapeHtml(item.product.name)} (x${item.quantity}) - R$ ${money(item.subtotal)}</span><button onclick="removerItemCarrinho(${Number(item.product.id)})" title="Remover item">Remover</button></li>`).join('') : '<li>O carrinho está vazio!</li>';
  } catch (error) { showMessage(itemsEl, error.message); }
}
window.adicionarAoCarrinho = async function (id) {
  try { await apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId: Number(id), quantity: 1 }) }); await updateCart(); alert('Produto adicionado ao carrinho!'); }
  catch (error) { alert(error.message); }
};
window.adicionarAoCarrinhoERetornar = async function (id) {
  try { await apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId: Number(id), quantity: 1 }) }); window.location.href = 'loja.html'; }
  catch (error) { alert(error.message); }
};
window.removerItemCarrinho = async function (id) {
  try { await apiRequest(`/cart/items/${id}`, { method: 'DELETE' }); await updateCart(); }
  catch (error) { alert(error.message); }
};
window.finalizarCompra = async function () {
  try {
    const cart = await apiRequest('/cart');
    if (!cart.items.length) { alert('O seu carrinho está vazio!'); return; }
    alert('Carrinho limpo. A finalização/pagamento real ainda não está implementada.');
    await apiRequest('/cart', { method: 'DELETE' }); await updateCart();
  } catch (error) { alert(error.message); }
};

async function initializeProductPage() {
  const container = document.getElementById('detalhe-produto');
  const id = localStorage.getItem(SELECTED_PRODUCT_KEY);
  if (!container || !id) { if (container) container.innerHTML = '<p class="empty-msg">Produto não encontrado.</p>'; return; }
  try {
    const product = await apiRequest(`/products/${encodeURIComponent(id)}`);
    const user = getCurrentUser();
    const isOwner = user && Number(user.id) === Number(product.sellerId);
    const action = isOwner ? '<p style="margin-top:15px;font-weight:bold">Este produto é seu. Você não pode comprar o próprio anúncio.</p>'
      : `<button onclick="adicionarAoCarrinhoERetornar(${Number(product.id)})" class="glow-btn">Adicionar ao carrinho</button>`;
    container.innerHTML = `<img src="${escapeHtml(product.imageUrl || '')}" alt="${escapeHtml(product.name)}" style="max-width:100%;height:280px;object-fit:cover;border-radius:8px;margin-bottom:20px"><h2>${escapeHtml(product.name)}</h2><p>R$ ${money(product.price)}</p><p>Categoria: ${escapeHtml(product.category)}</p><p>Anunciado por usuário #${Number(product.sellerId)}</p>${action}`;
  } catch (error) { container.innerHTML = `<p class="empty-msg">${escapeHtml(error.message)}</p>`; }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('form-login')) initializeAuth();
  if (document.getElementById('user-badge')) initializeShop();
  if (document.getElementById('detalhe-produto')) initializeProductPage();
});
