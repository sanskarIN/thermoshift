import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const completeOnboarding = async (page: import('@playwright/test').Page) => {
  const start = page.getByRole('button', { name: 'Start converting' });
  if (await start.isVisible()) await start.click();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await completeOnboarding(page);
});

test('converts the canonical boiling point across browser engines', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Convert temperature' })).toBeVisible();
  await page.getByLabel('Value').fill('100');
  await expect(page.locator('.result-card')).toContainText('212');
});

test('persists explicitly saved history after reload', async ({ page }) => {
  await page.getByLabel('Value').fill('37');
  await page.getByRole('button', { name: 'Save to history' }).click();
  await page.getByRole('button', { name: /^History/ }).click();
  await expect(page.locator('.history-list')).toContainText('37');

  await page.reload();
  await page.getByRole('button', { name: /^History/ }).click();
  await expect(page.locator('.history-list')).toContainText('37');
});

test('keeps the primary converter free of automatically detectable axe violations', async ({ page }) => {
  await page.getByRole('heading', { name: 'Convert temperature' }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
