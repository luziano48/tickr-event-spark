# Fronteira Frontend / Backend

## Frontend — React

O React apresenta interface, formulários, navegação e estados de carregamento/erro/sucesso. Valida campos para dar feedback imediato, mostra dados recebidos e esconde opções que não se aplicam ao perfil. Estas validações e ocultações não concedem segurança nem autorização.

Todas as chamadas passam por `src/lib/api/`. A base é `/api`, configurável com `VITE_API_URL`. O cliente inclui credenciais de sessão e não guarda passwords nem tokens em `localStorage`.

## Backend — Supabase e lógica de servidor

O backend autentica e gere sessões, autoriza o acesso, valida definitivamente regras de negócio e dados, mantém integridade de eventos/pedidos/bilhetes, executa operações atómicas, evita duplicações, gera e valida códigos seguros e regista auditoria para operações privilegiadas. Segredos administrativos e `service_role` ficam exclusivamente no servidor.

## Contratos a implementar

| Método  | Endpoint                  | Pedido                                       | Resposta esperada                                                                  |
| ------- | ------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| GET     | `/auth/session`           | —                                            | `{ user: { id, name, email, avatar, businessProfile, role } }` ou `{ user: null }` |
| POST    | `/auth/login`             | `{ email, password }`                        | `{ user }` e cookie seguro                                                         |
| POST    | `/auth/register`          | `{ name, email, password, businessProfile }` | `{ user }` e cookie seguro; validar perfil e unicidade no servidor                 |
| POST    | `/auth/logout`            | —                                            | `{ ok: true }` e invalidar sessão no servidor                                      |
| POST    | `/auth/password/recovery` | `{ email }`                                  | resposta genérica que não revela se a conta existe                                 |
| PUT     | `/auth/password`          | `{ password }`                               | `{ ok: true }`, após verificar sessão/recovery token                               |
| GET/PUT | `/account/preferences`    | preferências suportadas                      | preferências do utilizador autenticado                                             |

Os endpoints ainda não existem neste repositório. O frontend recebe uma mensagem explícita de serviço indisponível (501) até serem implementados. Não há autenticação simulada nem envio de recuperação fingido.

## Pendências de backend

- Ligar Supabase Auth ou serviço equivalente e configurar cookies/sessões seguros.
- Definir RLS/policies, papéis de acesso e permissões por recurso no servidor.
- Persistir `businessProfile` como atributo próprio da conta, separado de `role`.
- Implementar contratos acima, recuperação real, auditoria e rate limiting.
- Implementar endpoints e transacções para eventos, pedidos, bilhetes, QR e prevenção de duplicados.
- Confirmar quais preferências de notificação são suportadas e respectivos canais.
- Não tratar a interface actual como protecção de rotas ou segurança de produção.

## Comentários, avaliações e retirada segura de conexões

Não existe schema, diretório de migrations, projeto Supabase nem código de backend neste repositório. Portanto, nenhuma tabela ou relacionamento de produção foi alterado. Antes de preparar uma migration executável, exportar e rever o schema remoto, políticas RLS, views, triggers, funções, jobs, integrações e contagens de dados; preservar uma cópia de segurança e manter os dados antigos arquivados até confirmar que nenhum cliente os consulta.

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

O modelo de dados proposto usa comentários polimórficos com `content_type`, `content_id`, `author_id`, `parent_id`, `body`, timestamps e estado de moderação; avaliações de eventos ficam numa tabela separada com `event_id`, `user_id`, `rating` e `body`. Denúncias guardam denunciante, alvo, motivo, estado e decisão moderada. Definir índices/foreign keys apenas após confirmar os IDs e tipos reais das tabelas de conteúdo.

### Migração de conexões

Não apagar relações nem contagens históricas. Após inventário de dependências, primeiro publicar clientes que deixem de ler/escrever conexões; depois renomear/arquivar tabelas e views antigas de forma reversível, observar consultas e só propor remoção definitiva numa migration posterior, com backup, janela de reversão e aprovação baseada nos dados observados. O estado `localStorage` legado não é lido pelo frontend novo e permanece no dispositivo até uma política explícita de limpeza.

### Limites do protótipo frontend

A área actualmente integrada em detalhes de evento usa `localStorage` para demonstrar comentários, respostas, edição/remoção, denúncias, classificação, ordenação e estrelas de interesse nos eventos. Os dados não são partilhados entre utilizadores ou dispositivos, o autor local não é identidade autenticada, e os limitadores locais podem ser contornados. Não há painel administrativo, prova de ingresso, moderação persistente ou proteção real contra duplicados/spam até os contratos acima serem ligados a um backend autenticado.
