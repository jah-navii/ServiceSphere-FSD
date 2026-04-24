import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],

    // Set env vars before any module is imported — avoids real .env being used
    env: {
      NODE_ENV:      'test',
      MONGO_URI:     'mongodb://placeholder:27017/test',  // overridden in setup.js
      JWT_SECRET:    'test-jwt-secret-at-least-16-chars',
      JWT_EXPIRY:    '1h',
      CLIENT_URL:    'http://localhost:5173',
      PORT:          '5001',
      CACHE_DRIVER:  'memory',
      SEARCH_DRIVER: 'mongo',
      MEILI_HOST:    'http://localhost:7700',
      MEILI_MASTER_KEY: '',
      LOG_LEVEL:     'silent',
    },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        '**/node_modules/**',
        'tests/**',
        'scripts/**',
        'benchmarks/**',
        'uploads/**',
        '**/*.config.js',
      ],
    },

    reporters: ['default', ['junit', { outputFile: './test-results/junit.xml' }]],
  },
});
