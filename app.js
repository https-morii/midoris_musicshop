// Local-only edition: users, products, profiles, and carts are stored in this browser's localStorage.
const USERS_KEY = 'midori_usuarios';
const CURRENT_USER_KEY = 'midori_usuario_logado';
const PRODUCTS_KEY = 'midori_produtos';
const SELECTED_PRODUCT_KEY = 'midori_produto_selecionado';

function readJson(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch (_error) { return fallback; } }
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
  ['home','perfil','configuracoes'].forEach((name) => {
    const section = document.getElementById(name === 'home' ? 'aba-home' : name === 'perfil' ? 'aba-perfil' : 'aba-configuracoes');
    const button = document.getElementById(name === 'home' ? 'menu-home' : name === 'perfil' ? 'menu-perfil' : 'menu-config');
    if (section) section.classList.toggle('hidden', name !== tab);
    if (button) button.classList.toggle('active', name === tab);
  });
  if (tab === 'perfil') loadProfile();
};
window.fazerLogout = function () { localStorage.removeItem(CURRENT_USER_KEY); window.location.href = 'index.html'; };
function initializeAuth() {
  const loginForm = document.getElementById('form-login'), registerForm = document.getElementById('form-register');
  const message = document.getElementById('auth-message'), loginTab = document.getElementById('tab-login'), registerTab = document.getElementById('tab-register');
  loginTab?.addEventListener('click', () => { loginTab.classList.add('active'); registerTab?.classList.remove('active'); loginForm?.classList.add('active'); registerForm?.classList.remove('active'); showMessage(message, ''); });
  registerTab?.addEventListener('click', () => { registerTab.classList.add('active'); loginTab?.classList.remove('active'); registerForm?.classList.add('active'); loginForm?.classList.remove('active'); showMessage(message, ''); });
  registerForm?.addEventListener('submit', (event) => {
    event.preventDefault(); const name = readField('reg-name').trim(), email = readField('reg-email').trim().toLowerCase(), password = readField('reg-password');
    if (password !== readField('reg-confirm-password')) { showMessage(message, 'As senhas não coincidem!'); return; }
    if (password.length < 4) { showMessage(message, 'A senha deve ter pelo menos 4 caracteres.'); return; }
    const users = getUsers();
    if (users.some((user) => user.email.toLowerCase() === email)) { showMessage(message, 'Este e-mail já está cadastrado neste navegador.'); return; }
    const user = { id: makeId(), name, email, password, role: readField('reg-role') || 'comprador', telephone:'', state:'', city:'', neighborhood:'', gender:'' };
    try { users.push(user); saveUsers(users); saveCurrentUser(user); window.location.href = 'loja.html'; } catch (_error) { showMessage(message, 'Não foi possível salvar. O armazenamento do navegador pode estar cheio.'); }
  });
  loginForm?.addEventListener('submit', (event) => {
    event.preventDefault(); const email = readField('login-email').trim().toLowerCase(), password = readField('login-password');
    const user = getUsers().find((item) => item.email.toLowerCase() === email && item.password === password);
    if (!user) { showMessage(message, 'E-mail ou senha incorretos.'); return; }
    saveCurrentUser(user); window.location.href = 'loja.html';
  });
}
function requireLocalUser() { const user = getCurrentUser(); if (!user || !user.id) { window.location.href = 'index.html'; return null; } return user; }
function loadProfile() { const user = getCurrentUser(); if (!user) return; setField('perfil-nome',user.name); setField('perfil-telefone',user.telephone); setField('perfil-estado',user.state); setField('perfil-cidade',user.city); setField('perfil-bairro',user.neighborhood); setField('perfil-genero',user.gender); }
function initializeShop() {
  const user = requireLocalUser(); if (!user) return;
  const badge = document.getElementById('user-badge'); if (badge) badge.innerText = `${user.name} (${user.role.toUpperCase()})`;
  const panel = document.getElementById('seller-panel'); if (panel) panel.style.display = user.role === 'vendedor' ? 'block' : 'none';
  document.getElementById('btn-toggle-add')?.addEventListener('click', () => { document.getElementById('section-add-product')?.classList.toggle('hidden'); document.getElementById('section-my-products')?.classList.add('hidden'); });
  document.getElementById('btn-toggle-my-products')?.addEventListener('click', () => { const section = document.getElementById('section-my-products'); section?.classList.toggle('hidden'); document.getElementById('section-add-product')?.classList.add('hidden'); renderProducts(); });
  document.getElementById('form-add-product')?.addEventListener('submit', (event) => {
    event.preventDefault(); const form = event.currentTarget, input = document.getElementById('prod-image-file'), file = input && input.files && input.files[0];
    if (!file) { alert('Por favor, selecione uma imagem.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Para salvar no navegador, a imagem deve ter no máximo 2 MB.'); return; }
    const reader = new FileReader(); reader.onerror = () => alert('Não foi possível ler a imagem.');
    reader.onload = () => { try { const products = getProducts(); products.unshift({ id:makeId(),name:readField('prod-name').trim(),price:Number(readField('prod-price')),category:readField('prod-category').trim(),image:reader.result,sellerId:user.id }); saveProducts(products); form.reset(); renderProducts(); alert('Produto anunciado com sucesso!'); } catch (_error) { alert('Não foi possível salvar o produto. A imagem pode ser grande demais para o armazenamento do navegador.'); } };
    reader.readAsDataURL(file);
  });
  document.getElementById('form-alterar-perfil')?.addEventListener('submit', (event) => {
    event.preventDefault(); const users=getUsers(), index=users.findIndex((item)=>item.id===user.id); if(index<0){alert('Conta não encontrada.');return;}
    Object.assign(users[index],{name:readField('perfil-nome').trim(),telephone:readField('perfil-telefone').trim(),state:readField('perfil-estado').trim(),city:readField('perfil-cidade').trim(),neighborhood:readField('perfil-bairro').trim(),gender:readField('perfil-genero')});
    try { saveUsers(users); saveCurrentUser(users[index]); if(badge)badge.innerText=`${users[index].name} (${users[index].role.toUpperCase()})`; alert('Perfil atualizado!'); } catch(_error){alert('Não foi possível salvar as alterações.');}
  });
  document.getElementById('form-trocar-senha')?.addEventListener('submit',(event)=>{
    event.preventDefault(); const users=getUsers(), index=users.findIndex((item)=>item.id===user.id), next=readField('senha-nova');
    if(index<0||users[index].password!==readField('senha-atual')){alert('A senha atual está incorreta.');return;} if(next.length<4){alert('A nova senha deve ter pelo menos 4 caracteres.');return;} if(next!==readField('senha-nova-confirmacao')){alert('As novas senhas não coincidem!');return;}
    users[index].password=next; saveUsers(users); saveCurrentUser(users[index]); event.currentTarget.reset(); alert('Senha alterada com sucesso!');
  });
  document.getElementById('form-excluir-conta')?.addEventListener('submit',(event)=>{
    event.preventDefault(); if(!confirm('Tem certeza? Sua conta, anúncios e carrinho neste navegador serão excluídos.'))return;
    const users=getUsers(),index=users.findIndex((item)=>item.id===user.id); if(index<0||users[index].password!==readField('senha-excluir')){alert('Senha incorreta.');return;}
    saveUsers(users.filter((item)=>item.id!==user.id)); saveProducts(getProducts().filter((product)=>product.sellerId!==user.id)); localStorage.removeItem(cartKey(user.id)); window.fazerLogout();
  });
  renderProducts(); updateCart();
}
function renderProducts() {
  const products=getProducts(),user=getCurrentUser(),list=document.getElementById('product-list'),myList=document.getElementById('my-products-list');
  if(list)list.innerHTML=products.length?products.map((p)=>{const owns=user&&user.id===p.sellerId;return `<div class="product-card"><img src="${escapeHtml(p.image||'')}" alt="${escapeHtml(p.name)}"><h3>${escapeHtml(p.name)}</h3><p>R$ ${money(p.price)}</p><button onclick="irParaDetalhes('${encodeURIComponent(p.id)}')">Ver Detalhes</button>${owns?`<button onclick="removerProduto('${encodeURIComponent(p.id)}')" style="margin-top:5px;background:#c83e59;color:white">Excluir Anúncio</button>`:''}</div>`;}).join(''):'<p class="empty-msg">Nenhum produto anunciado neste navegador.</p>';
  if(myList){const mine=products.filter((p)=>user&&user.id===p.sellerId);myList.innerHTML=mine.length?mine.map((p)=>`<div class="product-card"><img src="${escapeHtml(p.image||'')}" alt="${escapeHtml(p.name)}"><h3>${escapeHtml(p.name)}</h3><p>R$ ${money(p.price)}</p><button onclick="removerProduto('${encodeURIComponent(p.id)}')" style="background:#c83e59;color:white">Excluir Anúncio</button></div>`).join(''):'<p class="empty-msg">Você ainda não anunciou produtos.</p>';}
}
window.irParaDetalhes=function(id){localStorage.setItem(SELECTED_PRODUCT_KEY,decodeURIComponent(id));window.location.href='produto.html';};
window.removerProduto=function(encodedId){const user=requireLocalUser();if(!user||!confirm('Excluir este anúncio?'))return;const id=decodeURIComponent(encodedId),product=getProducts().find((p)=>p.id===id);if(!product||product.sellerId!==user.id){alert('Você só pode excluir seus próprios anúncios.');return;}saveProducts(getProducts().filter((p)=>p.id!==id));renderProducts();};
function updateCart(){
  const user=getCurrentUser(),itemsEl=document.getElementById('cart-items');if(!user||!itemsEl)return;
  const products=getProducts(),cart=getCart(user.id).filter((item)=>products.some((p)=>p.id===item.productId));saveCart(user.id,cart);
  const detailed=cart.map((item)=>({item,product:products.find((p)=>p.id===item.productId)})),count=document.getElementById('cart-count'),total=document.getElementById('cart-total'),finish=document.getElementById('btn-finalizar');
  if(count)count.innerText=String(cart.reduce((sum,item)=>sum+item.quantity,0));if(total)total.innerText=money(detailed.reduce((sum,e)=>sum+e.product.price*e.item.quantity,0));if(finish)finish.style.display=cart.length?'block':'none';
  itemsEl.innerHTML=detailed.length?detailed.map(({item,product})=>`<li style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span>${escapeHtml(product.name)} (x${item.quantity}) - R$ ${money(product.price*item.quantity)}</span><button onclick="removerItemCarrinho('${encodeURIComponent(product.id)}')" title="Remover item">Remover</button></li>`).join(''):'<li>O carrinho está vazio!</li>';
}
window.adicionarAoCarrinho=function(encodedId){changeCart(encodedId,true,false);};
window.adicionarAoCarrinhoERetornar=function(encodedId){changeCart(encodedId,true,true);};
function changeCart(encodedId,add,redirect){
  const user=requireLocalUser();if(!user)return;const id=decodeURIComponent(encodedId),product=getProducts().find((p)=>p.id===id);if(!product){alert('Produto não encontrado.');return;}if(product.sellerId===user.id){alert('Você não pode adicionar seu próprio produto ao carrinho.');return;}
  const cart=getCart(user.id),existing=cart.find((item)=>item.productId===id);if(existing)existing.quantity+=1;else cart.push({productId:id,quantity:1});
  try{saveCart(user.id,cart);if(redirect)window.location.href='loja.html';else{updateCart();alert('Produto adicionado ao carrinho!');}}catch(_error){alert('Não foi possível salvar o carrinho no navegador.');}
}
window.removerItemCarrinho=function(encodedId){const user=getCurrentUser();if(!user)return;const id=decodeURIComponent(encodedId);saveCart(user.id,getCart(user.id).filter((item)=>item.productId!==id));updateCart();};
window.finalizarCompra=function(){const user=getCurrentUser();if(!user)return;if(!getCart(user.id).length){alert('O seu carrinho está vazio!');return;}if(!confirm('Esvaziar o carrinho? A compra/pagamento real não está implementada.'))return;saveCart(user.id,[]);updateCart();alert('Carrinho esvaziado. Nenhum pagamento foi realizado.');};
function initializeProductPage(){
  const container=document.getElementById('detalhe-produto'),id=localStorage.getItem(SELECTED_PRODUCT_KEY);if(!container||!id){if(container)container.innerHTML='<p class="empty-msg">Produto não encontrado.</p>';return;}
  const p=getProducts().find((item)=>item.id===id);if(!p){container.innerHTML='<p class="empty-msg">Produto não encontrado.</p>';return;}const user=getCurrentUser(),owns=user&&user.id===p.sellerId;
  const action=owns?'<p style="margin-top:15px;font-weight:bold">Este produto é seu. Você não pode comprar o próprio anúncio.</p>':`<button onclick="adicionarAoCarrinhoERetornar('${encodeURIComponent(p.id)}')" class="glow-btn">Adicionar ao carrinho</button>`;
  container.innerHTML=`<img src="${escapeHtml(p.image||'')}" alt="${escapeHtml(p.name)}" style="max-width:100%;height:280px;object-fit:cover;border-radius:8px;margin-bottom:20px"><h2>${escapeHtml(p.name)}</h2><p>R$ ${money(p.price)}</p><p>Categoria: ${escapeHtml(p.category)}</p><p>Anunciado por: ${escapeHtml(getUsers().find((u)=>u.id===p.sellerId)?.name||'usuário')}</p>${action}`;
}
document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('form-login'))initializeAuth();if(document.getElementById('user-badge'))initializeShop();if(document.getElementById('detalhe-produto'))initializeProductPage();});
