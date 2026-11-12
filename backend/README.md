# Backend — Midori's Music Shop

REST API em NestJS + TypeScript. O SQLite armazena usuários, anúncios e itens de carrinho; a API recebe e responde JSON. O backend é uma aplicação separada em `backend/` e ainda não substitui automaticamente o `LocalStorage` usado pelas páginas HTML atuais.

## Requisitos e inicialização

Requer Node.js 18 ou superior e npm. No Codespace, abra um terminal e execute:

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

A API fica em `http://localhost:3000/api`. No Codespaces, abra a aba **Ports** e encaminhe a porta `3000` para acessá-la pelo navegador. O arquivo SQLite é criado em `backend/data/midori.sqlite` automaticamente.

Configure `JWT_SECRET` em `.env` com uma chave aleatória longa. O valor fallback existe apenas para desenvolvimento local. `DATABASE_PATH` e `PORT` também podem ser alterados no `.env`.

## Endpoints

Todos os endpoints usam o prefixo `/api`. Corpos e respostas são JSON. Para rotas protegidas, envie `Authorization: Bearer <accessToken>` retornado por login ou cadastro.

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Público | Cadastra usuário (`name`, `email`, `password`, `role` opcional: `comprador` ou `vendedor`) |
| `POST` | `/auth/login` | Público | Autentica e retorna token JWT e dados públicos do usuário |
| `GET` | `/auth/me` | Token | Retorna o perfil da sessão |
| `GET` | `/products` | Público | Lista anúncios |
| `GET` | `/products/:id` | Público | Consulta anúncio |
| `POST` | `/products` | Vendedor | Cria anúncio (`name`, `price`, `category`; `description` e `imageUrl` opcionais) |
| `PATCH` | `/products/:id` | Dono do anúncio | Atualiza campos do anúncio |
| `DELETE` | `/products/:id` | Dono do anúncio | Exclui anúncio |
| `GET` | `/cart` | Token | Mostra itens, quantidades e total do carrinho do usuário |
| `POST` | `/cart/items` | Token | Adiciona item (`productId`, `quantity` opcional) |
| `PATCH` | `/cart/items/:productId` | Token | Atualiza quantidade (`quantity`) |
| `DELETE` | `/cart/items/:productId` | Token | Remove item |
| `DELETE` | `/cart` | Token | Esvazia carrinho |

Exemplo de cadastro:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Pessoa Teste","email":"pessoa@example.com","password":"senha-segura-123","role":"vendedor"}'
```

## Observações

- Senhas são armazenadas como hashes bcrypt, nunca em texto puro. Respostas da API não incluem hashes.
- O SQLite guarda dados no arquivo local; usuários e sessões não são compartilhados entre dispositivos.
- A finalização de compra/pagamento não está implementada; carrinho é apenas persistido e calculado.
- Em desenvolvimento, TypeORM cria/atualiza tabelas com `synchronize`. Em produção isso fica desativado; configure e execute migrations antes de usar `NODE_ENV=production`.
- O frontend atual ainda usa `LocalStorage`. Integrá-lo a esta API é um passo separado: trocar as leituras/escritas locais por chamadas `fetch` e guardar o token de sessão.
