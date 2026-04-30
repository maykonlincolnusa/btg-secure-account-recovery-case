# Secure Account Recovery

Base técnica production-grade para um fluxo bancário crítico de recuperação de acesso, validação de identidade, prevenção de fraude e alteração segura de e-mail e telefone. O projeto é um protótipo arquitetural executável localmente, sem integrações proprietárias reais, sem dados reais e sem dependência obrigatória de credenciais externas.

## Visão Geral

O sistema implementa um fluxo completo de recuperação com geração de protocolo, FaceMatch mockado, liveness mockado, motor de risco baseado em regras, step-up/cooldown/revisão manual, aprovação ou rejeição operacional, alteração segura de contato, auditoria append-only e histórico de estados.

Todos os serviços externos são abstraídos por interfaces e usam mocks por padrão:

- `MockFaceMatchProvider`
- `MockLivenessProvider`
- `MockNotificationProvider`
- `RuleBasedRiskEngine`

## Admin em modo demo offline

O painel administrativo também possui um fallback de demonstração. Quando a API backend está offline ou indisponível, a tela mostra uma mensagem explícita e carrega uma solicitação demo para que a interface possa ser avaliada sem Postgres, Redis ou serviços locais ativos.

Esse comportamento é intencional para apresentações e revisão visual do protótipo. Em ambiente real, a mensagem deve desaparecer quando a API estiver ativa em `http://localhost:3001` e o admin passará a consumir os dados persistidos.

![Painel administrativo em modo demo offline](https://github.com/maykonlincolnusa/btg-secure-account-recovery-case/blob/main/docs/assets/admin-demo-offline.jpeg?raw=true)

Imagem versionada no repositório: [`docs/assets/admin-demo-offline.jpeg`](docs/assets/admin-demo-offline.jpeg).

## Problema Resolvido

Alterar dados sensíveis de contato em contexto bancário exige evidência de identidade, prova de presença, avaliação de risco, proteção contra replay, trilha auditável e separação clara entre automação e revisão humana. Esta base demonstra como organizar esses requisitos sem acoplar o produto a sistemas internos reais.

## Motivação do Caso

Esta solução foi motivada por uma experiência real reportada em um fluxo de recuperação de senha de acesso no BTG Pactual. O problema observado foi a dependência de um protocolo operacional pouco eficiente quando o cliente já não tem acesso ao número de telefone e ao e-mail cadastrados, especialmente em um cenário comum: troca de celular, troca de chip ou mudança de contato sem atualização prévia dos dados dentro da plataforma.

Nesse tipo de situação, o cliente legítimo pode ficar preso em um ciclo de recuperação que depende justamente dos canais aos quais ele perdeu acesso. Para um produto financeiro, isso cria atrito elevado, aumenta chamadas para suporte, amplia tempo de resolução e pode incentivar procedimentos manuais difíceis de auditar.

A proposta deste projeto é oferecer uma alternativa técnica mais robusta para esse cenário: recuperar acesso e permitir atualização segura de e-mail e telefone somente após validação de identidade, liveness, avaliação de risco, auditoria completa e, quando necessário, revisão manual. Embora o caso motivador tenha sido observado no contexto do BTG Pactual, a arquitetura é genérica e também se aplica a bancos e fintechs como Itaú, Bradesco, Santander, Nubank e outras instituições que enfrentam o mesmo desafio de equilibrar experiência do cliente, prevenção a fraude e governança operacional.

Este repositório não assume acesso, integração ou conhecimento interno de qualquer instituição financeira. Ele funciona como referência técnica independente para demonstrar como esse tipo de fluxo poderia ser redesenhado com controles de segurança, rastreabilidade e extensibilidade desde o início.

## Arquitetura

```text
apps/api      NestJS REST API, Prisma, Swagger, auditoria e providers mock
apps/web      Next.js para usuário final
apps/admin    Next.js para operadores
packages/domain     entidades, state machine, políticas e risco
packages/contracts  DTOs Zod e contrato OpenAPI de referência
packages/utils      mascaramento, protocolo e sanitização
packages/config     validação de configuração
prisma              schema, migration inicial e seed
infra               Dockerfiles e Docker Compose
```

A API segue a separação:

- `presentation`: controllers e DTOs;
- `application`: `RecoveryService`, `AuditService`, `NotificationService`, `RiskEngineService`;
- `domain`: packages compartilhados com regras centrais;
- `infrastructure`: Prisma e providers.

## Stack

- Monorepo: Turborepo + npm workspaces
- Frontend: Next.js, TypeScript, Tailwind, React Hook Form, Zod
- Backend: NestJS, TypeScript
- Persistência: Prisma + PostgreSQL
- Cache/fila local: Redis no Docker Compose, preparado para evolução
- Testes: Vitest, Nest Testing e Supertest
- API docs: Swagger em `/api/docs`
- Observabilidade: JSON logs, `x-request-id`, health e readiness
- CI: GitHub Actions em `.github/workflows/ci.yml`

## Modelo de Domínio

Entidades principais:

- `User`
- `RecoveryRequest`
- `VerificationAttempt`
- `RiskAssessment`
- `AuditEvent`
- `StatusHistory`
- `NotificationEvent`
- `ManualReviewDecision`
- `ContactChangeRequest`

O Prisma persiste todas as entidades relevantes com relacionamentos explícitos. Dados sensíveis são mascarados antes de resposta, log e auditoria.

## Máquina de Estados

Estados suportados:

- `INITIATED`
- `IDENTITY_PENDING`
- `FACE_VERIFIED`
- `LIVENESS_VERIFIED`
- `RISK_EVALUATING`
- `STEP_UP_REQUIRED`
- `UNDER_REVIEW`
- `COOLDOWN`
- `APPROVED`
- `REJECTED`
- `COMPLETED`
- `FAILED`

Regra central: nenhuma alteração de e-mail ou telefone ocorre antes de FaceMatch aprovado, liveness aprovado e decisão positiva automática ou manual.

## Fluxo do Usuário

1. Usuário acessa `/recovery`.
2. Informa identificador, contatos anteriores e novos contatos.
3. API cria `protocolId` rastreável.
4. Usuário acompanha `/recovery/[protocolId]`.
5. Ambiente demo permite disparar FaceMatch, liveness e risco.
6. Se aprovado, a alteração sensível é aplicada de forma mockada.
7. Status, decisões e histórico ficam visíveis ao usuário.

## Fluxo do Administrador

1. Operador acessa o app admin em `/recovery`.
2. Lista solicitações e filtra por status, risco e protocolo.
3. Abre `/recovery/[protocolId]`.
4. Consulta risco, histórico e auditoria.
5. Aprova, rejeita ou adiciona nota operacional.
6. Cada ação gera evento auditável.

## Motor de Risco

`RuleBasedRiskEngine` usa sinais estruturados:

- dispositivo novo;
- IP incomum;
- geolocalização incompatível;
- tentativas repetidas;
- alteração sensível de contato;
- falha em FaceMatch;
- falha em liveness;
- comportamento anômalo;
- repetição de solicitações recentes.

Saída:

- `riskScore`
- `riskLevel`
- `riskReasons`
- `suggestedDecision`: `AUTO_APPROVE`, `STEP_UP`, `HOLD` ou `REJECT`

## Segurança e Compliance

Medidas implementadas desde a base:

- DTOs validados por `class-validator` e contratos Zod;
- rate limiting via `@nestjs/throttler`;
- idempotência em criação e ação crítica de contato;
- proteção contra replay por nonce em `contact-change`;
- logs JSON com sanitização;
- mascaramento de e-mail e telefone;
- auditoria append-only;
- histórico de status por solicitação;
- correlação por `x-request-id`;
- tratamento de erro centralizado;
- consentimento registrado em criação;
- health/readiness endpoints;
- configuração por variáveis de ambiente.

## API Principal

Públicas:

- `POST /api/recovery/requests`
- `GET /api/recovery/requests/:protocolId`
- `POST /api/recovery/requests/:protocolId/face-match`
- `POST /api/recovery/requests/:protocolId/liveness`
- `POST /api/recovery/requests/:protocolId/risk-assessment`
- `POST /api/recovery/requests/:protocolId/submit`
- `POST /api/recovery/requests/:protocolId/contact-change`

Administrativas:

- `GET /api/admin/recovery/requests`
- `GET /api/admin/recovery/requests/:protocolId`
- `GET /api/admin/recovery/requests/:protocolId/audit`
- `POST /api/admin/recovery/requests/:protocolId/approve`
- `POST /api/admin/recovery/requests/:protocolId/reject`
- `POST /api/admin/recovery/requests/:protocolId/note`

## Execução Local

1. Copie variáveis de exemplo se quiser customizar:

```bash
cp .env.example .env
```

2. Instale dependências:

```bash
npm install
```

3. Suba PostgreSQL e Redis:

```bash
docker compose -f infra/compose/docker-compose.yml up postgres redis
```

4. Gere Prisma e rode migrations:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

5. Rode os apps:

```bash
npm run dev
```

URLs:

- usuário: `http://localhost:3000/recovery`
- admin: `http://localhost:3002/recovery`
- API: `http://localhost:3001`
- Swagger: `http://localhost:3001/api/docs`
- health: `http://localhost:3001/health`
- readiness: `http://localhost:3001/ready`

Também é possível subir tudo via:

```bash
npm run docker:up
```

## Variáveis de Ambiente

Veja `.env.example`. Principais:

- `DATABASE_URL`
- `REDIS_URL`
- `API_PORT`
- `NEXT_PUBLIC_API_BASE_URL`
- `RATE_LIMIT_TTL_SECONDS`
- `RATE_LIMIT_MAX_REQUESTS`
- `IDEMPOTENCY_TTL_SECONDS`

Nenhum segredo real deve ser versionado.

## Scripts

- `npm run dev`: roda apps em paralelo
- `npm run build`: compila monorepo
- `npm run test`: executa testes
- `npm run lint`: executa lint
- `npm run db:generate`: gera Prisma Client
- `npm run db:migrate`: aplica migrations locais
- `npm run db:seed`: cria dados demo
- `npm run docker:up`: sobe stack local

## Testes

Cobertura inicial:

- unidade de domínio: state machine, risco e política de alteração;
- integração de controller API com Nest Testing e Supertest;
- unidade de serviço para bloqueio por idempotência/replay;
- contrato básico de repositório/auditoria append-only.

Comandos:

```bash
npm run test
npm run test:unit
npm run test:integration
```

## Limitações do Protótipo

- FaceMatch, liveness e notificação são mocks.
- Redis está disponível na infraestrutura local, mas filas assíncronas ainda não foram ligadas ao fluxo.
- Autenticação real de usuário e operador está fora do escopo do protótipo.
- Step-up está modelado no estado e decisão de risco, mas a etapa real de desafio adicional deve ser integrada depois.
- Repositórios ainda usam Prisma diretamente no serviço principal; há espaço para separar implementações por aggregate em uma próxima iteração.

## Roadmap

- Adicionar autenticação OIDC/MFA para usuários e operadores.
- Implementar challenge real de step-up.
- Separar repositórios por aggregate root.
- Adicionar fila Redis/BullMQ para notificações e revisão.
- Adicionar criptografia de campos sensíveis em repouso.
- Integrar vault para segredos.
- Expandir métricas Prometheus/OpenTelemetry.
- Criar testes e2e com banco isolado por container.
- Adicionar RBAC operacional e trilha de quatro-olhos para decisões críticas.
- Introduzir adaptadores reais de biometria e antifraude atrás das interfaces existentes.

## Notas de Compliance e Auditoria

O desenho assume auditoria append-only, mínima exposição de dados pessoais, rastreabilidade por protocolo e correlação por request id. Antes de uso real em instituição financeira, a solução deve passar por revisão de segurança, privacidade, jurídico, modelagem de ameaças, validação de retenção de dados, revisão de logs, análise de segregação de funções e homologação com fornecedores reais.
