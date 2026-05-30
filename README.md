# AtenaEvents Web

Frontend do **AtenaEvents** — SPA em **React 19 + Vite**, servida em produção por Nginx.

Faz parte de um projeto maior orquestrado via Docker Compose. Para subir tudo (frontend + API + banco) de uma vez, veja o repositório raiz. Este README cobre **o frontend isoladamente**.

---

## 1. Stack

| Item | Tecnologia |
|---|---|
| UI | React 19 |
| Build | Vite 8 |
| Rotas | React Router v7 (`react-router-dom`) |
| HTTP | Axios (instância central em `src/api/client.js`) |
| Estado | Sem store global — Context API (`AuthContext`) + chamadas diretas à API |
| Lint | ESLint 10 |
| Serve (prod) | Nginx (`nginx.conf`) |

---

## 2. Rodar

### Recomendado — via Docker Compose (no repositório raiz)

O modo suportado de execução é pelo `docker compose up --build` do repositório raiz, que sobe o frontend já conectado à API e ao banco. O frontend fica em **http://localhost:3000**.

### Desenvolvimento local (Vite)

```bash
npm install
npm run dev      # dev server com HMR em http://localhost:5173
```

> Para o dev server falar com a API, defina `VITE_API_URL` (veja abaixo) e tenha a API no ar.

### Outros scripts

```bash
npm run build    # gera o bundle de produção em dist/
npm run preview  # serve o dist/ localmente
npm run lint     # checagem ESLint
```

---

## 3. Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL base da API |

> ⚠️ `VITE_API_URL` é **embutida no bundle em tempo de build** (build arg). Se mudar o valor, é preciso **rebuildar** (`vite build` / `docker compose ... --build`).

---

## 4. Estrutura

```
src/
├── api/         → módulos de chamada à API (client, event, participation, comment, user)
├── components/  → componentes reutilizáveis (EventCard, Sidebar, Topbar, modais, Icons…)
├── context/     → AuthContext (fonte única de verdade da sessão, persistida em localStorage)
├── pages/       → telas (Welcome, SignIn/SignUp, Home, EventDetails, Profile, Config…)
├── assets/      → imagens
├── App.jsx      → definição de rotas
└── main.jsx     → entrypoint
```

### Rotas principais (`App.jsx`)

| Rota | Acesso | Tela |
|---|---|---|
| `/welcome` | público | Landing |
| `/signin`, `/signup` | público | Login / cadastro |
| `/oauth-callback` | público | Recebe tokens do redirect OAuth |
| `/events/:id` | público | Detalhes do evento (lida com estado de auth internamente) |
| `/home/*` | usuários completos | Shell autenticado (feed, meus eventos, perfil, config) |
| `/home/events/:eventId/participants` | dono do evento | Painel de participantes |

- `PrivateRoute` bloqueia convidados e não autenticados → `/signin`.
- `GuestGuard` restringe convidados ao evento "travado" + telas de auth.

### Autenticação (`context/AuthContext.jsx`)

Fonte única de verdade da sessão, persistida em `localStorage` (`atena_user`). Suporta login por email/senha, OAuth (Google/GitHub), sessão de convidado e *upgrade* de convidado para conta completa.

### Avatares

Sempre renderize com `avatarBase64 || avatarUrl`: `avatarBase64` é imagem enviada (base64); `avatarUrl` vem do provedor OAuth.
