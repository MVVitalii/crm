# CRM — план

Один пункт за раз. Следующий начинать только после проверки текущего. Мутации только через Server Actions. Организация берётся из URL `/{slug}`, не из поля формы.

Роли: `owner` управляет участниками, `manager` ведёт сделки, `viewer` только читает. Стадии: `lead`, `negotiation`, `won`. Сумма сделки хранится в копейках.

Перед любым кодом на Next.js читай `AGENTS.md` и гайды в `node_modules/next/dist/docs/`: в этой версии кэш и загрузка данных отличаются от старого Next.js.

## 1. Каркас

- [x] Приложение создано в этой папке: Next.js 16, TypeScript, Tailwind, ESLint, `src/`.
- Проверка: `pnpm dev` открывает `http://localhost:3000`.

## 2. Postgres

Docker нет, база ставится через Homebrew.

```bash
brew install postgresql@16
brew services start postgresql@16
export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"
createuser -s postgres
psql postgres -c "ALTER USER postgres PASSWORD 'postgres';"
createdb -O postgres crm
psql "postgres://postgres:postgres@localhost:5432/crm" -c "select 1"
```

- [ ] Команда `select 1` печатает `1`.
- Чтобы `psql` находился в новых окнах терминала, добавь `export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"` в `~/.zshrc`.

## 3. Зависимости и интерфейс

```bash
pnpm add better-auth @better-auth/drizzle-adapter drizzle-orm pg zod
pnpm add -D drizzle-kit tsx @types/pg
pnpm dlx shadcn@latest init -d
pnpm dlx shadcn@latest add button input label card dialog dropdown-menu sonner
```

- [ ] `pnpm lint` проходит.

## 4. Окружение

Файл `.env` в корне, не коммитить:

```bash
DATABASE_URL=postgres://postgres:postgres@localhost:5432/crm
BETTER_AUTH_SECRET=<вывод openssl rand -base64 32>
BETTER_AUTH_URL=http://localhost:3000
```

- [ ] Секрет сгенерирован через `openssl rand -base64 32`.

## 5. Drizzle

- [ ] `src/db/index.ts` экспортирует `db` через `drizzle(process.env.DATABASE_URL)`.
- [ ] `drizzle.config.ts`: эта база, схема `./src/db/schema.ts`, миграции в `./drizzle`.
- [ ] Скрипты в `package.json`: `db:generate` = `drizzle-kit generate`, `db:migrate` = `drizzle-kit migrate`.

## 6. Вход

- [ ] `src/lib/auth.ts`: Better Auth, `drizzleAdapter` с `provider: "pg"`, `emailAndPassword.enabled: true`, плагин `nextCookies()`. Плагин нужен, чтобы сессия читалась внутри Server Actions.
- [ ] `src/app/api/auth/[...all]/route.ts` экспортирует `{ GET, POST }` из `toNextJsHandler(auth)`.
- [ ] `src/lib/auth-client.ts` через `createAuthClient` для форм.

## 7. Схема и миграция

```bash
pnpm dlx auth@latest generate --adapter drizzle --dialect postgresql --output ./src/db/auth-schema.ts -y
```

- [ ] `src/db/schema.ts` реэкспортирует таблицы из `auth-schema.ts` и добавляет свои: `organizations`, `members`, `invitations`, `contacts`, `deals`, `notes`, `tasks`, `audit_logs`.
- [ ] Индекс по `organizationId` на рабочих таблицах.
- [ ] У `members` уникальная пара организация + пользователь.
- [ ] У `deals` уникальность `(organizationId, stage, position)`.
- [ ] Схема передана в адаптер Better Auth.
- [ ] `pnpm db:generate` и `pnpm db:migrate`.
- Проверка: в базе есть `user`, `session`, `account`, `organization`, `deal`.

## 8. Регистрация и организация

- [ ] Страницы `/login` и `/register` вызывают клиент Better Auth.
- [ ] Экшен `createOrganization` в одной транзакции создаёт организацию и членство `owner`. Slug из имени, уникальный.
- [ ] `/` для вошедшего показывает его организации и форму первой. Гостя уводит на `/login`.
- Проверка: после регистрации создаётся организация и виден её slug.

## 9. Чужие организации закрыты

- [ ] `src/server/tenant.ts`: `requireMember(slug)` берёт сессию, организацию и членство. Нет членства — `notFound()`.
- [ ] `requireRole(member, role)` сравнивает `viewer < manager < owner` и до записи возвращает запрет.
- [ ] `src/app/[orgSlug]/layout.tsx` вызывает `requireMember` и рисует оболочку: название, ссылки «Сделки», «Контакты», «Участники», «Аудит», выход.
- Проверка: второй пользователь по чужому slug получает 404.

## 10. Контакты и карточка сделки

Экшены: `createContact`, `createDeal`, `updateDeal`, `createNote`, `createTask`, `toggleTask`. В каждом: `requireRole(..., "manager")`, разбор Zod, запись, обновление страницы. `organizationId` из формы не читать — только из `requireMember`.

- [ ] Список контактов.
- [ ] `/[orgSlug]/deals/[dealId]`: поля, заметки, задачи.
- [ ] У `viewer` нет кнопок сохранения.
- Проверка: менеджер создаёт контакт и сделку, обновление страницы их сохраняет.

## 11. Канбан

```bash
pnpm add @dnd-kit/core @dnd-kit/sortable
```

- [ ] `/[orgSlug]/deals`: сервер отдаёт три колонки, клиентским остаётся только доска.
- [ ] `moveDeal` в транзакции проверяет организацию сделки, сдвигает `position` в старой и новой колонке и пишет аудит `deal.stage_changed` с `{ from, to }`.
- [ ] На клиенте карточка переезжает сразу и возвращается назад, если экшен вернул ошибку.
- [ ] Пустая колонка принимает карточку.
- Проверка: после обновления стадия та же, в колонке нет дырок в `position`.

## 12. Участники

- [ ] Приглашает только `owner`: email, роль, срок 7 дней, в базе хеш токена.
- [ ] В разработке ссылка `/invite/[token]` пишется в лог сервера.
- [ ] Принятие создаёт `member` и закрывает приглашение в одной транзакции. Чужой email и просроченный токен не проходят.
- [ ] Страница участников: смена роли и удаление. Owner не может снять себя, если он последний.
- [ ] Смена роли и удаление пишут аудит.
- Проверка: приглашённый открывает организацию как `viewer` и не может сохранить сделку даже прямым вызовом экшена.

## 13. Аудит

- [ ] `/[orgSlug]/audit` читает ленту только этой организации, новые записи сверху.
- [ ] Пишет аудит сам экшен внутри своей транзакции. Отдельного экшена «добавить запись» нет.
- Проверка: перенос сделки даёт одну строку со старой и новой стадией.

## 14. Тесты и демо

- [ ] Vitest: чужой пользователь не читает сделки; `viewer` не вызывает `moveDeal`; смена стадии пишет одну строку аудита.
- [ ] Playwright: регистрация, организация, контакт, сделка, перенос в «Переговоры», строка в аудите.
- [ ] `pnpm lint`.
- [ ] Ручной проход: пустая колонка, ошибка сохранения, экран `viewer`.

Демо в конце: owner создаёт организацию и сделку, перетаскивает её, приглашает viewer, под viewer сохранение недоступно, в аудите видна смена стадии.
