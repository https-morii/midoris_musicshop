# ⚡ Midori’s Music Shop - C2C Audio Shop ★🎸🎧⋆｡ °⋆

Projeto acadêmico desenvolvido por **Mirella Fernandes** e **Rafaela Veloso**, consistindo em uma plataforma de e-commerce no modelo C2C (*Consumer to Consumer*) voltada para a compra e venda de instrumentos e equipamentos musicais. 

O projeto utiliza uma identidade visual única inspirada na estética **Frutiger Aero** (elementos translúcidos e efeito de vidro/*glassmorphism*) combinada com o estilo **Nu Metal** (tons escuros e visuais industriais), utilizando uma paleta em verde futurista (*neon/cyber-glass*).

---

## 🚀 Tecnologias Utilizadas

### 💻 Front-End
- **React (JavaScript)**
- **HTML5 / CSS3**: Estruturação semântica e estilização avançada com *glassmorphism*, gradientes e temas customizados.

### ⚙️ Back-End
- **NestJS (TypeScript)**
- **Banco de Dados**: SQLite e JSON
- **LocalStorage API**: Persistência local de dados (utilizadores, sessões, produtos e carrinho de compras) diretamente no navegador.

---

## 📐 Metodologias e Modelagem

- **Metodologia de Gestão**: SCRUM, Kanban e Metas SMART
- **Modelagem e Engenharia**: Diagramas BPMN e Arquitetura de Software

---

## 🛠️ Arquitetura e Fluxo do Projeto

O sistema é dividido em páginas independentes para garantir um fluxo de navegação limpo, moderno e profissional:

### 1. Autenticação (`index.html` / Tela Inicial)
- Tela inicial obrigatória.
- Contém abas separadas para **Login** e **Cadastro**.
- No cadastro, o utilizador pode escolher entre o perfil de **Comprador** ou **Vendedor**.

### 2. Loja Virtual (`loja.html` / Catálogo C2C)
- **Identificação**: Exibe a marca e identidade visual da loja com local para login e senha.
- **Catálogo Dinâmico**: Organizado em *cards* para escolher o produto e adicionar diretamente ao carrinho.
- **Painel de Vendedor**: Se o utilizador logado tiver o perfil de Vendedor, um painel exclusivo é exibido dinamicamente para anunciar novos instrumentos.
- **Carrinho de Compras**: Cálculo em tempo real de quantidade e valores totais dos itens selecionados.

---

## 🔧 Como Executar o Projeto Localmente

1. Certifique-se de ter o **Node.js** e o **TypeScript** instalados na sua máquina.
2. Clone o repositório ou abra a pasta do projeto no VS Code.
3. Instale as dependências do projeto:
   ```bash
   npm install
