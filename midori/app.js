"use strict";
function getUsuarios() {
    const data = localStorage.getItem("midori_usuarios");
    if (data)
        return JSON.parse(data);
    const usuariosIniciais = [
        { nome: "Vendedor Teste", email: "vendedor@teste.com", senha: "123", role: "vendedor", cidade: "São Paulo", bairro: "Centro", genero: "Outro" },
        { nome: "Comprador Teste", email: "comprador@teste.com", senha: "123", role: "comprador", cidade: "São Paulo", bairro: "Pinheiros", genero: "Prefiro não informar" }
    ];
    localStorage.setItem("midori_usuarios", JSON.stringify(usuariosIniciais));
    return usuariosIniciais;
}
function salvarUsuarios(usuarios) {
    localStorage.setItem("midori_usuarios", JSON.stringify(usuarios));
}
function getUsuarioLogado() {
    const data = localStorage.getItem("midori_usuario_logado");
    return data ? JSON.parse(data) : null;
}
function salvarUsuarioLogado(usuario) {
    localStorage.setItem("midori_usuario_logado", JSON.stringify(usuario));
}
function getProdutos() {
    const data = localStorage.getItem("midori_produtos");
    return data ? JSON.parse(data) : [];
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
// Controle de abas do painel lateral
window.mudarAba = function (aba) {
    const abaHome = document.getElementById("aba-home");
    const abaPerfil = document.getElementById("aba-perfil");
    const abaConfig = document.getElementById("aba-configuracoes");
    const menuHome = document.getElementById("menu-home");
    const menuPerfil = document.getElementById("menu-perfil");
    const menuConfig = document.getElementById("menu-config");
    abaHome === null || abaHome === void 0 ? void 0 : abaHome.classList.add("hidden");
    abaPerfil === null || abaPerfil === void 0 ? void 0 : abaPerfil.classList.add("hidden");
    abaConfig === null || abaConfig === void 0 ? void 0 : abaConfig.classList.add("hidden");
    menuHome === null || menuHome === void 0 ? void 0 : menuHome.classList.remove("active");
    menuPerfil === null || menuPerfil === void 0 ? void 0 : menuPerfil.classList.remove("active");
    menuConfig === null || menuConfig === void 0 ? void 0 : menuConfig.classList.remove("active");
    if (aba === 'home') {
        abaHome === null || abaHome === void 0 ? void 0 : abaHome.classList.remove("hidden");
        menuHome === null || menuHome === void 0 ? void 0 : menuHome.classList.add("active");
    }
    else if (aba === 'perfil') {
        abaPerfil === null || abaPerfil === void 0 ? void 0 : abaPerfil.classList.remove("hidden");
        menuPerfil === null || menuPerfil === void 0 ? void 0 : menuPerfil.classList.add("active");
        carregarDadosPerfil();
    }
    else if (aba === 'configuracoes') {
        abaConfig === null || abaConfig === void 0 ? void 0 : abaConfig.classList.remove("hidden");
        menuConfig === null || menuConfig === void 0 ? void 0 : menuConfig.classList.add("active");
    }
};
function carregarDadosPerfil() {
    const usuario = getUsuarioLogado();
    if (!usuario)
        return;
    const perfilNome = document.getElementById("perfil-nome");
    const perfilTelefone = document.getElementById("perfil-telefone");
    const perfilCidade = document.getElementById("perfil-cidade");
    const perfilEstado = document.getElementById("perfil-estado");
    const perfilBairro = document.getElementById("perfil-bairro");
    const perfilGenero = document.getElementById("perfil-genero");
    if (perfilNome)
        perfilNome.value = usuario.nome || "";
    if (perfilTelefone)
        perfilTelefone.value = usuario.telefone || "";
    if (perfilCidade)
        perfilCidade.value = usuario.cidade || "";
    if (perfilEstado)
        perfilEstado.value = usuario.estado || "";
    if (perfilBairro)
        perfilBairro.value = usuario.bairro || "";
    if (perfilGenero)
        perfilGenero.value = usuario.genero || "";
}
window.fazerLogout = function () {
    localStorage.removeItem("midori_usuario_logado");
    localStorage.removeItem("midori_carrinho");
    window.location.href = "index.html";
};
// Lógica da tela de loja (`loja.html`)
function inicializarLoja() {
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
    const btnToggleAdd = document.getElementById("btn-toggle-add");
    const btnToggleMyProducts = document.getElementById("btn-toggle-my-products");
    const sectionAddProduct = document.getElementById("section-add-product");
    const sectionMyProducts = document.getElementById("section-my-products");
    btnToggleAdd === null || btnToggleAdd === void 0 ? void 0 : btnToggleAdd.addEventListener("click", () => {
        sectionAddProduct === null || sectionAddProduct === void 0 ? void 0 : sectionAddProduct.classList.toggle("hidden");
        sectionMyProducts === null || sectionMyProducts === void 0 ? void 0 : sectionMyProducts.classList.add("hidden");
    });
    btnToggleMyProducts === null || btnToggleMyProducts === void 0 ? void 0 : btnToggleMyProducts.addEventListener("click", () => {
        sectionMyProducts === null || sectionMyProducts === void 0 ? void 0 : sectionMyProducts.classList.toggle("hidden");
        sectionAddProduct === null || sectionAddProduct === void 0 ? void 0 : sectionAddProduct.classList.add("hidden");
        renderizarMeusProdutos();
    });
    const formAddProduct = document.getElementById("form-add-product");
    formAddProduct === null || formAddProduct === void 0 ? void 0 : formAddProduct.addEventListener("submit", (e) => {
        var _a;
        e.preventDefault();
        if (!usuario)
            return;
        const nome = document.getElementById("prod-name").value;
        const preco = parseFloat(document.getElementById("prod-price").value);
        const categoria = document.getElementById("prod-category").value;
        const imageFileInput = document.getElementById("prod-image-file");
        const file = (_a = imageFileInput.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file) {
            alert("Por favor, selecione uma imagem.");
            return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
            var _a;
            const imagemBase64 = (_a = event.target) === null || _a === void 0 ? void 0 : _a.result;
            const lista = getProdutos();
            lista.push({
                id: Date.now(),
                nome,
                preco,
                categoria,
                imagem: imagemBase64,
                vendedorEmail: usuario.email
            });
            salvarProdutos(lista);
            formAddProduct.reset();
            renderizarProdutos();
            renderizarMeusProdutos();
            alert("Produto anunciado com sucesso!");
        };
        reader.readAsDataURL(file);
    });
    // SUBMIT: Alterar Perfil
    const formAlterarPerfil = document.getElementById("form-alterar-perfil");
    formAlterarPerfil === null || formAlterarPerfil === void 0 ? void 0 : formAlterarPerfil.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!usuario)
            return;
        const novoNome = document.getElementById("perfil-nome").value;
        const novoTelefone = document.getElementById("perfil-telefone").value;
        const novaCidade = document.getElementById("perfil-cidade").value;
        const novoEstado = document.getElementById("perfil-estado").value;
        const novoBairro = document.getElementById("perfil-bairro").value;
        const novoGenero = document.getElementById("perfil-genero").value;
        let usuarios = getUsuarios();
        const index = usuarios.findIndex(u => u.email === usuario.email);
        if (index !== -1) {
            usuarios[index].nome = novoNome;
            usuarios[index].telefone = novoTelefone;
            usuarios[index].cidade = novaCidade;
            usuarios[index].estado = novoEstado;
            usuarios[index].bairro = novoBairro;
            usuarios[index].genero = novoGenero;
            salvarUsuarios(usuarios);
            salvarUsuarioLogado(usuarios[index]);
            if (userBadge) {
                userBadge.innerText = `${novoNome} (${usuarios[index].role.toUpperCase()})`;
            }
            alert("Perfil atualizado com sucesso!");
        }
    });
    // SUBMIT: Trocar Senha
    const formTrocarSenha = document.getElementById("form-trocar-senha");
    formTrocarSenha === null || formTrocarSenha === void 0 ? void 0 : formTrocarSenha.addEventListener("submit", (e) => {
        var _a;
        e.preventDefault();
        if (!usuario)
            return;
        const senhaAtual = document.getElementById("senha-atual").value;
        const senhaNova = document.getElementById("senha-nova").value;
        const senhaNovaConfirmacao = document.getElementById("senha-nova-confirmacao").value;
        if (senhaNova !== senhaNovaConfirmacao) {
            alert("As novas senhas não coincidem!");
            return;
        }
        let usuarios = getUsuarios();
        const userIndex = usuarios.findIndex(u => u.email === usuario.email);
        if (userIndex === -1 || ((_a = usuarios[userIndex]) === null || _a === void 0 ? void 0 : _a.senha) !== senhaAtual) {
            alert("A senha anterior está incorreta!");
            return;
        }
        usuarios[userIndex].senha = senhaNova;
        salvarUsuarios(usuarios);
        salvarUsuarioLogado(usuarios[userIndex]);
        formTrocarSenha.reset();
        alert("Senha alterada com sucesso!");
    });
    // SUBMIT: Excluir Conta
    const formExcluirConta = document.getElementById("form-excluir-conta");
    formExcluirConta === null || formExcluirConta === void 0 ? void 0 : formExcluirConta.addEventListener("submit", (e) => {
        var _a;
        e.preventDefault();
        if (!usuario)
            return;
        const senhaExcluir = document.getElementById("senha-excluir").value;
        let usuarios = getUsuarios();
        const userIndex = usuarios.findIndex(u => u.email === usuario.email);
        if (userIndex === -1 || ((_a = usuarios[userIndex]) === null || _a === void 0 ? void 0 : _a.senha) !== senhaExcluir) {
            alert("Senha incorreta. Não foi possível excluir a conta.");
            return;
        }
        const confirmar = confirm("Tem certeza absoluta de que deseja excluir a sua conta? Esta ação não pode ser desfeita.");
        if (!confirmar)
            return;
        usuarios.splice(userIndex, 1);
        salvarUsuarios(usuarios);
        let produtos = getProdutos();
        produtos = produtos.filter(p => p.vendedorEmail !== usuario.email);
        salvarProdutos(produtos);
        localStorage.removeItem("midori_usuario_logado");
        localStorage.removeItem("midori_carrinho");
        alert("Sua conta foi excluída com sucesso.");
        window.location.href = "index.html";
    });
}
function renderizarProdutos() {
    const productListEl = document.getElementById("product-list");
    if (!productListEl)
        return;
    const produtos = getProdutos();
    const usuario = getUsuarioLogado();
    if (produtos.length === 0) {
        productListEl.innerHTML = `<p class="empty-msg">Nenhum produto anunciado no momento.</p>`;
        return;
    }
    productListEl.innerHTML = "";
    produtos.forEach(produto => {
        const card = document.createElement("div");
        card.className = "product-card";
        let botaoAcao = `<button onclick="irParaDetalhes(${produto.id})">Ver Detalhes</button>`;
        if (usuario && usuario.email === produto.vendedorEmail) {
            botaoAcao += `<button onclick="removerProduto(${produto.id})" style="background: linear-gradient(to bottom, #ff5555, #cc0000); margin-top: 5px;">Excluir Anúncio</button>`;
        }
        card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>R$ ${produto.preco.toFixed(2)}</p>
      ${botaoAcao}
    `;
        productListEl.appendChild(card);
    });
}
function renderizarMeusProdutos() {
    const myProductsListEl = document.getElementById("my-products-list");
    if (!myProductsListEl)
        return;
    const produtos = getProdutos();
    const usuario = getUsuarioLogado();
    if (!usuario)
        return;
    const meusProdutos = produtos.filter(p => p.vendedorEmail === usuario.email);
    if (meusProdutos.length === 0) {
        myProductsListEl.innerHTML = `<p class="empty-msg">Não há produtos anunciados por enquanto.</p>`;
        return;
    }
    myProductsListEl.innerHTML = "";
    meusProdutos.forEach(produto => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>R$ ${produto.preco.toFixed(2)}</p>
      <button onclick="removerProduto(${produto.id})" style="background: linear-gradient(to bottom, #ff5555, #cc0000);">Excluir Anúncio</button>
    `;
        myProductsListEl.appendChild(card);
    });
}
window.irParaDetalhes = function (idProduto) {
    localStorage.setItem("midori_produto_selecionado", idProduto.toString());
    window.location.href = "produto.html";
};
window.finalizarCompra = function () {
    const carrinho = getCarrinho();
    if (carrinho.length === 0) {
        alert("O seu carrinho está vazio!");
        return;
    }
    alert("Compra finalizada com sucesso! Agora é só aproveitar a compra 🎸");
    localStorage.removeItem("midori_carrinho");
    atualizarCarrinho();
};
window.removerProduto = function (idProduto) {
    let produtos = getProdutos();
    produtos = produtos.filter(p => p.id !== idProduto);
    salvarProdutos(produtos);
    renderizarProdutos();
    renderizarMeusProdutos();
    alert("Produto removido com sucesso!");
};
window.adicionarAoCarrinho = function (idProduto) {
    const produtos = getProdutos();
    const usuario = getUsuarioLogado();
    const produtoEncontrado = produtos.find(p => p.id === idProduto);
    if (!produtoEncontrado || !usuario)
        return;
    if (usuario.email === produtoEncontrado.vendedorEmail) {
        alert("Você não pode adicionar o seu próprio produto ao carrinho.");
        return;
    }
    const carrinho = getCarrinho();
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
window.removerItemCarrinho = function (idProduto) {
    let carrinho = getCarrinho();
    carrinho = carrinho.filter(item => item.produto.id !== idProduto);
    salvarCarrinho(carrinho);
    atualizarCarrinho();
};
function atualizarCarrinho() {
    const cartCountEl = document.getElementById("cart-count");
    const cartTotalEl = document.getElementById("cart-total");
    const cartItemsEl = document.getElementById("cart-items");
    const btnFinalizar = document.getElementById("btn-finalizar");
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
            cartItemsEl.innerHTML = "<li>O carrinho está vazio!</li>";
            if (btnFinalizar)
                btnFinalizar.style.display = "none";
            return;
        }
        if (btnFinalizar)
            btnFinalizar.style.display = "block";
        carrinho.forEach(item => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.justifyContent = "space-between";
            li.style.alignItems = "center";
            li.style.marginBottom = "8px";
            li.innerHTML = `
        <span>${item.produto.nome} (x${item.quantidade}) - R$ ${(item.produto.preco * item.quantidade).toFixed(2)}</span>
        <button onclick="removerItemCarrinho(${item.produto.id})" style="background: #ff5555; border: none; color: white; padding: 2px 6px; border-radius: 4px; cursor: pointer;" title="Remover item">❌</button>
      `;
            cartItemsEl.appendChild(li);
        });
    }
}
// Lógica da tela de login (`index.html`)
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
    formRegister === null || formRegister === void 0 ? void 0 : formRegister.addEventListener("submit", (e) => {
        e.preventDefault();
        const usuarios = getUsuarios();
        const nome = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const senha = document.getElementById("reg-password").value;
        const confirmarSenha = document.getElementById("reg-confirm-password").value;
        const role = document.getElementById("reg-role").value;
        if (senha !== confirmarSenha) {
            if (authMsg)
                authMsg.innerText = "As senhas não coincidem!";
            return;
        }
        if (usuarios.find(u => u.email === email)) {
            if (authMsg)
                authMsg.innerText = "Este e-mail já está cadastrado!";
            return;
        }
        usuarios.push({ nome, email, senha, role });
        salvarUsuarios(usuarios);
        alert("Conta criada com sucesso! Faça login para continuar.");
        formRegister.reset();
        tabLogin === null || tabLogin === void 0 ? void 0 : tabLogin.click();
    });
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
