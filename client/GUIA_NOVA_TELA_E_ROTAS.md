# Guia: Nova Tela e Rotas (React + Vite)

Este guia mostra como criar uma nova tela no projeto e configurar a rota para ela.

## Contexto atual do projeto

- O `client` usa **React + Vite + TypeScript**.
- Hoje, o `main.tsx` renderiza apenas o `App.tsx`.
- Ainda nao existe biblioteca de rotas instalada.

## 1. Instalar o roteador

No terminal, dentro de `client`:

```bash
npm install react-router-dom
```

## 2. Criar a nova tela

Crie uma pasta `pages` (se ainda nao existir):

`client/src/pages`

Exemplo de nova tela:

Arquivo: `client/src/pages/PerfilPage.tsx`

```tsx
export function PerfilPage() {
  return (
    <main style={{ padding: '1rem' }}>
      <h1>Perfil</h1>
      <p>Essa e a nova tela de perfil.</p>
    </main>
  )
}
```

## 3. Criar arquivo central de rotas

Crie a pasta:

`client/src/routes`

Arquivo: `client/src/routes/AppRoutes.tsx`

```tsx
import { Route, Routes } from 'react-router-dom'
import App from '../App'
import { PerfilPage } from '../pages/PerfilPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/perfil" element={<PerfilPage />} />

      {/* fallback 404 */}
      <Route path="*" element={<h1>Pagina nao encontrada</h1>} />
    </Routes>
  )
}
```

## 4. Conectar as rotas no `main.tsx`

Edite `client/src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AppRoutes } from './routes/AppRoutes'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>,
)
```

## 5. Navegar para a nova tela

Use `Link` para navegar sem recarregar a pagina:

```tsx
import { Link } from 'react-router-dom'

export function AlgumComponente() {
  return <Link to="/perfil">Ir para Perfil</Link>
}
```

Ou navegue por codigo:

```tsx
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
navigate('/perfil')
```

## Padrao recomendado para novas telas

Para cada nova tela:

1. Criar arquivo em `src/pages/NomeDaTelaPage.tsx`.
2. Registrar a rota em `src/routes/AppRoutes.tsx`.
3. Adicionar link/botao de acesso na interface.
4. Testar navegacao manual (`/rota`) e clique de link.

## Extras uteis

### Rotas com parametro

```tsx
<Route path="/livro/:id" element={<LivroDetalhePage />} />
```

Na tela:

```tsx
import { useParams } from 'react-router-dom'

const { id } = useParams()
```

### Organizar crescimento do projeto

- Rotas: `src/routes/AppRoutes.tsx`
- Telas: `src/pages/*`
- Componentes reutilizaveis: `src/components/*`
- Tipos/interfaces: `src/types/*`
- Dados mock/estaticos: `src/data/*`

### Deploy de SPA (importante)

Em producao, o servidor precisa redirecionar rotas para `index.html` (history fallback), senao ao atualizar `https://seu-dominio/perfil` pode dar 404.

## Checklist rapido (copiar e usar)

- [ ] Criei o arquivo da nova tela em `src/pages`.
- [ ] Registrei a rota em `AppRoutes.tsx`.
- [ ] Adicionei navegacao (`Link` ou `navigate`).
- [ ] Testei acesso direto pela URL da rota.
- [ ] Testei rota inexistente (`*`) para validar 404.
