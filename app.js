// Funções para carregar e salvar dados no localStorage
function getUsuarios() {
    const data = localStorage.getItem("midori_usuarios");
    return data ? JSON.parse(data) : [
        { nome: "Vendedor Teste", email: "vendedor@teste.com", senha: "123", role: "vendedor" },
        { nome: "Comprador Teste", email: "comprador@teste.com", senha: "123", role: "comprador" }
    ];
}
function getUsuarioLogado() {
    const data = localStorage.getItem("midori_usuario_logado");
    return data ? JSON.parse(data) : null;
}
function getProdutos() {
    const data = localStorage.getItem("midori_produtos");
    return data ? JSON.parse(data) : [
        { id: 1, nome: "Guitarra Les Paul Verde Neon", preco: 3800, categoria: "Cordas", imagem: "https://via.placeholder.com/150", vendedorEmail: "vendedor@teste.com" }
    ];
}
function getCarrinho() {
    const data = localStorage.getItem("midori_carrinho");
    return data ? JSON.parse(data) : [];
}
function salvarCarrinho(carrinho) {
    localStorage.setItem("midori_carrinho", JSON.stringify(carrinho));
}
function salvarProdutos(produtos) {
    localStorage.setItem("midori_produtos", JSON.stringify(produtos));
}
// LÓGICA DA TELA DE LOJA (`loja.html`)
function inicializarLoja() {
    var _a;
    const usuario = getUsuarioLogado();
    if (!usuario) {
        window.location.href = "index.html";
        return;
    }
    const userBadge = document.getElementById("user-badge");
    const sellerPanel = document.getElementById("seller-panel");
    if (userBadge) {
        userBadge.innerText = `${usuario.nome} (${usuario.role.toUpperCase()})`;
    }
    if (sellerPanel) {
        sellerPanel.style.display = usuario.role === 'vendedor' ? 'block' : 'none';
    }
    renderizarProdutos();
    atualizarCarrinho();
    // Botão Sair
    (_a = document.getElementById("btn-logout")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
        localStorage.removeItem("midori_usuario_logado");
        localStorage.removeItem("midori_carrinho");
        window.location.href = "index.html";
    });
    // Anunciar produto
    const formAddProduct = document.getElementById("form-add-product");
    formAddProduct === null || formAddProduct === void 0 ? void 0 : formAddProduct.addEventListener("submit", (e) => {
        e.preventDefault();
        const nome = document.getElementById("prod-name").value;
        const preco = parseFloat(document.getElementById("prod-price").value);
        const categoria = document.getElementById("prod-category").value;
        const imagem = document.getElementById("prod-image").value;
        const lista = getProdutos();
        lista.push({
            id: Date.now(),
            nome,
            preco,
            categoria,
            imagem,
            vendedorEmail: usuario.email
        });
        salvarProdutos(lista);
        formAddProduct.reset();
        renderizarProdutos();
        alert("Produto anunciado com sucesso!");
    });
}
function renderizarProdutos() {
    const productListEl = document.getElementById("product-list");
    if (!productListEl)
        return;
    const produtos = getProdutos();
    if (produtos.length === 0) {
        productListEl.innerHTML = `<p class="empty-msg">Nenhum produto anunciado no momento.</p>`;
        return;
    }
    productListEl.innerHTML = "";
    produtos.forEach(produto => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>R$ ${produto.preco.toFixed(2)}</p>
      <small style="color: #aaa; margin-bottom: 8px;">Anunciado por: ${produto.vendedorEmail}</small>
      <button onclick="adicionarAoCarrinho(${produto.id})">Comprar</button>
    `;
        productListEl.appendChild(card);
    });
}
window.adicionarAoCarrinho = function (idProduto) {
    const produtos = getProdutos();
    const carrinho = getCarrinho();
    const produtoEncontrado = produtos.find(p => p.id === idProduto);
    if (!produtoEncontrado)
        return;
    const itemExistente = carrinho.find(item => item.produto.id === idProduto);
    if (itemExistente) {
        itemExistente.quantidade += 1;
    }
    else {
        carrinho.push({ produto: produtoEncontrado, quantidade: 1 });
    }
    salvarCarrinho(carrinho);
    atualizarCarrinho();
};
function atualizarCarrinho() {
    const cartCountEl = document.getElementById("cart-count");
    const cartTotalEl = document.getElementById("cart-total");
    const cartItemsEl = document.getElementById("cart-items");
    const carrinho = getCarrinho();
    const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
    const valorTotal = carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);
    if (cartCountEl)
        cartCountEl.innerText = totalItens.toString();
    if (cartTotalEl)
        cartTotalEl.innerText = valorTotal.toFixed(2);
    if (cartItemsEl) {
        cartItemsEl.innerHTML = "";
        if (carrinho.length === 0) {
            cartItemsEl.innerHTML = "<li>O carrinho está vazio.</li>";
            return;
        }
        carrinho.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = `
        <span>${item.produto.nome} (x${item.quantidade})</span>
        <span>R$ ${(item.produto.preco * item.quantidade).toFixed(2)}</span>
      `;
            cartItemsEl.appendChild(li);
        });
    }
}
// LÓGICA TELA DE LOGIN (`index.html`)
function inicializarAuth() {
    const tabLogin = document.getElementById("tab-login");
    const tabRegister = document.getElementById("tab-register");
    const formLogin = document.getElementById("form-login");
    const formRegister = document.getElementById("form-register");
    const authMsg = document.getElementById("auth-message");
    tabLogin === null || tabLogin === void 0 ? void 0 : tabLogin.addEventListener("click", () => {
        tabLogin.classList.add("active");
        tabRegister === null || tabRegister === void 0 ? void 0 : tabRegister.classList.remove("active");
        formLogin === null || formLogin === void 0 ? void 0 : formLogin.classList.add("active");
        formRegister === null || formRegister === void 0 ? void 0 : formRegister.classList.remove("active");
        if (authMsg)
            authMsg.innerText = "";
    });
    tabRegister === null || tabRegister === void 0 ? void 0 : tabRegister.addEventListener("click", () => {
        tabRegister.classList.add("active");
        tabLogin === null || tabLogin === void 0 ? void 0 : tabLogin.classList.remove("active");
        formRegister === null || formRegister === void 0 ? void 0 : formRegister.classList.add("active");
        formLogin === null || formLogin === void 0 ? void 0 : formLogin.classList.remove("active");
        if (authMsg)
            authMsg.innerText = "";
    });
    // Cadastro
    formRegister === null || formRegister === void 0 ? void 0 : formRegister.addEventListener("submit", (e) => {
        e.preventDefault();
        const usuarios = getUsuarios();
        const nome = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const senha = document.getElementById("reg-password").value;
        const role = document.getElementById("reg-role").value;
        if (usuarios.find(u => u.email === email)) {
            if (authMsg)
                authMsg.innerText = "Este e-mail já está cadastrado!";
            return;
        }
        usuarios.push({ nome, email, senha, role });
        localStorage.setItem("midori_usuarios", JSON.stringify(usuarios));
        alert("Conta criada com sucesso! Faça login para continuar.");
        formRegister.reset();
        tabLogin === null || tabLogin === void 0 ? void 0 : tabLogin.click();
    });
    // Login
    formLogin === null || formLogin === void 0 ? void 0 : formLogin.addEventListener("submit", (e) => {
        e.preventDefault();
        const usuarios = getUsuarios();
        const email = document.getElementById("login-email").value;
        const senha = document.getElementById("login-password").value;
        const user = usuarios.find(u => u.email === email && u.senha === senha);
        if (!user) {
            if (authMsg)
                authMsg.innerText = "E-mail ou senha incorretos!";
            return;
        }
        localStorage.setItem("midori_usuario_logado", JSON.stringify(user));
        window.location.href = "loja.html";
    });
}
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("form-login")) {
        inicializarAuth();
    }
    else if (document.getElementById("user-badge")) {
        inicializarLoja();
    }
});
