# midoris_musicshop

⚡ Midori’s Music Shop - C2C Audio Shop ★🎸🎧⋆｡ °⋆

Projeto acadêmico desenvolvido por Mirella Fernandes e Rafaela Veloso, consistindo em uma plataforma de e-commerce no modelo C2C (Consumer to Consumer) voltada para a compra e venda de instrumentos e equipamentos musicais. O projeto utiliza uma identidade visual única inspirada na estética Frutiger Aero (elementos translúcidos e efeito de vidro/glassmorphism) combinada com o estilo Nu Metal (tons escuros e visuais industriais), utilizando uma paleta em verde futurista (neon/cyber-glass).

## 🚀 Tecnologias Utilizadas

* *HTML5 / CSS3:* Estruturação semântica e estilização avançada com glassmorphism, gradientes e temas customizados.
* *TypeScript:* Tipagem estática e lógica orientada a objetos para o comportamento da aplicação.
* *LocalStorage API:* Persistência local de dados (utilizadores, sessões, produtos e carrinho de compras) diretamente no navegador.

## 🛠️ Arquitetura e Fluxo do Projeto

O sistema é dividido em páginas independentes para garantir um fluxo de navegação limpo e profissional:

1. *`index.html` (Autenticação):
   * Tela inicial obrigatória.
   * Contém abas separadas para *Login* e *Cadastro*.
   * No cadastro, o utilizador pode escolher entre o perfil de *Comprador* ou *Vendedor*.
2. *`loja.html` (Catálogo C2C):
   * Acessível apenas após o login bem-sucedido.
   * Exibe o catálogo dinâmico de produtos anunciados na plataforma.
   * *Painel de Vendedor:* Se o utilizador logado tiver o perfil de *Vendedor*, um painel exclusivo é exibido dinamicamente para que possa anunciar novos instrumentos.
   * *Carrinho de Compras:* Cálculo em tempo real de quantidade e valores totais dos itens selecionados.
     

## ⚙️ Como Executar o Projeto Localmente

1. Certifique-se de ter o Node.js e o TypeScript instalados na sua máquina.
2. Clone ou abra a pasta do projeto no VS Code.
3. Compile o código TypeScript para JavaScript executando o seguinte comando no terminal:
   ```cmd
   npx tsc app.ts --target es2015 --module none
