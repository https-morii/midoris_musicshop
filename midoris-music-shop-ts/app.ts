// Define a estrutura de um Produto usando TypeScript
interface Produto {
  id: number;
  nome: string;
  preco: number;
  categoria: string;
  imagem: string;
}

// Define a estrutura do Item do Carrinho
interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
}

// Lista inicial de produtos da loja
const produtos: Produto[] = [
  { id: 1, nome: "Guitarra Elétrica Fender", preco: 4500, categoria: "Instrumentos", imagem: "https://via.placeholder.com/150" },
  { id: 2, nome: "Teclado Sintetizador Yamaha", preco: 3200, categoria: "Teclados", imagem: "https://via.placeholder.com/150" },
  { id: 3, nome: "Bateria Acústica Pearl", preco: 6000, categoria: "Percussão", imagem: "https://via.placeholder.com/150" }
];

// Estado atual do carrinho
const carrinho: ItemCarrinho[] = [];

// Função para renderizar os produtos na tela
function renderizarProdutos(): void {
  const productListEl = document.getElementById("product-list");
  if (!productListEl) return;

  productListEl.innerHTML = "";

  produtos.forEach(produto => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${produto.imagem}" alt="${produto.nome}">
      <h3>${produto.nome}</h3>
      <p>R$ ${produto.preco.toFixed(2)}</p>
      <button onclick="adicionarAoCarrinho(${produto.id})">Comprar</button>
    `;
    productListEl.appendChild(card);
  });
}

// Função para adicionar produto ao carrinho
function adicionarAoCarrinho(idProduto: number): void {
  const produtoEncontrado = produtos.find(p => p.id === idProduto);
  if (!produtoEncontrado) return;

  const itemExistente = carrinho.find(item => item.produto.id === idProduto);

  if (itemExistente) {
    itemExistente.quantidade += 1;
  } else {
    carrinho.push({ produto: produtoEncontrado, quantidade: 1 });
  }

  atualizarCarrinho();
}

// Função para atualizar a interface do carrinho
function atualizarCarrinho(): void {
  const cartCountEl = document.getElementById("cart-count");
  const cartTotalEl = document.getElementById("cart-total");
  const cartItemsEl = document.getElementById("cart-items");

  const totalItens = carrinho.reduce((acc, item) => acc + item.quantidade, 0);
  const valorTotal = carrinho.reduce((acc, item) => acc + (item.produto.preco * item.quantidade), 0);

  if (cartCountEl) cartCountEl.innerText = totalItens.toString();
  if (cartTotalEl) cartTotalEl.innerText = valorTotal.toFixed(2);

  if (cartItemsEl) {
    cartItemsEl.innerHTML = "";
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

// Inicializar a aplicação quando a página carregar
document.addEventListener("DOMContentLoaded", () => {
  renderizarProdutos();
});