# Kaysen

Sistema web de gestão para proprietários e funcionários, com funcionalidades planejadas para pedidos, estoque e financeiro.

## Tecnologias

**Frontend**
- React
- TypeScript
- Vite

**Arquitetura planejada**
- Node.js para a API e as regras de negócio.
- PostgreSQL, disponibilizado pelo Supabase, para persistência dos dados.
- Supabase Auth para autenticação.
- Supabase Storage para armazenamento de imagens e documentos.

## Pré-requisitos

- Node.js na versão 24.15.0.
- npm, incluído na instalação do Node.js (11.12.1).

Verifique as instalações:

```bash
node --version
npm --version
```

## Como executar

Clone o repositório usando a URL disponível no GitHub:

```bash
git clone <URL_DO_REPOSITORIO>
cd kaysen/frontend
```

Substitua `<URL_DO_REPOSITORIO>` pela URL real do projeto.

Instale as dependências:

```bash
npm ci
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse o endereço informado no terminal:

```text
http://localhost:5173
```