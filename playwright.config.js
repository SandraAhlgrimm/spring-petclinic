import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:8080';

export default defineConfig({
  testDir: './browser-tests',
  use: {
    baseURL,
    browserName: 'chromium',
    headless: true
  },
  webServer: {
    command: './mvnw -q spring-boot:run -Dspring-boot.run.arguments=--spring.docker.compose.lifecycle-management=NONE',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
