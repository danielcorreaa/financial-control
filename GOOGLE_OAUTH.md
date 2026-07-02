# Login com Google — Guia de Configuração

Este documento descreve como configurar e ativar o login via Google OAuth2 no FinControl.

---

## Como funciona

```
Usuário clica "Entrar com Google"
        │
        ▼
Frontend redireciona para  /oauth2/authorization/google  (Spring)
        │
        ▼
Spring redireciona para Google (tela de consentimento)
        │
        ▼
Google redireciona para  /login/oauth2/code/google  (Spring callback)
        │
        ▼
OAuth2SuccessHandler: busca/cria usuário, gera JWT
        │
        ▼
Backend redireciona para  {FRONTEND_URL}/auth/callback?token=...
        │
        ▼
OAuthCallbackPage: salva token no localStorage e vai para /
```

### Vinculação de contas

| Situação | Comportamento |
|---|---|
| Primeira vez com Google | Cria novo usuário sem senha |
| E-mail Google coincide com conta local | Vincula o `googleId` à conta existente |
| Login seguinte com Google | Busca pelo `googleId` armazenado |

---

## Passo 1 — Google Cloud Console

### 1.1 Criar projeto

1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto ou use um existente

### 1.2 Ativar a API

1. No menu lateral: **APIs e Serviços → Biblioteca**
2. Pesquise **"Google+ API"** ou **"Google Identity"** e ative

### 1.3 Criar credenciais OAuth2

1. **APIs e Serviços → Credenciais → Criar credenciais → ID do cliente OAuth**
2. Tipo de aplicativo: **Aplicativo da Web**
3. Nome: `FinControl`
4. **URIs de redirecionamento autorizados** — adicione **todos** os ambientes:

| Ambiente | URI |
|---|---|
| Desenvolvimento | `http://localhost:8080/login/oauth2/code/google` |
| Produção | `https://seu-dominio.com/login/oauth2/code/google` |

5. Clique em **Criar** e copie o **Client ID** e o **Client Secret**

### 1.4 Tela de consentimento

1. **APIs e Serviços → Tela de consentimento OAuth**
2. Tipo de usuário: **Externo**
3. Preencha nome do app, e-mail de suporte, domínios autorizados
4. Escopos necessários: `email`, `profile`, `openid`
5. Em desenvolvimento: adicione e-mails de teste em **Usuários de teste**

---

## Passo 2 — Variáveis de Ambiente

### Desenvolvimento local

Crie um arquivo `.env` na raiz do projeto (ou defina as variáveis no terminal):

```bash
# Backend
GOOGLE_CLIENT_ID=123456789-abcdefgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173

# Frontend (opcional — padrão já é localhost:8080)
VITE_API_URL=http://localhost:8080
```

Execute o backend com as variáveis:

```bash
# PowerShell
$env:GOOGLE_CLIENT_ID="seu-client-id"
$env:GOOGLE_CLIENT_SECRET="seu-client-secret"
$env:FRONTEND_URL="http://localhost:5173"
mvn spring-boot:run

# Bash / Linux / Mac
GOOGLE_CLIENT_ID=seu-client-id \
GOOGLE_CLIENT_SECRET=seu-client-secret \
FRONTEND_URL=http://localhost:5173 \
mvn spring-boot:run
```

### Produção (Railway / Render / Fly.io / etc.)

Defina as variáveis de ambiente no painel do serviço:

```
GOOGLE_CLIENT_ID     = 123456789-abcdefgh.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL         = https://seu-frontend.com
```

> **Importante:** sem `GOOGLE_CLIENT_ID`, o OAuth2 permanece desabilitado e o app sobe normalmente com apenas login email/senha.

---

## Passo 3 — Frontend

O frontend usa a variável `VITE_API_URL` para montar a URL do botão Google.  
Crie `frontend/.env.local`:

```
VITE_API_URL=http://localhost:8080
```

Em produção (`frontend/.env.production`):

```
VITE_API_URL=https://seu-backend.com
```

---

## Arquivos modificados

### Backend

| Arquivo | Alteração |
|---|---|
| `pom.xml` | `spring-boot-starter-oauth2-client` |
| `application.properties` | `app.frontend.url`, placeholders Google |
| `domain/user/User.java` | Campo `googleId`, construtor Google, `linkGoogleId()` |
| `domain/user/UserRepository.java` | `findByGoogleId()` |
| `persistence/user/UserDocument.java` | Campo `googleId` com `@Indexed(sparse=true)` |
| `persistence/user/MongoUserRepository.java` | Query derivada `findByGoogleId()` |
| `persistence/user/UserRepositoryImpl.java` | Implementação `findByGoogleId()` |
| `security/UserDetailsServiceImpl.java` | Suporte a `passwordHash` nulo |
| `security/OAuth2SuccessHandler.java` | **Novo** — ponte OAuth2 → JWT → redirect |
| `config/SecurityConfig.java` | `oauth2Login()` condicional + sessão `IF_REQUIRED` |

### Frontend

| Arquivo | Alteração |
|---|---|
| `contexts/AuthContext.tsx` | Método `loginWithToken()` |
| `pages/OAuthCallbackPage.tsx` | **Novo** — processa token da URL |
| `pages/LoginPage.tsx` | Botão "Entrar com Google" |
| `App.tsx` | Rota pública `/auth/callback` |

---

## Solução de problemas

### `redirect_uri_mismatch`
O URI de redirecionamento no Google Console não bate com o do backend.  
Verifique que `http://localhost:8080/login/oauth2/code/google` está cadastrado **exatamente** como mostrado.

### App não inicia — `Could not resolve placeholder 'GOOGLE_CLIENT_ID'`
Não defina a propriedade no `application.properties` com valor obrigatório.  
O padrão já é `${GOOGLE_CLIENT_ID:}` (vazio) — se a variável não existir, OAuth2 simplesmente não é ativado.

### Usuário criado via Google não consegue fazer login com senha
Correto — contas criadas pelo Google não têm senha. O usuário precisa usar o botão Google ou criar uma senha separadamente (funcionalidade de "definir senha" não incluída nesta versão).

### Tela "App não verificado" no Google
Normal em desenvolvimento. Clique em **"Avançado" → "Ir para [app] (não seguro)"**.  
Para produção, submeta o app para verificação no Google Cloud Console.
