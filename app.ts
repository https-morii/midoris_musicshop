// Local-only edition: users, products, profiles, and carts are stored in this browser's localStorage.
const USERS_KEY = 'midori_usuarios';
const CURRENT_USER_KEY = 'midori_usuario_logado';
const PRODUCTS_KEY = 'midori_produtos';
const SELECTED_PRODUCT_KEY = 'midori_produto_selecionado';

function readJson(key, fallback) {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch (_error) { return fallback; }
}
function getUsers() { const users = readJson(USERS_KEY, []); return Array.isArray(users) ? users : []; }
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
function getProducts() { const products = readJson(PRODUCTS_KEY, []); return Array.isArray(products) ? products : []; }
function saveProducts(products) { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }
function getCurrentUser() { return readJson(CURRENT_USER_KEY, null); }
function saveCurrentUser(user) { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user)); }
function cartKey(userId) { return `midori_carrinho_${userId}`; }
function getCart(userId) { const cart = readJson(cartKey(userId), []); return Array.isArray(cart) ? cart : []; }
function saveCart(userId, cart) { localStorage.setItem(cartKey(userId), JSON.stringify(cart)); }
function showMessage(element, message) { if (element) element.innerText = message; }
function escapeHtml(value) { return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }
function money(value) { return Number(value || 0).toFixed(2); }
function readField(id) { const element = document.getElementById(id); return element ? element.value : ''; }
function setField(id, value) { const element = document.getElementById(id); if (element) element.value = value || ''; }
function makeId() { return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`; }

window.mudarAba = function (tab) {
  ['home', 'perfil', 'configuracoes'].forEach((name) => {
    const section = document.getElementById(name === 'home' ? 'aba-home' : name === 'perfil' ? 'aba-perfil' : 'aba-configuracoes');
    const button = document.getElementById(name === 'home' ? 'menu-home' : name === 'perfil' ? 'menu-perfil' : 'menu-config');
    if (section) section.classList.toggle('hidden', name !== tab);
    if (button) button.classList.toggle('active', name === tab);
  });
  if (tab === 'perfil') loadProfile();
};
window.fazerLogout = function () { localStorage.removeItem(CURRENT_USER_KEY); window.location.href = 'index.html'; };

function initializeAuth() {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const message = document.getElementById('auth-message');
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  loginTab?.addEventListener('click', () => { loginTab.classList.add('active'); registerTab?.classList.remove('active'); loginForm?.classList.add('active'); registerForm?.classList.remove('active'); showMessage(message, ''); });
  registerTab?.addEventListener('click', () => { registerTab.classList.add('active'); loginTab?.classList.remove('active'); registerForm?.classList.add('active'); loginForm?.classList.remove('active'); showMessage(message, ''); });

  registerForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = readField('reg-name').trim();
    const email = readField('reg-email').trim().toLowerCase();
    const password = readField('reg-password');
    if (password !== readField('reg-confirm-password')) { showMessage(message, 'As senhas não coincidem!'); return; }
    if (password.length < 4) { showMessage(message, 'A senha deve ter pelo menos 4 caracteres.'); return; }
    const users = getUsers();
    if (users.some((user) => user.email.toLowerCase() === email)) { showMessage(message, 'Este e-mail já está cadastrado neste navegador.'); return; }
    const user = { id: makeId(), name, email, password, role: readField('reg-role') || 'comprador', telephone: '', state: '', city: '', neighborhood: '', gender: '' };
    try { users.push(user); saveUsers(users); saveCurrentUser(user); window.location.href = 'loja.html'; }
    catch (_error) { showMessage(message, 'Não foi possível salvar. O armazenamento do navegador pode estar cheio.'); }
  });

  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = readField('login-email').trim().toLowerCase();
    const password = readField('login-password');
    const user = getUsers().find((item) => item.email.toLowerCase() === email && item.password === password);
    if (!user) { showMessage(message, 'E-mail ou senha incorretos.'); return; }
    saveCurrentUser(user);
    window.location.href = 'loja.html';
  });
}

function requireLocalUser() {
  const user = getCurrentUser();
  if (!user || !user.id) { window.location.href = 'index.html'; return null; }
  return user;
}
function loadProfile() {
  const user = getCurrentUser();
  if (!user) return;
  setField('perfil-nome', user.name);
  setField('perfil-telefone', user.telephone);
  setField('perfil-estado', user.state);
  setField('perfil-cidade', user.city);
  setField('perfil-bairro', user.neighborhood);
  setField('perfil-genero', user.gender);
}

function initializeShop() {
  const user = requireLocalUser();
  if (!user) return;
  const badge = document.getElementById('user-badge');
  if (badge) badge.innerText = `${user.name} (${user.role.toUpperCase()})`;
  const sellerPanel = document.getElementById('seller-panel');
  if (sellerPanel) sellerPanel.style.display = user.role === 'vendedor' ? 'block' : 'none';
  document.getElementById('btn-toggle-add')?.addEventListener('click', () => { document.getElementById('section-add-product')?.classList.toggle('hidden'); document.getElementById('section-my-products')?.classList.add('hidden'); });
  document.getElementById('btn-toggle-my-products')?.addEventListener('click', () => { const section = document.getElementById('section-my-products'); section?.classList.toggle('hidden'); document.getElementById('section-add-product')?.classList.add('hidden'); renderProducts(); });

  document.getElementById('form-add-product')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const input = document.getElementById('prod-image-file');
    const file = input && input.files && input.files[0];
    if (!file) { alert('Por favor, selecione uma imagem.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Para salvar no navegador, a imagem deve ter no máximo 2 MB.'); return; }
    const reader = new FileReader();
    reader.onerror = () => alert('Não foi possível ler a imagem.');
    reader.onload = () => {
      try {
        const products = getProducts();
        products.unshift({ id: makeId(), name: readField('prod-name').trim(), price: Number(readField('prod-price')), category: readField('prod-category').trim(), image: reader.result, sellerId: user.id });
        saveProducts(products);
        form.reset(); renderProducts(); alert('Produto anunciado com sucesso!');
      } catch (_error) { alert('Não foi possível salvar o produto. A imagem pode ser grande demais para o armazenamento do navegador.'); }
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('form-alterar-perfil')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const users = getUsers();
    const index = users.findIndex((item) => item.id === user.id);
    if (index < 0) { alert('Conta não encontrada.'); return; }
    Object.assign(users[index], { name: readField('perfil-nome').trim(), telephone: readField('perfil-telefone').trim(), state: readField('perfil-estado').trim(), city: readField('perfil-cidade').trim(), neighborhood: readField('perfil-bairro').trim(), gender: readField('perfil-genero') });
    try { saveUsers(users); saveCurrentUser(users[index]); if (badge) badge.innerText = `${users[index].name} (${users[index].role.toUpperCase()})`; alert('Perfil atualizado!'); }
    catch (_error) { alert('Não foi possível salvar as alterações.'); }
  });

  document.getElementById('form-trocar-senha')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const users = getUsers();
    const index = users.findIndex((item) => item.id === user.id);
    const nextPassword = readField('senha-nova');
    if (index < 0 || users[index].password !== readField('senha-atual')) { alert('A senha atual está incorreta.'); return; }
    if (nextPassword.length < 4) { alert('A nova senha deve ter pelo menos 4 caracteres.'); return; }
    if (nextPassword !== readField('senha-nova-confirmacao')) { alert('As novas senhas não coincidem!'); return; }
    users[index].password = nextPassword;
    saveUsers(users); saveCurrentUser(users[index]); event.currentTarget.reset(); alert('Senha alterada com sucesso!');
  });

  document.getElementById('form-excluir-conta')?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!confirm('Tem certeza? Sua conta, anúncios e carrinho neste navegador serão excluídos.')) return;
    const users = getUsers();
    const index = users.findIndex((item) => item.id === user.id);
    if (index < 0 || users[index].password !== readField('senha-excluir')) { alert('Senha incorreta.'); return; }
    saveUsers(users.filter((item) => item.id !== user.id));
    saveProducts(getProducts().filter((product) => product.sellerId !== user.id));
    localStorage.removeItem(cartKey(user.id));
    window.fazerLogout();
  });

  renderProducts(); updateCart();
}

function renderProducts() {
  const products = getProducts();
  const user = getCurrentUser();
  const list = document.getElementById('product-list');
  const myList = document.getElementById('my-products-list');
  if (list) list.innerHTML = products.length ? products.map((product) => {
    const owns = user && user.id === product.sellerId;
    return `<div class="product-card"><img src="${escapeHtml(product.image || '')}" alt="${escapeHtml(product.name)}"><h3>${escapeHtml(product.name)}</h3><p>R$ ${money(product.price)}</p><button onclick="irParaDetalhes('${encodeURIComponent(product.id)}')">Ver Detalhes</button>${owns ? `<button onclick="removerProduto('${encodeURIComponent(product.id)}')" style="margin-top:5px;background:#c83e59;color:white">Excluir Anúncio</button>` : ''}</div>`;
  }).join('') : '<p class="empty-msg">Nenhum produto anunciado neste navegador.</p>';
  if (myList) {
    const mine = products.filter((product) => user && user.id === product.sellerId);
    myList.innerHTML = mine.length ? mine.map((product) => `<div class="product-card"><img src="${escapeHtml(product.image || '')}" alt="${escapeHtml(product.name)}"><h3>${escapeHtml(product.name)}</h3><p>R$ ${money(product.price)}</p><button onclick="removerProduto('${encodeURIComponent(product.id)}')" style="background:#c83e59;color:white">Excluir Anúncio</button></div>`).join('') : '<p class="empty-msg">Você ainda não anunciou produtos.</p>';
  }
}
window.irParaDetalhes = function (id) { localStorage.setItem(SELECTED_PRODUCT_KEY, decodeURIComponent(id)); window.location.href = 'produto.html'; };
window.removerProduto = function (encodedId) {
  const user = requireLocalUser();
  if (!user || !confirm('Excluir este anúncio?')) return;
  const id = decodeURIComponent(encodedId);
  const product = getProducts().find((item) => item.id === id);
  if (!product || product.sellerId !== user.id) { alert('Você só pode excluir seus próprios anúncios.'); return; }
  saveProducts(getProducts().filter((item) => item.id !== id)); renderProducts();
};

function updateCart() {
  const user = getCurrentUser();
  const itemsEl = document.getElementById('cart-items');
  if (!user || !itemsEl) return;
  const products = getProducts();
  const cart = getCart(user.id).filter((item) => products.some((product) => product.id === item.productId));
  saveCart(user.id, cart);
  const detailed = cart.map((item) => ({ item, product: products.find((product) => product.id === item.productId) }));
  const count = document.getElementById('cart-count');
  const total = document.getElementById('cart-total');
  const finish = document.getElementById('btn-finalizar');
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = detailed.reduce((sum, entry) => sum + entry.product.price * entry.item.quantity, 0);
  if (count) count.innerText = String(totalItems);
  if (total) total.innerText = money(totalPrice);
  if (finish) finish.style.display = cart.length ? 'block' : 'none';
  itemsEl.innerHTML = detailed.length ? detailed.map(({ item, product }) => `<li style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span>${escapeHtml(product.name)} (x${item.quantity}) - R$ ${money(product.price * item.quantity)}</span><button onclick="removerItemCarrinho('${encodeURIComponent(product.id)}')" title="Remover item">Remover</button></li>`).join('') : '<li>O carrinho está vazio!</li>';
}
window.adicionarAoCarrinho = function (encodedId) {
  const user = requireLocalUser();
  if (!user) return;
  const id = decodeURIComponent(encodedId);
  const product = getProducts().find((item) => item.id === id);
  if (!product) { alert('Produto não encontrado.'); return; }
  if (product.sellerId === user.id) { alert('Você não pode adicionar seu próprio produto ao carrinho.'); return; }
  const cart = getCart(user.id);
  const existing = cart.find((item) => item.productId === id);
  if (existing) existing.quantity += 1; else cart.push({ productId: id, quantity: 1 });
  try { saveCart(user.id, cart); updateCart(); alert('Produto adicionado ao carrinho!'); }
  catch (_error) { alert('Não foi possível salvar o carrinho no navegador.'); }
};
window.adicionarAoCarrinhoERetornar = function (encodedId) {
  const user = requireLocalUser();
  if (!user) return;
  const id = decodeURIComponent(encodedId);
  const product = getProducts().find((item) => item.id === id);
  if (!product) { alert('Produto não encontrado.'); return; }
  if (product.sellerId === user.id) { alert('Você não pode adicionar seu próprio produto ao carrinho.'); return; }
  const cart = getCart(user.id);
  const existing = cart.find((item) => item.productId === id);
  if (existing) existing.quantity += 1; else cart.push({ productId: id, quantity: 1 });
  try { saveCart(user.id, cart); window.location.href = 'loja.html'; }
  catch (_error) { alert('Não foi possível salvar o carrinho no navegador.'); }
};
window.removerItemCarrinho = function (encodedId) {
  const user = getCurrentUser();
  if (!user) return;
  const id = decodeURIComponent(encodedId);
  saveCart(user.id, getCart(user.id).filter((item) => item.productId !== id)); updateCart();
};
window.finalizarCompra = function () {
  const user = getCurrentUser();
  if (!user) return;
  if (!getCart(user.id).length) { alert('O seu carrinho está vazio!'); return; }
  if (!confirm('Esvaziar o carrinho? A compra/pagamento real não está implementada.')) return;
  saveCart(user.id, []); updateCart(); alert('Carrinho esvaziado. Nenhum pagamento foi realizado.');
};

function initializeProductPage() {
  const container = document.getElementById('detalhe-produto');
  const id = localStorage.getItem(SELECTED_PRODUCT_KEY);
  if (!container || !id) { if (container) container.innerHTML = '<p class="empty-msg">Produto não encontrado.</p>'; return; }
  const product = getProducts().find((item) => item.id === id);
  if (!product) { container.innerHTML = '<p class="empty-msg">Produto não encontrado.</p>'; return; }
  const user = getCurrentUser();
  const owns = user && user.id === product.sellerId;
  const action = owns ? '<p style="margin-top:15px;font-weight:bold">Este produto é seu. Você não pode comprar o próprio anúncio.</p>' : `<button onclick="adicionarAoCarrinhoERetornar('${encodeURIComponent(product.id)}')" class="glow-btn">Adicionar ao carrinho</button>`;
  container.innerHTML = `<img src="${escapeHtml(product.image || '')}" alt="${escapeHtml(product.name)}" style="max-width:100%;height:280px;object-fit:cover;border-radius:8px;margin-bottom:20px"><h2>${escapeHtml(product.name)}</h2><p>R$ ${money(product.price)}</p><p>Categoria: ${escapeHtml(product.category)}</p><p>Anunciado por: ${escapeHtml(getUsers().find((item) => item.id === product.sellerId)?.name || 'usuário')}</p>${action}`;
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('form-login')) initializeAuth();
  if (document.getElementById('user-badge')) initializeShop();
  if (document.getElementById('detalhe-produto')) initializeProductPage();
});
