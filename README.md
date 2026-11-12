# Midori's Music Shop

Aplicação full-stack para loja de instrumentos musicais com cadastro de usuários, anúncios de produtos, carrinho de compras e área de perfil.

## Visão geral

- Frontend em HTML + JavaScript
- Backend em NestJS + TypeScript
- Banco de dados SQLite
- Autenticação com JWT
- Fluxo de venda e compra entre usuários

## Estrutura do projeto

```text
midoris_musicshop/
├── backend/
│   ├── src/
│   ├── data/
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── app.ts
├── app.js
├── index.html
├── loja.html
├── produto.html
├── styles.css
├── README.md
└── package.json
```

## Requisitos

- Node.js 18+
- npm
- Python 3
- Git
- (Opcional) GitHub Codespaces com encaminhamento de portas

## Configuração inicial

1. Clone o repositório:

```bash
git clone https://github.com/https-morii/midoris_musicshop.git
cd midoris_musicshop
```

2. Entre na branch correta:

```bash
git switch rafaela
```

3. Configure o backend:

```bash
cd backend
cp .env.example .env
```

Abra o arquivo `.env` e confirme o conteúdo, por exemplo:

```env
PORT=3000
JWT_SECRET=sua_chave_secreta_muito_segura
DATABASE_PATH=./data/midori.sqlite
```

Se quiser, pode alterar os valores conforme sua máquina/local.

## Como executar

### 1) Rodar o backend

No terminal do projeto, execute:

```bash
cd /workspaces/midoris_musicshop/backend
npm install
npm run start:dev
```

Aguarde até aparecer uma mensagem parecida com:

```text
[Nest] ... Nest application successfully started
Midori API listening on http://localhost:3000/api
```

Se estiver usando GitHub Codespaces, abra a aba **Ports** e encaminhe a porta **3000**.

### 2) Rodar o frontend

Abra outro terminal na raiz do projeto:

```bash
cd /workspaces/midoris_musicshop
npx tsc app.ts --target es2015 --module none
python3 -m http.server 8000 --bind 0.0.0.0
```

Aguarde a mensagem:

```text
Serving HTTP on 0.0.0.0 port 8000
```

Se estiver usando Codespaces, encaminhe também a porta **8000**.

### 3) Abrir a aplicação

Abra no navegador a URL da porta 8000, por exemplo:

```text
http://localhost:8000
```

ou, no Codespaces:

```text
https://SEU-DOMINIO-8000.app.github.dev
```

### 4) Testar o fluxo da aplicação

1. Cadastre uma conta com perfil de **Vendedor**.
2. Anuncie um produto com imagem.
3. Faça logout.
4. Crie outra conta com perfil de **Comprador**.
5. Entre na loja e adicione produtos ao carrinho.
6. Verifique o painel do vendedor e do comprador.
7. Atualize a página para confirmar que os dados continuaram salvos.

## Como funciona o projeto

### Autenticação

- O login e o cadastro usam o backend NestJS.
- O token JWT é retornado após autenticação e enviado no header `Authorization` nas chamadas protegidas.

### Produtos

- Usuários com perfil de vendedor podem anunciar produtos.
- O catálogo é carregado pela API.
- Produtos podem ser removidos pelo próprio vendedor.

### Carrinho

- O comprador pode adicionar itens ao carrinho.
- O carrinho é calculado em tempo real.
- A finalização de compra ainda é simulada, sem pagamento real.

### Persistência

- O banco fica em `backend/data/midori.sqlite`.
- O frontend usa o `LocalStorage` para sessão junto com o backend, e o backend persiste os dados no SQLite.

## Observações

- A API usa `PORT=3000` por padrão.
- O frontend tenta usar a API automaticamente em `http://localhost:3000/api` ou na porta equivalente do Codespaces.
- Se você estiver no Codespaces, certifique-se de que as portas `3000` e `8000` aparecem na aba **Ports** e estão encaminhadas corretamente.
- O projeto é destinado a fins de demonstração e estudo.

## Troubleshooting

### Backend não responde

Confirme se o comando abaixo está rodando sem erro:

```bash
cd backend
npm run start:dev
```

Se aparecer erro de porta, verifique se a porta `3000` está livre.

### Frontend não consegue acessar a API

1. Verifique se o backend está rodando.
2. Confira se a porta `3000` está funcionando.
3. Confirme que a aba **Ports** do Codespace está com a porta encaminhada.
4. Teste a API diretamente:

```bash
curl http://localhost:3000/api/products
```

Se retornar `[]`, a API está funcionando.

### CORS

O backend já está configurado para aceitar requisições vindas do frontend em `localhost` e em domínios do Codespaces, mas é sempre bom verificar se as portas do Codespaces estão encaminhadas corretamente.

## Contribuição

Para contribuir com o projeto:

```bash
git checkout rafaela
git pull origin rafaela
# faça suas alterações
# teste localmente
# commite e envie
```

## Licença

Este projeto é usado para fins acadêmicos e de estudo.
