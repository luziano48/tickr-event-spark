# Guia da interface Tickr

Este arquivo explica onde cada parte visual da aplicação está. O projeto usa React com JavaScript/JSX.

No React, o HTML da interface fica em arquivos `.jsx`, porque JSX é a forma de escrever HTML com componentes React. A lógica, os dados e os cálculos ficam em arquivos `.js` separados sempre que isso melhora a leitura.

## Como ler a tela inicial

A rota inicial é `src/routes/index.jsx`. Ela monta a página nesta ordem:

1. `Screen` cria o contêiner geral da aplicação.
2. `header` mostra o logo, a busca e as notificações.
3. A primeira `section` mostra o evento em destaque.
4. A segunda `section` mostra a grade de eventos usando `EventCard`.
5. `BottomNav` aparece dentro de `Screen` e fixa a navegação no rodapé.

## Mapa dos componentes

| Parte visual | Arquivo JavaScript/JSX | Onde está o estilo |
| --- | --- | --- |
| Página inicial, evento destaque e grade | `src/routes/index.jsx` | Classes Tailwind no próprio JSX; cores e fontes em `src/styles.css` |
| Contêiner central da página | `src/components/tickr/Screen.jsx` | Classes do `div` principal; utilitários globais em `src/styles.css` |
| Logo Tickr | `src/components/tickr/Logo.jsx` | Classes do `<span>` e variáveis de fonte em `src/styles.css` |
| Cartão individual de evento | `src/components/tickr/EventCard.jsx` | Classes dos `div`, imagem e textos; tokens de cor em `src/styles.css` |
| Navegação inferior | `src/components/tickr/BottomNav.jsx` | Classes do `<nav>`, `<ul>` e links; cores em `src/styles.css` |
| QR Code visual | `src/components/tickr/QrCode.jsx` | A aparência do SVG está no JSX; o tamanho é controlado pela classe recebida |
| Dados dos eventos | `src/data/events.js` | Não possui CSS; fornece textos, imagens, datas e preços |
| Dados da home | `src/data/home.js` | Não possui CSS; seleciona destaque e eventos secundários |
| Dados do perfil | `src/data/profile.js` | Não possui CSS; fornece estatísticas e eventos do organizador |
| Dados do ingresso | `src/data/ticket.js` | Não possui CSS; fornece evento e código do ingresso |
| Pesquisa e filtro de eventos | `src/hooks/use-event-search.js` | Não possui CSS; controla busca, categoria e resultados |
| Estado do scanner | `src/hooks/use-scanner.js` | Não possui CSS; controla validar e escanear novamente |
| Cores, fontes, fundo e utilitários próprios | `src/styles.css` | Arquivo CSS global da aplicação |

## Onde editar cada bloco da home

### Cabeçalho

Está em `src/routes/index.jsx`, dentro do `<header>`.

- Logo: componente `Logo` em `src/components/tickr/Logo.jsx`.
- Ícone de busca: link para `/explorar` no próprio `index.jsx`.
- Sino de notificações: ícone `Bell` no próprio `index.jsx`.
- Espaçamento e alinhamento: classes Tailwind do `<header>`.

### Evento em destaque

Está na primeira `<section>` de `src/routes/index.jsx`.

- Imagem: `featured.image`, vindo de `src/data/events.js`.
- Camada escura sobre a imagem: `<div>` com `bg-gradient-to-t`.
- Conteúdo sobre a imagem: `<div>` com posicionamento absoluto.
- Botão de detalhes: `Link` para `/evento/$id`.
- Cores, gradiente e brilho: utilitários `grad-primary` e `glow` definidos em `src/styles.css`.

### Grade de eventos

Está na segunda `<section>` de `src/routes/index.jsx`.

- O título e o link “Ver todos” estão no primeiro `<div>` da seção.
- A grade usa o `<div>` com `grid grid-cols-2`.
- Cada item é renderizado por `EventCard`.
- Para alterar os eventos, edite `src/data/events.js`.

### Cartão de evento

Está em `src/components/tickr/EventCard.jsx`.

- Primeiro `<div>`: área da imagem e elementos sobrepostos.
- `<img>`: imagem do evento.
- Primeiro `<span>`: categoria.
- Segundo `<span>`: botão visual de favorito.
- Segundo `<div>`: título, data, cidade e preço.

## Onde editar o CSS

O visual é escrito principalmente nas classes Tailwind colocadas nos arquivos `.jsx`. Essas classes são processadas por `src/styles.css`.

Edite `src/styles.css` quando quiser alterar:

- Cores gerais: variáveis dentro de `:root`.
- Fonte: `--font-display` e `--font-sans`.
- Raio dos elementos: `--radius`.
- Fundo e texto padrão: regras de `body`.
- Títulos: regras de `h1`, `h2`, `h3` e `h4`.
- Gradiente dos botões: `@utility grad-primary`.
- Brilho dos botões: `@utility glow`.
- Barra de rolagem oculta: `@utility no-scrollbar`.

## Regra simples para manutenção

- Texto, dados e comportamento: edite o arquivo `.jsx` ou `.js` responsável.
- Estrutura visual HTML/JSX: mantenha nas rotas e componentes `.jsx`.
- Estado, filtros e cálculos: mantenha nos hooks `.js`.
- Listas, constantes e conteúdo: mantenha nos módulos `src/data/*.js`.
- Aparência específica de um elemento: edite as classes Tailwind desse elemento.
- Aparência compartilhada por várias telas: edite `src/styles.css`.
- Evento, preço, imagem ou data: edite `src/data/events.js`.
- Não crie uma nova página dentro de `src/pages`; as páginas ficam em `src/routes`.