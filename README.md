# Event Spark

A tickr é uma plataforma de eventos estou na criação da interface toda, me ajude a criar de acordo com a imagem que eu vou mandar pode ser? Quero em react

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b2072ef9-92b0-4c59-827b-ddd2047d453e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
```

### Supabase

Cria `.env.local` a partir de `.env.example` e configura o URL do projecto e a chave pública `anon`/`publishable`. Em produção, define também `VITE_SITE_URL` com o endereço público da aplicação para os links de email. Em desenvolvimento local, o endereço é detectado automaticamente. Nunca uses uma chave `service_role` no frontend ou neste ficheiro.

No painel Supabase, adiciona o domínio local e os domínios de produção à lista de URLs de redireccionamento de autenticação. O login, registo, sessão e recuperação de palavra-passe usam funções de servidor e cookies protegidos. A criação de eventos grava os dados no Supabase e atribui a propriedade ao perfil autenticado; os eventos novos ficam em revisão.

### Fundação da base de dados

1. No Supabase, abre **SQL Editor → New query** e executa [a migration de fundação actualizada](./supabase/migrations/20261108160000_phase1_foundation.sql). Se já a executaste antes, volta a executá-la: as alterações são aditivas e actualizam as regras de estado dos eventos.
2. Executa [a migration de criação de eventos](./supabase/migrations/20261108210000_event_creation.sql), que prepara o Storage e a gravação atómica de eventos e ingressos.
3. Executa [a migration de pedidos de ingresso](./supabase/migrations/20261108220000_guest_ticket_requests.sql). Visitantes podem enviar pedidos sem conta ou pagamento; só o dono/gestor autenticado do evento pode consultar os dados do pedido.
4. Cria/confirma pela aplicação a conta que representa **Tickr Eventos**.
5. Abre [`supabase/seeds/official_demo_events.sql`](./supabase/seeds/official_demo_events.sql), substitui `REPLACE_WITH_TICKR_ACCOUNT_EMAIL` pelo email dessa conta e executa uma vez no SQL Editor. Isso configura o perfil Tickr Eventos, atribui-lhe os papéis de organizador e administrador e importa os quatro eventos de demonstração sem substituir registos existentes.

Confirma que o email corresponde à tua conta oficial. Depois, novos eventos e tipos de ingresso são gravados no Supabase numa operação, com `owner_id` definido pela sessão autenticada; os dados locais antigos não são importados automaticamente. Os eventos de demonstração sem preços/capacidades completos são importados como eventos, sem inventar tipos de ingresso. A conta promovida a administrador deve ser controlada pelo responsável do projecto.

Os pedidos de ingresso são apenas mensagens de interesse: não cobram, não criam bilhetes e não reservam lugares. A função do Supabase valida o evento publicado e limita pedidos repetidos por email/evento. Mantém activa a RLS e aplica a migration acima antes de disponibilizar o formulário.

```sh
npm run dev
```
