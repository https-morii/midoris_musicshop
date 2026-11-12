# Execução local — Midori's Music Shop

Esta branch (`feat/localstorage-frontend`) executa a aplicação inteiramente no navegador: cadastro/login, perfis, produtos e carrinhos são guardados no `localStorage` do navegador. Não é necessário iniciar o backend nem encaminhar a porta 3000.

## Como testar no Codespaces

Na raiz do repositório, rode apenas o servidor estático:

```bash
python3 -m http.server 8000 --bind 0.0.0.0
```

Abra a URL da porta **8000** na aba **Ports** do Codespace. Não execute `npm run start:dev`; a API NestJS não é usada por esta branch.

## Fluxo de teste

1. Na página inicial, clique em **Cadastrar** e crie uma conta com perfil **Vendedor**.
2. Anuncie um produto com imagem de até 2 MB.
3. Saia da conta e crie uma conta **Comprador** no mesmo navegador.
4. Abra o produto, adicione ao carrinho e confira o total.
5. Atualize a página: os dados continuam salvos no `localStorage` desse navegador.

Os dados são locais ao navegador e não são sincronizados entre dispositivos ou navegadores. As senhas ficam no armazenamento local, então esta implementação é apenas para demonstração e não deve ser usada em produção. Pagamentos reais não estão implementados.
