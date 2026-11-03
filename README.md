# AA DREAM

Сайт индивидуальной мебели на React 19, TypeScript, Tailwind CSS 4, Three.js / React Three Fiber. Vinext и Cloudflare Workers обслуживают страницу и API, Cloudflare D1 хранит заявки.

## Работа сайта

- Семь категорий и семь процедурных объёмных моделей.
- Реальные пропорции по ширине, высоте и глубине; сантиметры переводятся в метры сцены.
- 36 цветов, семь материалов с разной фактурой, отражением и стоимостью.
- Вращение мышью и касанием, масштабирование колесом/жестом и кнопками.
- Сравнение оттенков, сохранённые дизайны и корзина в localStorage текущего браузера.
- Заявка с именем, телефоном и комментарием записывается в D1. Цена вычисляется повторно на сервере; идентификатор предотвращает дубли при повторной отправке.
- После отправки можно скачать текстовую конфигурацию.

## Локальный запуск

Требуется Node.js >=22.13.0.

```sh
npm ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sour_maddog.sql
npm run dev
```

Адрес локальной разработки: http://127.0.0.1:5173/. Миграция выполняется один раз на новую локальную базу. Проверка типов: `npx tsc --noEmit`.

## Данные бренда

Ассортимент и цены — концептуальные, предварительные. Изменяются в `lib/furniture.ts`. Формула учитывает объём изделия, материал и количество. Это оценка для заявки, не платёж.

Настоящие телефон, адрес, почта, сроки изготовления и логистика не были предоставлены. Они не выдуманы; контактный раздел направляет к сохранению заявки. Автоматическая отправка заявок в CRM, email или мессенджеры не подключена. Сохранённые заявки доступны владельцу в Cloudflare D1 (база aa-dream-orders). До коммерческого запуска нужно заменить концептуальные модели и цены реальным ассортиментом, добавить контакты, политику обработки данных и процесс обработки заявок.

Дизайны хранятся на устройстве; заявки — в базе сайта. Оплата не подключена. Исходный репозиторий приватный. Развёртывание в собственном аккаунте Cloudflare публикует сайт на workers.dev.

## Изображение

`public/assets/hero.jpg` создано встроенным image_gen; оригинальный запрос сохранён в `ASSET_PROMPT.md`. Модели конструктора написаны на Three.js и не используют внешние GLB-файлы.

## Cloudflare hosting

This repository is configured for a standalone Cloudflare Worker with static assets and a D1 database. There is no ChatGPT sign-in requirement on the standalone deployment. The original Sites deployment is independent.

1. Install: `npm ci` (Node.js 22.13 or later).
2. Authenticate: `npx wrangler login`.
3. Create the order database once: `npx wrangler d1 create aa-dream-orders`.
4. Set its returned `database_id` in `wrangler.cloudflare.json`. Account and database IDs are configuration values, not credentials. Never commit API tokens.
5. Check: `npm run check`.
6. Build, apply any pending database migrations, and publish: `npm run deploy:cloudflare`.

For Cloudflare Workers Builds connected to this private GitHub repository, use build command `npm run build` and deploy command `node scripts/deploy-cloudflare.mjs`, with the repository root as the root directory. The deploy script applies pending schema migrations before updating the Worker.

The GitHub source is private; website visitors can access the public storefront and submit an order. No endpoint lists stored names or phone numbers. Orders are available to the account owner in the Cloudflare D1 console.
