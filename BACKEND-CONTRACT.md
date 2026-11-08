# Fronteira Frontend / Backend

## Frontend — React

O React apresenta interface, formulários, navegação e estados de carregamento/erro/sucesso. Valida campos para dar feedback imediato, mostra dados recebidos e esconde opções que não se aplicam ao perfil. Estas validações e ocultações não concedem segurança nem autorização.

As chamadas de autenticação passam por funções de servidor em `src/lib/api/auth.js`; o Supabase Auth é acedido exclusivamente no servidor com `@supabase/ssr`. A sessão é mantida em cookies `HttpOnly`, `SameSite=Lax` e `Secure` em HTTPS. O URL e a chave pública Supabase são configurados com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`; estas variáveis são públicas e nunca devem conter `service_role`.

Os restantes pedidos passam pelo cliente HTTP em `src/lib/api/`, com base `/api` configurável por `VITE_API_URL`.

## Backend — Supabase e lógica de servidor

O Supabase Auth já suporta início de sessão, criação de conta, confirmação de email, recuperação e actualização de palavra-passe, e terminação de sessão. O servidor valida os dados de entrada e gere os cookies de sessão. Configura no painel Supabase os URLs de redirecionamento de email para o domínio local e para os domínios de produção.

O schema da Fase 1 está definido em `supabase/migrations/20261108160000_phase1_foundation.sql`: perfis, papéis, preferências, eventos, equipa, tipos de ingresso, encomendas, bilhetes, comentários, denúncias, avaliações, estrelas, pedidos de patrocínio e auditoria. As tabelas usam RLS e funções privilegiadas para gestão de papéis, revisão, moderação, check-in e submissão de eventos. Segredos administrativos e `service_role` ficam exclusivamente no servidor.

## Estado dos contratos

| Operação | Estado | Comportamento |
| --- | --- | --- |
| Sessão / entrar / sair | Ligado | Supabase Auth no servidor e cookies de sessão protegidos |
| Registo | Ligado | Trigger cria perfil, preferências e papéis iniciais a partir de metadata validada |
| Recuperação / palavra-passe | Ligado | Email de recuperação com troca do código no servidor e actualização autenticada |
| Perfil / papéis | Ligado | Consulta e actualização de perfil; gestão de papéis apenas por RPC administrativa |
| Schema / RLS | Migration preparada | Aplicação manual no SQL Editor; promove o primeiro administrador através do procedimento documentado |
| Preferências da conta | Pendente | Endpoint `/api/account/preferences` ainda não implementado |

As funções de autenticação são funções de servidor TanStack Start, não endpoints REST públicos. Os restantes endpoints que ainda não existem respondem como serviço indisponível; não há autenticação simulada nem envio de recuperação fingido.

## Pendências de backend

- Aplicar a migration da Fase 1 no projecto Supabase e promover o primeiro administrador.
- Configurar URLs de redireccionamento de email no projecto Supabase para desenvolvimento e produção.
- Implementar contratos acima, recuperação real, auditoria e rate limiting.
- Implementar endpoints e transacções para eventos, pedidos, bilhetes, QR e prevenção de duplicados.
- Confirmar quais preferências de notificação são suportadas e respectivos canais.
- Não tratar a interface actual como protecção de rotas ou segurança de produção.

## Comentários, avaliações e retirada segura de conexões

A migration de fundação cria as tabelas `tickr_*`, mas ainda não foi aplicada ao projecto remoto e não integra os ecrãs existentes de comentários/avaliações. Nenhuma tabela ou relacionamento remoto foi alterado. Antes de executar a migration num projecto com dados, exportar e rever o schema remoto, políticas RLS, views, triggers, funções, jobs, integrações e contagens de dados; preservar uma cópia de segurança e manter os dados antigos arquivados até confirmar que nenhum cliente os consulta.

### Contratos de conteúdo

- `GET /content/:type/:id/comments?cursor=...` lista conteúdo público autorizado e respostas, com autor e datas.
- `POST /content/:type/:id/comments` cria comentário ou resposta (`parentId`, `text`). O servidor valida acesso ao conteúdo, limites, frequência e estado da conta.
- `PATCH /comments/:id` e `DELETE /comments/:id` autorizam somente o autor ou moderador; remoções registam auditoria e tratam respostas sem as perder silenciosamente.
- `POST /comments/:id/reports` cria denúncia única por denunciante e alvo. A fila administrativa permite consultar, ocultar/restaurar e registar motivo e moderador.
- `GET /events/:id/ratings?sort=recent|rating` lista avaliações e agrega média/quantidade somente a partir de registos existentes.
- `PUT /events/:id/ratings/me` cria ou actualiza a avaliação do utilizador autenticado, com `rating` inteiro 1–5 e texto obrigatório. Uma constraint única em `(event_id, user_id)` evita duplicados concorrentes.
- `GET /events/:id/stars` devolve a quantidade de estrelas de interesse e se o utilizador actual já marcou o evento; `PUT /events/:id/stars/me` e `DELETE /events/:id/stars/me` marcam/removem uma única estrela por utilizador e evento. Uma constraint única em `(event_id, user_id)` garante a regra mesmo com pedidos simultâneos.
- O backend valida elegibilidade por ingresso válido ou presença confirmada quando os dados de check-in estiverem ligados. A interface não concede elegibilidade.
- Moderação, denúncias, rate limiting e autoria são validados exclusivamente no servidor e cobertos por RLS/policies e auditoria.

O schema inicial usa comentários polimórficos com `content_type`, `content_id`, `author_id`, `parent_id`, `body`, timestamps e estado de moderação; avaliações ficam numa tabela separada com tipo de alvo, ID, autor, `rating` e `body`. Denúncias guardam denunciante, alvo, motivo, estado e decisão moderada. A ligação às tabelas existentes da aplicação continua pendente até concluir inventário e aprovar migração de dados.

### Migração de conexões

Não apagar relações nem contagens históricas. Após inventário de dependências, primeiro publicar clientes que deixem de ler/escrever conexões; depois renomear/arquivar tabelas e views antigas de forma reversível, observar consultas e só propor remoção definitiva numa migration posterior, com backup, janela de reversão e aprovação baseada nos dados observados. O estado `localStorage` legado não é lido pelo frontend novo e permanece no dispositivo até uma política explícita de limpeza.

### Limites do protótipo frontend

A área actualmente integrada em detalhes de evento usa `localStorage` para demonstrar comentários, respostas, edição/remoção, denúncias, classificação, ordenação e estrelas de interesse nos eventos. Os dados não são partilhados entre utilizadores ou dispositivos, o autor local não é identidade autenticada, e os limitadores locais podem ser contornados. Não há painel administrativo, prova de ingresso, moderação persistente ou proteção real contra duplicados/spam até os contratos acima serem ligados a um backend autenticado.
