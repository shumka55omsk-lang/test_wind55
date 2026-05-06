# Vercel-ready папка

Эту папку можно загружать в GitHub и подключать к Vercel.

## Структура

- `index.html` — главная страница
- `styles.css` — стили
- `script.js` — калькулятор и мессенджеры
- `api/send-telegram.js` — отправка заявки в Telegram
- `api/check-telegram.js` — проверка переменных Telegram
- `assets/` — картинки
- `robots.txt` — индексация
- `sitemap.xml` — карта сайта
- `vercel.json` — настройки Vercel
- `package.json` — Node.js настройки

## В Vercel добавить переменные

Project → Settings → Environment Variables:

TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID

После добавления переменных нажмите Redeploy.

## Проверка

Откройте:

/api/check-telegram

Если `telegramBotTokenConfigured` и `telegramChatIdConfigured` равны `true`, отправка формы готова.


## Исправление кнопки Telegram

В этой версии кнопка Telegram получает ссылку автоматически через `/api/telegram-link`.

Vercel берёт `TELEGRAM_BOT_TOKEN`, запрашивает username бота и отдаёт на сайт ссылку вида:

```text
https://t.me/username_бота
```

Проверка после деплоя:

```text
https://ваш-домен/api/telegram-link
```

Должно вернуться:

```json
{
  "ok": true,
  "username": "имя_бота",
  "url": "https://t.me/имя_бота"
}
```

Важно: при открытии `index.html` двойным кликом на ПК ссылка Telegram может не подтянуться, потому что `/api/telegram-link` работает на Vercel.


## Telegram-кнопка

Кнопка Telegram настроена на прямой личный профиль:

```text
https://t.me/Anvar_company
```

Она не ведет на бота. Отправка формы заявки в Telegram через Vercel при этом остается через `api/send-telegram.js`.


## Исправлены ссылки мессенджеров

В этой версии ссылки прописаны прямо в `script.js` и дополнительно в `index.html`.

- WhatsApp: `https://wa.me/79039812452?text=%D0%97%D0%B4%D1%80%D0%B0%D0%B2%D1%81%D1%82%D0%B2%D1%83%D0%B9%D1%82%D0%B5%21%20%D0%A5%D0%BE%D1%87%D1%83%20%D1%80%D0%B0%D1%81%D1%81%D1%87%D0%B8%D1%82%D0%B0%D1%82%D1%8C%20%D0%BC%D1%8F%D0%B3%D0%BA%D0%B8%D0%B5%20%D0%BE%D0%BA%D0%BD%D0%B0%20%D0%B2%20%D0%9E%D0%BC%D1%81%D0%BA%D0%B5.`
- Telegram: `https://t.me/Anvar_company`
- Max: `https://max.ru/u/f9LHodD0cOLj76aZjFESkEjxSbv_ofti1cN5XI0YOvDp1yXr_IPVvSgBW5s`

Если нужно заменить номер WhatsApp, измените номер `73812489878` в `script.js` и `index.html`.


## Яндекс Метрика

В `index.html` встроен счетчик Яндекс Метрики:

```text
ID: 109028168
```

Скрипт установлен перед `</head>`, а `noscript` — сразу после `<body>`.
