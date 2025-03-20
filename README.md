## Описание

<p>Данный проект был разработан, как backend-севрвер для клиент-серверной архитекутуры с frontend-сайтом из репозитория <strong>chat-ai-frontend</strong>, для взамодействием с ИИ через текстовые и аудио сообщения</p>

## Технологии для реализации

<p>Библитеки и фрэймворки:</p>
<br/>
<ul>
  <li><strong>Nest js</strong></li>
  <li><strong>TypeScript</strong></li>
  <li><strong>Prisma ORM</strong></li>
</ul>
<br/>
<p>Стороние API:</p>
<ul>
  <li>Для обработки запросов пользователя <strong>OpenAI API</strong></li>
  <li>Для конвертации речи в текст <strong>Whisper API</strong></li>
</ul>
<br/>

## Требования для сборки

<P>Node js > 20v</P>
<br/>
<p>Убедитесь что ваша версия Node js подходит.</p>

```bash
$ node -v
```

## Установка зависимостей

```bash
$ npm install
```

## Сборка проекта

```bash
$ npm run build
```

## Запуск проекта

```bash
$ npm run start
```

## База Данных

<p>Используемая база данных: <strong>MongoDB</strong></p>
<br/>
<ul>
  <li>Запустите свой сервер MongoDB <strong>(это можно сделать на официальном сайте mongodb.com)</strong></li>
  <li>Создайте в корне проекта файл .env</li>
  <li>Впешите <strong>DATABASE_URL=""</strong> и укажите в двойных кавычках ссылку на вашу базу данных</li>
</ul>
