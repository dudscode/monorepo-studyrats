# StudyRats Constitution

## Core Principles

### I. Commits Semânticos (NON-NEGOTIABLE)
Todos os commits devem seguir o padrão **Conventional Commits**:
- Formato: `<type>(<scope>): <description>`
- Types permitidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`
- Exemplos: `feat(auth): add JWT refresh token`, `fix(api): handle null user on login`
- Commits sem tipo semântico são rejeitados no CI
- Breaking changes devem usar `!` ou `BREAKING CHANGE:` no footer

### II. Branches Semânticas (NON-NEGOTIABLE)
Nomenclatura de branches segue o padrão: `<type>/<issue-id>-<short-description>`
- Types: `feat/`, `fix/`, `chore/`, `docs/`, `refactor/`, `test/`, `perf/`
- Exemplos: `feat/42-user-authentication`, `fix/17-broken-login-redirect`
- Branches direto em `main` são proibidas (exceto hotfixes com aprovação)
- PRs devem partir de branches semânticas; nomes fora do padrão bloqueiam o merge

### III. Core Web Vitals (NON-NEGOTIABLE)
Todo frontend deve atingir e manter os thresholds "Good" do Google:
- **LCP** (Largest Contentful Paint): ≤ 2.5s
- **INP** (Interaction to Next Paint): ≤ 200ms
- **CLS** (Cumulative Layout Shift): ≤ 0.1
- Medições obrigatórias via Lighthouse CI em cada PR
- Regressões de Web Vitals bloqueiam o merge

### IV. Cobertura de Testes Unitários 100% (NON-NEGOTIABLE)
- Cobertura de testes unitários deve ser **100%** (linhas, branches, funções)
- TDD obrigatório: testes escritos → aprovados pelo usuário → falham → então implementa
- Ciclo Red-Green-Refactor estritamente aplicado
- PRs com cobertura abaixo de 100% são rejeitados automaticamente no CI
- Exceções (código gerado, mocks) devem ser explicitamente marcadas com `/* istanbul ignore */` e justificadas

### V. Testes E2E
- Fluxos críticos devem ter cobertura E2E obrigatória: autenticação, pagamentos, cadastro, navegação principal
- Testes E2E rodam em ambiente de staging antes de qualquer deploy em produção
- Ferramenta padrão: Playwright ou Cypress (definir por projeto)
- Novos fluxos críticos adicionados ao produto requerem testes E2E antes do merge

### VI. Segurança — Nunca Commitar Chaves Secretas (NON-NEGOTIABLE)
- **Proibido** commitar API keys, tokens, senhas, secrets ou qualquer credencial no repositório
- Usar `.env.local` (nunca versionado) e variáveis de ambiente gerenciadas pelo CI/CD
- Pre-commit hook obrigatório com `gitleaks` ou `detect-secrets` para bloquear commits com credenciais
- Toda secret deve estar em um vault (ex: GitHub Secrets, Doppler, Vault)
- Violação detectada no histórico git exige rotação imediata da chave e purge do histórico

### VII. HATEOAS + HAL (NON-NEGOTIABLE)
- Todas as APIs REST devem seguir **HATEOAS** (Hypermedia as the Engine of Application State)
- Responses seguem o padrão **HAL** (Hypertext Application Language — `application/hal+json`)
- Toda resposta de recurso deve incluir `_links` com pelo menos `self`
- Coleções devem incluir `_embedded` e links de paginação (`next`, `prev`, `first`, `last`)
- Exemplo mínimo de resposta:
  ```json
  {
    "id": "123",
    "name": "Estudo de Algoritmos",
    "_links": {
      "self": { "href": "/groups/123" },
      "members": { "href": "/groups/123/members" }
    }
  }
  ```
- Clientes **não** devem hardcodar URLs; devem navegar via links da API

## Segurança e Qualidade

- Nenhuma dependência com vulnerabilidades conhecidas (CVSS ≥ 7.0) entra em produção
- `npm audit` / equivalente roda em cada PR e bloqueia em vulnerabilidades críticas
- Code review obrigatório: mínimo 1 aprovação antes do merge
- Linter e formatter (ESLint + Prettier ou equivalente) configurados e sem bypass

## Workflow de Desenvolvimento

1. Criar branch semântica a partir de `main`
2. Escrever testes (unitários + E2E para fluxos críticos) antes da implementação
3. Implementar até todos os testes passarem
4. Garantir Web Vitals dentro dos thresholds (frontend)
5. Abrir PR com título semântico e descrição clara
6. CI verifica: cobertura 100%, Web Vitals, secrets scan, lint, testes E2E
7. Code review → merge para `main`

## Governance

Esta constituição substitui quaisquer outras práticas conflitantes no projeto.
Emendas requerem: documentação da mudança, justificativa, plano de migração e aprovação do time.
Todos os PRs devem verificar conformidade com esta constituição.
Complexidade adicional deve ser justificada frente aos princípios acima.

**Version**: 1.0.0 | **Ratified**: 2026-05-24 | **Last Amended**: 2026-05-24
