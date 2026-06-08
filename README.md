# Assistente — Chatbot Interface

Interface de chatbot com autenticação, histórico de conversas, avaliação de respostas e painel de curadoria com métricas de uso.

---

## Objetivo

Simular a experiência de um assistente de IA conversacional, permitindo ao usuário interagir via chat com ações rápidas contextualizadas, navegar pelo histórico de conversas e, para administradores, acessar um painel analítico com KPIs de engajamento e assertividade.

---

## Stack

| Camada            | Tecnologia                            |
| ----------------- | ------------------------------------- |
| UI                | React 19                              |
| Estado global     | Redux Toolkit + React-Redux           |
| Tipagem (parcial) | TypeScript                            |
| Build             | Vite 8                                |
| Linting           | ESLint 10 + eslint-plugin-react-hooks |
| Estilo            | CSS puro (sem frameworks)             |

Nenhuma biblioteca de componentes ou ícones externos foi utilizada — todos os ícones são SVGs inline encapsulados como componentes.

---

## Arquitetura

```
src/
├── store/
│   ├── index.js          # configureStore — combina os reducers
│   ├── authSlice.js       # estado de autenticação (user)
│   └── chatSlice.js       # estado do chat (view, messages, history…)
├── pages/
│   ├── LoginPage.jsx      # fluxo login / registro / recuperação de senha
│   ├── ChatbotPage.jsx    # orquestrador: lógica de negócio do chat
│   ├── HomePage.jsx       # tela inicial com saudação e ações rápidas
│   ├── ChatPage.jsx       # tela de conversa
│   └── CuradoriaPage.jsx  # painel de métricas (admin only)
├── components/
│   ├── sidebar.tsx        # navegação lateral (TypeScript)
│   ├── TopBar.jsx
│   ├── ChatMessage.jsx    # bolha de mensagem + avaliação 👍👎
│   ├── ChatInput.jsx      # campo de envio controlado
│   ├── Greeting.jsx
│   ├── QuickActions.jsx   # cards de ação rápida
│   └── QuickActionCard.jsx
├── styles/
│   └── chatbot.css        # design tokens e estilos de layout
├── App.jsx                # roteamento raiz baseado em auth
└── main.jsx               # bootstrap + Provider
```

### Fluxo de estado

```
main.jsx
  └─ <Provider store>
       └─ App.jsx          (lê auth.user via useSelector)
            ├─ LoginPage   (dispatch login)
            └─ ChatbotPage (lê e despacha para chat slice)
                 ├─ HomePage
                 ├─ ChatPage
                 └─ CuradoriaPage
```

O estado é dividido em dois slices independentes:

- **`auth`** — gerencia `user` (objeto com `name` e `initials`). Persiste diretamente no `localStorage` dentro dos reducers via Immer.
- **`chat`** — gerencia `view`, `messages`, `isTyping`, `history` e `activeConvId`. Estado inicial hidratado do `localStorage`; sincronização feita via `useEffect` em `ChatbotPage`.

---

## Boas práticas adotadas

### Separação de responsabilidades

`ChatbotPage` concentra toda a lógica de negócio do chat (salvar histórico, simular resposta do bot, gerenciar navegação entre views) e entrega para as pages apenas props estáveis. As pages e componentes são puramente apresentacionais — não acessam o store diretamente, apenas recebem e chamam callbacks.

### Memoização onde ela importa

Em `CuradoriaPage`, o cálculo de métricas (`computeStats`) é isolado com `useMemo`, recomputando apenas quando o histórico muda — adequado porque a função é genuinamente custosa (itera todas as conversas e mensagens para derivar KPIs, score de assertividade e distribuição de tópicos).

### Estado local vs. estado global

O campo de texto de `ChatInput` e o estado de collapse da `Sidebar` permanecem em `useState` local — são estados efêmeros de UI que não interessam ao resto da aplicação. O Redux é usado exclusivamente para o que genuinamente precisa ser compartilhado: autenticação e sessão de chat.

### Persistência resiliente

A hidratação do estado inicial a partir do `localStorage` é feita com `try/catch` em todos os pontos de leitura, garantindo que dados corrompidos ou ausentes não quebrem a aplicação — o fallback sempre retorna o valor padrão definido.

### Controle de acesso baseado em papel

A página de Curadoria é protegida por verificação de papel (`isAdmin`) derivada do nome do usuário logado. O item de navegação correspondente na sidebar é renderizado condicionalmente, sem expor a rota a usuários comuns.

### Toggle idempotente na avaliação

Em `ChatMessage`, o clique em 👍 ou 👎 quando o estado já é o mesmo valor desfaz a avaliação (retorna `null`), evitando um estado binário preso. A lógica `message.liked === liked ? null : liked` é a implementação mínima desse comportamento.

### Score de assertividade com fallback

`CuradoriaPage` calcula o score de assertividade a partir das avaliações reais quando existem. Na ausência de avaliações, o algoritmo faz uma estimativa composta por taxa de engajamento (conversas multi-turno) e média de mensagens — tornando a métrica útil desde o primeiro uso, sem exigir dados de rating.

### Zero dependências visuais externas

Todos os ícones são SVGs inline encapsulados como componentes funcionais no próprio arquivo que os usa, eliminando dependências de bibliotecas de ícones e garantindo controle total sobre acessibilidade (`title`, `strokeWidth`, tamanho).

### TypeScript onde a complexidade justifica

A `Sidebar` é o único componente TypeScript do projeto — justificadamente, por ser o mais reutilizado e receber o maior número de props opcionais. O uso pontual evita o overhead de tipagem onde a inferência do JSX já é suficiente.
