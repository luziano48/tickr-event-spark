# Tickr — o que entendi

## Em poucas palavras

A Tickr é uma plataforma para descobrir, organizar e acompanhar eventos, começando por Angola. A proposta é aproximar o público de experiências culturais e de entretenimento e dar a organizadores e fornecedores ferramentas para apresentar o seu trabalho.

Entendo a Tickr como mais do que uma lista de eventos: cada experiência tem informação própria, pode ter ingressos, comentários e avaliações, e está ligada às pessoas ou organizações que a tornam possível.

## Para quem é

- **Público:** descobre eventos, consulta data, local, preço e regras, acompanha os seus ingressos e partilha a sua experiência.
- **Organizadores:** apresentam o seu perfil, publicam novidades e eventos, divulgam contactos e acompanham operações relacionadas com ingressos.
- **Fornecedores:** mostram os seus serviços e podem ser encontrados por pessoas que estão a preparar eventos.
- **Tickr oficial:** comunica novidades, guias e informação de ajuda da própria plataforma. Este perfil institucional é distinto dos perfis normais e deve manter os seus conteúdos e secções exclusivas.
- **Administração:** deverá moderar denúncias e conteúdos quando a plataforma tiver os serviços de backend correspondentes.

## Como imagino a experiência

1. A pessoa abre a página inicial e vê uma seleção de eventos e novidades da Tickr.
2. Em **Explorar**, pesquisa eventos ou fornecedores e abre os detalhes do que lhe interessa.
3. No evento, consulta as informações e os ingressos. Depois da experiência, pode deixar um comentário ou uma avaliação com estrelas e texto.
4. O perfil do organizador reúne novidades, eventos, contactos e o que o público está a dizer.
5. Organizadores usam as áreas de gestão para criar eventos, acompanhar pedidos e validar entradas.

## Perfis e identidade visual

O perfil oficial da Tickr é a referência visual para os perfis normais: imagem de capa em destaque, identidade do perfil, informação descritiva e separadores consistentes com o design existente. A aplicação mantém cores, tipografia, espaçamento, responsividade e ícones outline.

O perfil institucional continua próprio, com as secções **Novidades**, **Como funciona** e **Ajuda**. É um canal apenas informativo sobre o que há de novo no site e sobre como usar a Tickr: não tem comentários nem mensagens. O perfil normal de organizador usa secções adequadas ao seu papel: **Novidades**, **Contactos** e **O que estão dizendo**. Em Novidades ficam publicações e eventos; Contactos reúne email, redes sociais, LinkedIn, website e WhatsApp; O que estão dizendo reúne comentários e avaliações.

O perfil de demonstração chamado **Tickr Eventos** é um perfil normal do organizador. Não substitui nem representa o perfil institucional **Tickr**.

## Comentários e avaliações

Comentários são uma forma de conversa e não exigem classificação. No perfil normal do organizador podem aparecer comentários e avaliações. Nos detalhes dos eventos, a interação visível fica restrita à avaliação por estrelas e texto, sem campo de comentário comum. O perfil oficial da Tickr é apenas informativo e não aceita comentários nem mensagens. Uma avaliação é diferente: atribui de 1 a 5 estrelas e inclui um texto sobre a experiência. A média e a quantidade devem vir de avaliações reais, sem números inventados.

Nos cartões de evento há também uma estrela simples de interesse/favorito, separada da avaliação: cada utilizador pode marcar no máximo uma estrela por evento, e o perfil do organizador mostra o total recebido pelos seus eventos.

O modelo esperado permite responder, editar ou remover o próprio comentário, denunciar conteúdo e ordenar avaliações. No caso de eventos, a elegibilidade deverá ser verificada por ingresso válido ou presença confirmada, quando esses dados estiverem ligados.

## Funcionalidades representadas no projeto

O código actual já contém interfaces para página inicial, pesquisa e descoberta, perfis, detalhes de eventos, criação e gestão de eventos, ingressos, pedidos, scanner/validação, mensagens ou notificações, definições, login e páginas institucionais.

O projecto também representa fornecedores, publicações do perfil normal e avaliações/comentários. O estado actual de alguns desses dados é local e demonstrativo. As conexões foram retiradas da experiência da plataforma; não devem voltar a aparecer como pedidos, listas, contadores ou secções de perfil.

Na navegação actual, o acesso ao perfil está no menu de definições da conta. A navegação inferior usa o lugar antes ocupado pelo perfil para **Notificações**, que mantém a área existente de pedidos de ingressos e propostas de patrocinadores.

## O que ainda depende de serviços reais

Este repositório é sobretudo uma implementação de interface. Não contém schema de produção do Supabase nem os endpoints de backend definidos no contrato. Por isso, algumas acções ainda não são operações partilhadas ou seguras entre utilizadores:

- comentários, respostas, avaliações, estrelas de interesse, denúncias e publicações demonstrativas guardam dados no navegador;
- as avaliações não estão ligadas a uma sessão autenticada nem a um ingresso verificado;
- pedidos, notificações e operações de venda precisam de dados e persistência no servidor;
- login, recuperação de palavra-passe e preferências dependem dos endpoints e da autenticação do backend;
- moderação administrativa, rate limiting e protecção contra avaliações duplicadas precisam de validação no servidor.

Antes de eliminar tabelas ou relações históricas de conexões, é necessário obter e rever o schema real, as políticas, dependências e dados. A mudança da interface, por si só, não é motivo para apagar dados de produção.

## Princípios que considero centrais

- Tornar fácil descobrir e participar em eventos.
- Dar aos organizadores e fornecedores um espaço claro para apresentar o que fazem.
- Manter o perfil oficial da Tickr claramente separado dos perfis normais.
- Tratar comentários e avaliações com autoria, integridade e moderação adequadas.
- Não inventar avaliações, médias, vendas ou contactos.
- Distinguir claramente o que é uma demonstração local do que já funciona com serviços reais.

Esta é a minha leitura da intenção da Tickr com base no projecto e nas decisões definidas até agora; serve como resumo de produto, não como especificação final de negócio.
