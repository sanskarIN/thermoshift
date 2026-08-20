import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const completeOnboarding = async (page: import('@playwright/test').Page) => {
  const start = page.getByRole('button', { name: 'Start converting' });
  if (await start.isVisible()) await start.click();
};

const openPage = async (page: import('@playwright/test').Page, name: RegExp) => {
  await page.getByRole('button', { name }).click();
};

test('completes first run and converts a common reference temperature', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: /Precise conversion without an account/i })).toBeVisible();
  await completeOnboarding(page);
  await expect(page.getByRole('heading', { name: 'Convert temperature' })).toBeVisible();
  const value = page.getByLabel('Value');
  await value.fill('100');
  await expect(page.locator('.result-card')).toContainText('212');
});

test('opens quick actions from the keyboard and navigates', async ({ page }) => {
  await page.goto('/');
  await completeOnboarding(page);
  await page.keyboard.press('Control+K');
  await expect(page.getByRole('dialog', { name: 'Quick actions' })).toBeVisible();
  await page.getByRole('button', { name: /Open formula guide/i }).click();
  await expect(page.getByRole('heading', { name: 'Formula guide' })).toBeVisible();
});

test('keeps saved history across a page reload', async ({ page }) => {
  await page.goto('/');
  await completeOnboarding(page);
  await page.getByLabel('Value').fill('25');
  await page.getByRole('button', { name: 'Save to history' }).click();

  await openPage(page, /^History/);
  await expect(page.getByRole('heading', { name: 'Conversion history' })).toBeVisible();
  await expect(page.locator('.history-list')).toContainText('25');

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Convert temperature' })).toBeVisible();
  await openPage(page, /^History/);
  await expect(page.locator('.history-list')).toContainText('25');
});

test('reloads from the service-worker cache after connectivity is removed', async ({ page, context }) => {
  await page.goto('/');
  await completeOnboarding(page);
  await expect(page.getByRole('heading', { name: 'Convert temperature' })).toBeVisible();

  await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) throw new Error('Service workers are unavailable');
    await navigator.serviceWorker.ready;
  });

  // A navigation after registration ensures the page is controlled before the offline reload.
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Convert temperature' })).toBeVisible();

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: 'Convert temperature' })).toBeVisible();
    await expect(page.getByText('Offline — your converter still works.')).toBeVisible();
    await page.getByLabel('Value').fill('100');
    await expect(page.locator('.result-card')).toContainText('212');
  } finally {
    await context.setOffline(false);
  }
});

test('settings exposes version/update controls without axe violations', async ({ page }) => {
  await page.goto('/');
  await completeOnboarding(page);
  await openPage(page, /^Settings/);

  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
  await expect(page.getByText('Installed version')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Check for updates' })).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('primary screen has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  await completeOnboarding(page);
  await page.getByRole('heading', { name: 'Convert temperature' }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('onboarding has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('dialog', { name: /Precise conversion without an account/i }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
