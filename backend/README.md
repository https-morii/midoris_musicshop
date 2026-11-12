# Backend — Midori's Music Shop

REST API em NestJS + TypeScript, com SQLite para usuários, produtos e carrinho. O frontend HTML/TypeScript é integrado à API; cadastros, anúncios e carrinho passam a ser persistidos pelo backend. Apenas o token de autenticação e o identificador do produto selecionado permanecem no LocalStorage do navegador.

## Executar no Codespaces

Use dois terminais no Codespace.

**Terminal 1 — backend:**

```bash
cd backend
cp .env.example .env
# Edite .env e substitua JWT_SECRET por uma chave aleatória longa
npm install
npm run start:dev
```

A API fica na porta `3000`; aguarde a inicialização e encaminhe a porta na aba **Ports** do Codespaces.

**Terminal 2 — frontend:** na raiz do repositório:

```bash
npx tsc app.ts --target es2015 --module none
python3 -m http.server 8000 --bind 0.0.0.0
```

Encaminhe também a porta `8000` e abra a URL do frontend em `/` (que carrega `index.html`). O frontend detecta a porta `3000` automaticamente no Codespaces e em `localhost`. Se usar outra porta/domínio, defina `window.MIDORI_API_URL` antes de carregar `app.js` (por exemplo em um script de configuração HTML).

O banco é criado em `backend/data/midori.sqlite`; confira que a porta 3000 está encaminhada e acessível pelo navegador. Atualize a página após iniciar ambos os servidores.

## Teste funcional

1. Na página de cadastro, crie uma conta com senha de pelo menos 8 caracteres e perfil **Vendedor**. O usuário é criado no SQLite e o login é iniciado automaticamente.
2. Anuncie um produto com imagem (máximo 3 MB). O anúncio fica na tabela `products`.
3. Abra uma janela anônima ou outro navegador e cadastre um perfil **Comprador**.
4. Abra o produto, adicione ao carrinho e confira o total. O carrinho fica na tabela `cart_items`.
5. Faça logout e entre novamente: os produtos e o carrinho devem permanecer no SQLite.

Também pode testar a API diretamente:

```bash
curl http://localhost:3000/api/products
```

Para cadastro, use senha com ao menos 8 caracteres:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Vendedor Teste","email":"vendedor@example.com","password":"senha-teste-123","role":"vendedor"}'
```

## Rotas incluídas

- `POST /api/auth/register`, `POST /api/auth/login`, `GET/PATCH/DELETE /api/auth/me`, `PATCH /api/auth/me/password`
- `GET/POST /api/products`, `GET/PATCH/DELETE /api/products/:id`
- `GET/POST /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/:productId`

Rotas protegidas usam `Authorization: Bearer <accessToken>`. Senhas são armazenadas com bcrypt. A compra/pagamento real não está implementada; o botão apenas limpa o carrinho. O TypeORM sincroniza o esquema em desenvolvimento; para produção configure migrations.
