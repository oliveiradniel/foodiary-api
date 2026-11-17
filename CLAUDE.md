# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral

`foodiary-api` é o backend serverless do **foodiary**, um app de diário alimentar. O usuário cadastra perfil e objetivo, recebe uma meta diária de calorias/macros e registra refeições por **foto** ou **áudio**. Uma IA (OpenAI) estima os alimentos, as quantidades e os macros de cada refeição.

- Mantenedor: Daniel Oliveira (único autor no histórico do git).
- Projeto de estudo do curso JStack.
- O `README.md` é o template padrão do Serverless Framework e não descreve este projeto.

## Stack

| Área | Tecnologia |
| --- | --- |
| Runtime | AWS Lambda, Node.js 24 (`nodejs24.x`), `arm64`, 128 MB por padrão, região `sa-east-1` |
| IaC / deploy | Serverless Framework v4 (`serverless.yml` + arquivos em `sls/`) |
| Linguagem | TypeScript 7, ESM (`"type": "module"`) |
| Build | esbuild do Serverless + plugin `unplugin-swc`; o SWC é necessário para os decorators e o `emitDecoratorMetadata` |
| HTTP | API Gateway HTTP API (v2) com JWT authorizer do Cognito |
| Auth | Amazon Cognito User Pool, com e-mails enviados pelo SES |
| Banco | DynamoDB, single-table design com GSI1 |
| Arquivos | S3 (`MealsBucket`) servido por CloudFront com OAC |
| Fila | SQS (`MealsQueue`) + DLQ + alarme do CloudWatch + SNS por e-mail |
| IA | SDK `openai`: `gpt-4.1-mini` (structured output via `zodResponseFormat`) e `gpt-4o-mini-transcribe` |
| Validação | Zod 4 (bodies, params, query e env) |
| E-mails | `react-email` (templates em `src/infra/emails/templates`) |
| DI | Container próprio (`src/kernel/di/Registry.ts`) + `reflect-metadata` |
| Lint / format | oxlint + Prettier |
| Pacotes | pnpm 12 (`packageManager` fixado no `package.json`) |

## Comandos

```bash
pnpm install
pnpm typecheck                 # tsc --noEmit
pnpm lint                      # oxlint
pnpm lint:fix
pnpm prettier --write .        # não existe script de format
pnpm email:dev                 # preview dos templates react-email

serverless deploy                          # stage dev (padrão)
serverless deploy --stage prod
serverless deploy function -f processMeal  # redeploy só do código de uma função
serverless logs -f processMeal --tail
serverless dev                             # roda as funções localmente com túnel para a AWS
```

**Não existem testes** nem framework de testes configurado. Para validar uma mudança, rode `pnpm typecheck` e `pnpm lint`.

A pasta `scripts/` está no `.gitignore`. Ela guarda scripts locais de experimento (`scripts/createMeal.ts`, `scripts/ai.ts`), que rodam com `tsx`.

## Variáveis de ambiente

Existem duas camadas.

**1. `.env` local** (modelo em `.env.example`), lido pelo Serverless via `${env:...}` na hora do deploy:

| Variável | Uso |
| --- | --- |
| `COGNITO_EMAILS_FROM`, `COGNITO_EMAILS_REPLY_TO` | Remetente e reply-to dos e-mails do Cognito |
| `SES_ARN` | Identidade SES usada pelo Cognito (`EmailSendingAccount: DEVELOPER`) |
| `ROUTE53_HOSTED_ZONE_ID` | Hosted zone dos domínios customizados |
| `API_DOMAIN_NAME` | Domínio customizado da API. Só é criado se esta variável e `ROUTE53_HOSTED_ZONE_ID` estiverem preenchidas |
| `DISABLE_DEFAULT_APIGW_ENDPOINT` | Desliga o endpoint `execute-api` padrão |
| `MEALS_CDN_DOMAIN_NAME`, `MEALS_CDN_CERTIFICATE_ARN` | Domínio customizado do CloudFront. O certificado precisa estar em `us-east-1` |
| `DLQ_ALARM_EMAIL` | E-mail inscrito no SNS do alarme da DLQ |
| `OPENAI_API_KEY` | Chave da OpenAI |

**2. Env das Lambdas**, definida em `sls/config/env.yml` e injetada pelas funções que declaram `environment: ${file(./sls/config/env.yml)}`. Ela é validada por Zod em `src/shared/config/envSchema.ts` (o `parse` roda no import) e exposta pela classe `AppConfig`:

`COGNITO_CLIENT_ID`, `COGNITO_CLIENT_SECRET`, `COGNITO_POOL_ID`, `MAIN_TABLE_NAME`, `MEALS_BUCKET`, `MEALS_CDN_DOMAIN_NAME` (domínio customizado ou o domínio `*.cloudfront.net`), `MEALS_QUEUE_URL`, `OPENAI_API_KEY`.

- Nova variável: adicione em `sls/config/env.yml`, em `envSchema.ts` e em `AppConfig`, e use via `AppConfig` injetado. Não leia `process.env` direto.
- Exceção: `OPENAI_API_KEY` não passa pelo `envSchema`, porque o SDK `openai` lê direto de `process.env`.
- Os triggers do Cognito **não recebem** `environment`. Não importe `AppConfig` nem `envSchema` neles, porque o `parse` falharia.

## Rotas

Todas as rotas usam JSON. As rotas privadas exigem `Authorization: Bearer <accessToken>`.

| Método | Rota | Auth | Body / query | Resposta |
| --- | --- | --- | --- | --- |
| POST | `/auth/sign-up` | pública | `{ account: { email, password(min 8) }, profile: { name, birthDate(YYYY-MM-DD), gender, height, weight, activityLevel, goal } }` | 201 `{ accessToken, refreshToken }` |
| POST | `/auth/sign-in` | pública | `{ email, password }` | 200 `{ accessToken, refreshToken }` |
| POST | `/auth/refresh-token` | pública | `{ refreshToken }` | 200 `{ accessToken, refreshToken }` (o refresh token é rotacionado) |
| POST | `/auth/forgot-password` | pública | `{ email }` | 204 (também retorna 204 se o usuário não existir) |
| POST | `/auth/forgot-password/confirm` | pública | `{ email, confirmationCode, newPassword }` | 204 |
| GET | `/me` | privada | — | 200 `{ profile: { name, birthDate, gender, height, weight, goal }, goal: { calories, proteins, fats, carbohydrates } }` |
| PUT | `/profiles` | privada | `{ name, birthDate, gender, height, weight }` | 204 |
| PUT | `/goals` | privada | `{ calories, proteins, carbohydrates, fats }` | 204 |
| POST | `/meals` | privada | `{ file: { type: 'audio/m4a' \| 'image/jpeg', size(bytes, até 10MB) }, timezone(IANA) }` | 201 `{ mealId, uploadSignature }` |
| GET | `/meals?date=YYYY-MM-DD` | privada | query `date` | 200 `{ meals: [{ id, createdAt, name, icon, foods }] }`, só refeições `SUCCESS`, mais recentes primeiro |
| GET | `/meals/{mealId}` | privada | `mealId` (uuidv7) | 200 `{ meal: { id, status, inputType, inputFileURL, name, icon, foods, timezone, createdAt } }` |

Valores dos enums: `gender` aceita `MALE` ou `FEMALE`. `activityLevel` aceita `SEDENTARY`, `LIGHT`, `MODERATE`, `HEAVY` ou `ATHLETE`. `goal` aceita `LOSE`, `MAINTAIN` ou `GAIN`.

Funções que não são HTTP:
- `onMealFileUploaded`: evento S3 `ObjectCreated` no `MealsBucket`.
- `processMeal`: consumidor SQS do `MealsQueue`, com `batchSize: 2`, 1024 MB e timeout de 120 s.
- `preSignUpTrigger`, `customMessageTrigger` e `preTokenGenerationTrigger` (V2): triggers do Cognito.

Formato de erro: `{ "error": { "code": ErrorCode, "message": string | [{ field, error }] } }`.

## Arquitetura

As camadas ficam em `src/`, com aliases definidos no `tsconfig.json`: `@application/*`, `@infra/*`, `@kernel/*`, `@main/*`, `@shared/*` e `@utils/*`.

```
main/functions/*        handler da Lambda = adapter(Classe); sem lógica
main/adapters/*         lambdaHttpAdapter | lambdaS3Adapter | lambdaSQSAdapter
application/controllers Controller<'public'|'private', Response>; valida e chama usecase/query
application/usecases    regras de negócio (escrita)
application/queries     leitura otimizada direto no Dynamo (CQRS leve), sem passar por entidade/repositório
application/events      FileEventHandler (S3)
application/queues      QueueConsumer (SQS)
application/entities    Account, Profile, Goal, Meal (classes + namespace com tipos/enums)
application/services    GoalCalculator
infra/database/dynamo   items (mapeamento entidade↔item e chaves), repositories, uow
infra/gateways          AuthGateway (Cognito), MealsFileStorageGateway (S3/CDN), MealsQueueGateway (SQS)
infra/ai                MealsAIGateway + prompts
kernel                  DI (Registry) e decorators (@Injectable, @Schema)
shared                  AppConfig/env, Saga, utils
```

### Injeção de dependência

- `@Injectable()` registra a classe no `Registry` singleton no momento do import. O token é `class.name`. As dependências vêm de `design:paramtypes` (o `emitDecoratorMetadata` funciona por causa do SWC).
- `Registry.resolve` cria **instâncias novas a cada chamada**, sem cache. Os adapters resolvem o controller/handler **por invocação**, ou por record no S3 e no SQS. Os clients da AWS e da OpenAI (`src/infra/clients/*`) são singletons de módulo e são reaproveitados entre invocações.
- As dependências injetadas no construtor precisam ser importadas como **valor**, não com `import type`. Caso contrário, o metadata sai `undefined`. Por isso o código tem `// oxlint-disable-next-line typescript/consistent-type-imports` (ou `// oxlint-disable typescript/consistent-type-imports` no topo do arquivo) antes desses imports. Mantenha esse padrão.

### Controllers e validação

- `@Schema(zodSchema)` no controller valida **só o body**, dentro de `Controller.execute`.
- `params` e `queryParams` são validados manualmente no `handle` com `schema.parse(...)`. Os schemas ficam em `controllers/<domínio>/schemas/`.
- Rota `'private'` recebe `accountId`, que vem do claim `internalId` do access token lido pelo `lambdaHttpAdapter`. Rota `'public'` recebe `accountId: null`.
- Datas de entidades viram ISO string na resposta.

### Erros

- `ZodError` vira 400 `VALIDATION`, com a lista `{ field, error }`.
- `HttpError` (ex: `BadRequest` para body malformado) e `ApplicationError` (`src/application/errors/application/*`) carregam `statusCode` e `code`.
- Qualquer outro erro é logado e vira 500 `INTERNAL_SERVER_ERROR`.
- Novo erro de domínio: adicione o código em `ERROR_CODE` (`src/application/errors/ErrorCode.ts`), crie uma classe que estende `ApplicationError` com `name`, `message`, `code` e `statusCode` e lance essa classe.
- **Tradução de erros do SDK da AWS**: use `.catch` no `client.send(command)` dentro do gateway e compare por `error.name` (helper `isCognitoError` no `AuthGateway`). **Não use `instanceof`** com as classes de erro do SDK, porque falha no runtime da Lambda: o `@aws-sdk/*` fica `external` no bundle e vem do runtime.

### Auth (Cognito)

- O username é o e-mail. O client tem secret, então toda chamada envia `SECRET_HASH` (HMAC-SHA256 de `email + clientId`, gerado em `AuthGateway.getSecretHash`). O fluxo é `USER_PASSWORD_AUTH`. O access token vale 12 h e o refresh token é rotacionado.
- `Account.id` é um uuidv7 interno, gravado no Cognito como `custom:internalId`. `Account.externalId` é o `sub` do Cognito.
- `preSignUpTrigger` confirma o usuário e o e-mail automaticamente.
- `preTokenGenerationTrigger` (V2) injeta `internalId` no access token, e a API usa esse claim como `accountId`.
- `customMessageTrigger` renderiza o template React Email `ForgotPassword` (em pt-BR) para o código de recuperação.
- **Sign-up** (`SignUpUseCase`):
  1. Verifica o e-mail no GSI1.
  2. Calcula a meta com `GoalCalculator` (Harris-Benedict revisada × fator de atividade, ±500 kcal conforme o objetivo; proteína e gordura em g/kg, carboidrato com o restante).
  3. Cria o usuário no Cognito.
  4. Grava Account, Profile e Goal numa transação (`SignUpUnitOfWork` → `TransactWriteCommand`).
  5. Se algo falhar depois do passo 3, a `Saga` compensa removendo o usuário do Cognito (`AdminDeleteUser`).
  6. Por fim faz sign-in e devolve os tokens.

### DynamoDB (single-table `MainTable`)

| Item | PK | SK | GSI1PK | GSI1SK |
| --- | --- | --- | --- | --- |
| Account | `ACCOUNT#<accountId>` | `ACCOUNT#<accountId>` | `ACCOUNT#<email>` | `ACCOUNT#<email>` |
| Profile | `ACCOUNT#<accountId>` | `ACCOUNT#<accountId>#PROFILE` | — | — |
| Goal | `ACCOUNT#<accountId>` | `ACCOUNT#<accountId>#GOAL` | — | — |
| Meal | `ACCOUNT#<accountId>#MEAL#<mealId>` | igual à PK | `MEALS#<accountId>#<YYYY-MM-DD local>` | `MEAL#<mealId>` |

- Todo item tem `type` (`Account`, `Profile`, `Goal` ou `Meal`).
- As classes `*Item` concentram a montagem de chaves e as conversões `fromEntity`, `toItem` e `toEntity`. As datas são gravadas como ISO string.
- `GetProfileAndGoalQuery` busca profile e goal numa única query: `PK = ACCOUNT#id AND begins_with(SK, 'ACCOUNT#id#')`.
- A data do GSI1 da refeição é o **dia local no timezone enviado pelo cliente** (`toLocaleDateString('en-CA', { timeZone })`). É isso que faz o `GET /meals?date=` funcionar por dia do usuário.
- Os `save` dos repositórios usam `UpdateCommand` com a lista explícita de campos mutáveis. Ao criar um campo novo editável, inclua ele no `UpdateExpression`. Ao expor um campo numa query, inclua ele também no `ProjectionExpression` e no `ExpressionAttributeNames`.
- PITR fica ligado (35 dias). Deletion protection e `DeletionPolicy: Retain` só valem em `prod` (`custom.deletion*` no `serverless.yml`).

### Fluxo de refeição (assíncrono)

1. `POST /meals` cria a `Meal` com status `UPLOADING` e gera um **presigned POST** do S3. A chave é `<accountId>/<uuidv7>.m4a|jpeg`, o POST expira em 5 min, o `content-length` precisa ser exato, o `Content-Type` é fixo e o metadata leva `x-amz-meta-mealid` e `x-amz-meta-accountid`. A resposta traz `uploadSignature` = base64 de `JSON { url, fields }`. O cliente decodifica e faz o upload multipart direto no S3.
2. O S3 `ObjectCreated` dispara `onMealFileUploaded`, que lê o metadata via `HeadObject`, muda o status para `QUEUED` e publica `{ accountId, mealId }` no SQS.
3. `processMeal` roda o `ProcessMealUseCase`:
   - `UPLOADING` ou `PROCESSING` lançam erro, e a mensagem volta para a fila.
   - `SUCCESS` é idempotente: retorna sem fazer nada.
   - Nos outros casos, marca `PROCESSING`, incrementa `attempts` e chama o `MealsAIGateway`.
   - Se der certo, grava `SUCCESS` com `name`, `icon` e `foods`.
   - Se der erro, volta para `QUEUED` ou vira `FAILED` quando `attempts >= 2`, e relança o erro.
4. Na IA, a **foto** é enviada como URL da CDN (`detail: 'high'`). O **áudio** é baixado da CDN, transcrito e enviado como texto. A resposta é validada pelo mesmo `mealSchema` Zod. Nome e emoji da refeição vêm da hora local, segundo `getMealClassificationPrompt` (Café da Manhã, Lanche, Almoço etc., em pt-BR).
5. SQS: `VisibilityTimeout` de 130 s, maior que o timeout de 120 s da função. Com `maxReceiveCount: 2` a mensagem vai para a `MealsDLQ` (retenção de 14 dias), e mensagens visíveis na DLQ disparam um alarme do CloudWatch que envia e-mail via SNS.
6. As URLs públicas dos arquivos são `https://<MEALS_CDN_DOMAIN_NAME>/<fileKey>` (`MealsFileStorageGateway.getFileURL`). O bucket é privado e só o CloudFront lê, via OAC.

### Infra (`sls/`)

- `sls/functions/*.yml`: uma entrada por função. Funções novas entram no arquivo do domínio, e arquivos novos precisam ser incluídos em `functions:` no `serverless.yml`.
- `sls/resources/*.yml`: CloudFormation de cada recurso. Os domínios customizados (API e CDN) são **condicionais** às variáveis de ambiente.
- `sls/config/role.yml`: **uma única role IAM** compartilhada por todas as funções. Ao chamar uma ação nova da AWS (ex: `dynamodb:DeleteItem`, `s3:DeleteObject`), adicione a permissão aqui.
- Pré-requisitos por conta da AWS, executados uma vez: service-linked roles para o certificado do API Gateway e para o e-mail do Cognito. Os comandos estão nos comentários de `APIGWCustomDomain.yml` e `UserPool.yml`.
- `package.individually: true`: cada função gera seu próprio bundle (minificado, sem sourcemap, com `@aws-sdk/*` external e um banner `createRequire` para compatibilidade com ESM).

## Como adicionar uma rota HTTP

1. Crie o schema Zod em `src/application/controllers/<domínio>/schemas/`.
2. Crie o use case (escrita) ou a query (leitura) com `@Injectable()`.
3. Crie o controller com `@Injectable()` (e `@Schema(...)` se houver body), estendendo `Controller<'public'|'private', Response>`, e declare os tipos no `namespace` da classe.
4. Crie o handler em `src/main/functions/<domínio>/<nome>.ts`: `export const handler = lambdaHttpAdapter(XController);`.
5. Declare a função em `sls/functions/<domínio>.yml`, com `environment: ${file(./sls/config/env.yml)}` e `authorizer: name: CognitoAuthorizer` se for privada.
6. Se precisar, ajuste `sls/config/role.yml`.

## Convenções de código

- Formatação (Prettier): **tabs**, aspas simples, ponto e vírgula, trailing comma, largura 80. O `.editorconfig` diz 2 espaços, mas o Prettier e o código usam tabs.
- oxlint: `no-console` é erro (onde o log é intencional, use `// oxlint-disable-next-line no-console`), `eqeqeq` e `typescript/consistent-type-imports`, com a exceção da DI descrita acima.
- TS estrito, com `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `noImplicitOverride` (use `override` no `handle` e nas propriedades de erro) e `verbatimModuleSyntax`.
- Tipos ficam junto da classe via `export namespace NomeDaClasse { export type Input; export type Output; ... }`. Os enums de domínio ficam no namespace da entidade (`Meal.Status`, `Profile.Goal`).
- Os IDs são `randomUUIDv7()` de `node:crypto`.
- Código, nomes, mensagens de erro e prompts em inglês. O conteúdo voltado ao usuário final (e-mails e nomes de refeição) é em pt-BR.

## Commits

- Conventional Commits **sem escopo**, em inglês, no imperativo (ex: `feat: add PUT /goals endpoint to update daily goal`).
- Breaking change na API usa `!` (ex: `refactor!: return profile and goal at the root of getMe response`).
- Prefira 1 commit por mudança (no máximo 2), sem separar config ou formatação da mudança principal.
- Não há commitlint configurado.
