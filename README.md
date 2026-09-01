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
  { action: "/users", method: "post" },
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
