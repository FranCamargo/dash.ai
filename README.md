# Assistente — Chatbot Interface

Interface de chatbot para execução local, com histórico de conversas, avaliação de respostas e integração com modelos offline do Ollama.

---

## Objetivo

Permitir conversar localmente com modelos de IA, navegar pelo histórico, enviar imagens para análise e, para administradores, acessar um painel analítico com métricas de uso.

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

## Execução local e modelos offline (Ollama)

O dash.ai pode rodar no próprio computador e conversar com os modelos locais `qwen3.5:4b` e `lfm3-vl:latest`. Depois de baixar os modelos e instalar as dependências, as conversas são processadas pelo Ollama local e não são enviadas a serviços externos.

### Configuração passo a passo

1. Instale o [Node.js](https://nodejs.org/) e o [Ollama](https://ollama.com/download), caso ainda não estejam instalados.
2. No terminal, entre na pasta do projeto e instale as dependências:

   ```sh
   npm install
   ```

3. Baixe os modelos. Esta etapa precisa de internet; depois que o download terminar, o uso dos modelos pode ser offline. Se eles já aparecem em `ollama list`, pule este passo:

   ```sh
   ollama pull qwen3.5:4b
   ollama pull lfm3-vl:latest
   ollama list
   ```

   No Windows, se `ollama` não for reconhecido como comando, use o caminho padrão do executável:

   ```powershell
   & "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" pull qwen3.5:4b
   & "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" pull lfm3-vl:latest
   ```

4. Inicie o dash:

   ```sh
   npm run dev
   ```

   O script verifica se a API local do Ollama está ativa. Se não estiver, tenta iniciar `ollama serve` e aguarda até 60 segundos. No Windows, procura `ollama.exe` em `%LOCALAPPDATA%\Programs\Ollama\`; também aceita o comando `ollama` no `PATH`. O Vite encaminha `/ollama` para `http://127.0.0.1:11434`. Abra o endereço local mostrado no terminal (por padrão, `http://localhost:3000`).

5. No seletor de modelos do chat, escolha `qwen3.5:4b` ou `lfm3-vl:latest`. O Qwen é selecionado por padrão; o LFM e o Qwen também aceitam imagens anexadas na conversa. A primeira resposta pode demorar enquanto o modelo é carregado.

Se o executável do Ollama estiver em outro local, defina `OLLAMA_EXECUTABLE` com o caminho completo antes de executar `npm run dev`. Se a API usar outro endereço, defina `VITE_OLLAMA_BASE_URL` com a URL base, por exemplo `http://localhost:11434`.

> **Execução publicada:** a inicialização automática e o proxy local são usados pelo `npm run dev`. Um site estático publicado não pode iniciar processos no computador do visitante; nesse caso, o Ollama precisa ser iniciado separadamente e a origem do site deve ser autorizada pelo Ollama (`OLLAMA_ORIGINS`).

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

`ChatbotPage` concentra a lógica de negócio do chat, salva o histórico e encaminha mensagens dos modelos Ollama para a API local. As demais opções de modelo mantêm respostas demonstrativas. As pages e componentes recebem e chamam callbacks, sem acessar o store diretamente.

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
