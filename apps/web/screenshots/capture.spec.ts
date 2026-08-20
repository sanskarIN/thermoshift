import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { expect, test } from '@playwright/test';

const OUTPUT_DIR = path.resolve(process.cwd(), '../../docs/screenshots');

const screenshotPath = (projectName: string, surface: string) =>
  path.join(OUTPUT_DIR, `${surface}-${projectName}.png`);

const prepareFreshState = async (page: import('@playwright/test').Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
};

test.beforeAll(async () => {
  await mkdir(OUTPUT_DIR, { recursive: true });
});

test('captures onboarding, converter, settings, and About', async ({ page }, testInfo) => {
  await prepareFreshState(page);
  await page.goto('/');

  const onboarding = page.getByRole('dialog', { name: /Precise conversion without an account/i });
  await expect(onboarding).toBeVisible();
  await page.screenshot({
    path: screenshotPath(testInfo.project.name, 'onboarding'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.getByRole('button', { name: 'Start converting' }).click();
  await expect(page.getByRole('heading', { name: 'Convert temperature' })).toBeVisible();
  await page.getByLabel('Value').fill('100');
  await expect(page.locator('.result-card')).toContainText('212');
  await page.screenshot({
    path: screenshotPath(testInfo.project.name, 'converter'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.getByRole('button', { name: /Settings/ }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await page.screenshot({
    path: screenshotPath(testInfo.project.name, 'settings'),
    fullPage: true,
    animations: 'disabled',
  });

  await page.getByRole('button', { name: /About/ }).click();
  await expect(page.getByRole('heading', { name: 'About ThermoShift' })).toBeVisible();
  await page.screenshot({
    path: screenshotPath(testInfo.project.name, 'about'),
    fullPage: true,
    animations: 'disabled',
  });
});
