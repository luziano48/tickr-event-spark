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

No painel Supabase, adiciona o domínio local e os domínios de produção à lista de URLs de redireccionamento de autenticação. O login, registo, sessão e recuperação de palavra-passe usam funções de servidor e cookies protegidos. Os dados de eventos e ingressos continuam a usar os dados de demonstração até existir um schema aprovado.

### Fundação da base de dados

1. No Supabase, abre **SQL Editor → New query**.
2. Cola e executa uma única vez o conteúdo de [`supabase/migrations/20261108160000_phase1_foundation.sql`](./supabase/migrations/20261108160000_phase1_foundation.sql). A migration é aditiva e cria as tabelas `tickr_*`, funções, triggers, papéis e políticas RLS; não apaga tabelas da aplicação nem dados de demonstração.
3. Cria a primeira conta pela aplicação e confirma o email, se a confirmação estiver activa.
4. No SQL Editor, substitui o email abaixo pelo da conta que será administradora e executa **uma única vez**. Isto atribui o primeiro papel `admin`; depois, a gestão de papéis passa pela função protegida `tickr_set_role`.

```sql
insert into public.tickr_user_roles (user_id, role)
select id, 'admin'::public.tickr_role
from auth.users
where lower(email) = lower('teu-email@exemplo.com')
  and not exists (
    select 1 from public.tickr_user_roles where role = 'admin'
  )
on conflict (user_id, role) do nothing;
```

Confirma que a consulta afectou uma linha e que o email corresponde à tua conta. A migration prepara a fundação completa, mas os ecrãs de eventos, ingressos e comunidade continuam em modo de demonstração nesta fase.

```sh
npm run dev
```
