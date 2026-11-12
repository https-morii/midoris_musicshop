# Midori's Music Shop — Backend e execução

Agora a branch `rafaela` contém o frontend e a API NestJS + TypeScript com SQLite. Cadastros, anúncios e carrinho são persistidos no banco `backend/data/midori.sqlite`; o LocalStorage guarda somente token de autenticação e produto selecionado.

## Executar no Codespaces

Abra dois terminais no Codespace.

**Terminal 1 — backend:**

```bash
cd backend
cp .env.example .env
# Recomendado: edite .env e configure um JWT_SECRET longo e aleatório.
npm install
npm run start:dev
```

Aguarde a mensagem de inicialização e encaminhe a porta `3000` na aba **Ports** do Codespaces.

**Terminal 2 — frontend**, na raiz do repositório:

```bash
npx tsc app.ts --target es2015 --module none
python3 -m http.server 8000 --bind 0.0.0.0
```

Encaminhe a porta `8000` e abra a URL do frontend. O aplicativo deriva o endereço da API trocando `-8000.` por `-3000.` no domínio do Codespaces; localmente usa a porta 3000.

## Teste

1. Cadastre uma conta com perfil **Vendedor** e senha de pelo menos 8 caracteres.
2. Anuncie um produto com imagem até 3 MB.
3. Em outro perfil/navegador, crie um **Comprador**, entre na conta e adicione o produto ao carrinho.
4. Encerre e reinicie o backend; os usuários, anúncios e itens do carrinho permanecem no SQLite.
5. O banco aparece em `backend/data/midori.sqlite`.

Rota pública para conferir a API: `GET /api/products`. Os endpoints protegidos enviam o token JWT como Bearer. A compra e o pagamento reais não estão implementados: o botão de finalizar apenas limpa o carrinho.
