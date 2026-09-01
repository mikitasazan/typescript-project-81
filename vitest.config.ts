import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Тестовые файлы
    include: ["**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // Папка для отчётов
      reportsDirectory: "coverage",
      reporter: ["json", "lcov", "text", "clover"],
      // Какие файлы включать в покрытие. index.ts — это и есть весь
      // реальный код проекта (генератор форм), поэтому исключать его из
      // покрытия было дырой: порог был зелёным при нулевом покрытии
      // фактической логики. __tests__/index.test.ts закрывает её реальными
      // тестами.
      include: ["src/**/*.ts"],
      // Порог покрытия: ниже него `make test-coverage` падает,
      // и сборка в CI краснеет вместе с ним
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
