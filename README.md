### Hexlet tests and linter status:
[![Actions Status](https://github.com/mikitasazan/typescript-project-81/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/mikitasazan/typescript-project-81/actions)

# Генератор форм на Typescript

Библиотека для генерации HTML-форм из объекта с данными — классическое
Hexlet-задание «hexlet-code» на TypeScript. `HexletCode.formFor(data,
options, callback)` строит `<form>` с полями `input`/`textarea`/`select`,
экранируя значения от XSS.

## Стек

- TypeScript (сборка — `tsc`, дев-запуск — `tsx`)
- Vitest — тесты и покрытие (порог 80% по всем метрикам, `vitest.config.ts`)
- oxlint + oxfmt — линт и форматирование

## Использование

```bash
make install   # npm ci
make build     # tsc -> dist/
make test      # vitest run
make test-coverage
```

Пример использования (то же самое исполняется в `__tests__/index.test.ts`):

```ts
import HexletCode from "./dist/src/index.js";

const html = HexletCode.formFor(
  { name: "rebecca", job: "admin", bio: "..." },
  { url: "/users", method: "post" },
  (form) => {
    form.input("name");
    form.input("job", { as: "select", options: { admin: "Admin", regular: "Regular" } });
    form.input("bio", { as: "textarea" });
    form.submit("Save");
  },
);
```

Проверено вручную сборкой (`make build`) и прогоном собранного
`dist/src/index.js` с реальными данными, включая значение с `<script>`,
`&` и кавычками — экранирование в атрибутах и в теле `<textarea>` работает
корректно.

## Что было не так и что исправлено (2026-09-03)

- Пакет никогда не собирался перед тем, как его импортировал внешний
  тестовый жгут проверки (`import HexletCode from "@hexlet/code"` резолвится
  через `node_modules`, куда пакет попадает как `file:`-зависимость) — `dist/`
  не в git, а команда `npm run build` нигде не вызывалась. Добавлен
  `"prepare": "npm run build"` в `package.json`: он выполняется на каждый
  `npm install`, включая установку пакета как `file:`-зависимости, и держит
  `dist/` актуальным.
- Реализация не соответствовала реальному контракту задания (взятому из
  фикстур настоящей проверки, не только из текста шагов): порядок атрибутов
  `<form>` — `method` затем `action`; `<textarea>` всегда получает
  `cols="20" rows="40"` по умолчанию (переопределяемо через `options`);
  опция `url` задаёт `action`; `input()` бросает `Error`, если поля нет в
  переданном шаблоне; `label`/`labelHtml` в опциях `input()` задают текст и
  дополнительные HTML-атрибуты лейбла. Все переписаны в `src/index.ts`, тесты
  в `__tests__/index.test.ts` обновлены под тот же контракт.

## Что было не так и что исправлено (2026-09-02)

- `src/index.ts` — единственный реальный код проекта — был явно исключён из
  покрытия в `vitest.config.ts` (`exclude: ["src/index.ts"]`), с комментарием
  «её не тестируют». Порог покрытия 80% был зелёным при нуле тестов на
  фактическую логику; единственный существовавший тест проверял только
  оставшийся от болерплейта `sum.ts`. Добавлены реальные тесты
  (`__tests__/index.test.ts`, 10 тестов, 100% строк/операторов/функций,
  91.66% ветвей), исключение убрано, `sum.ts`/`sum.test.ts` удалены как
  мёртвый код.
- Отдельный воркфлоу `.github/workflows/typescript.yml` (линт + typecheck +
  покрытие) был настроен на триггер `branches: main`, а у репозитория
  дефолтная ветка — `master`; воркфлоу никогда не запускался. Исправлено на
  `master`.
