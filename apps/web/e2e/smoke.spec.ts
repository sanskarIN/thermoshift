import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('converts a common reference temperature', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Convert temperature' })).toBeVisible();
  const value = page.getByLabel('Value');
  await value.fill('100');
  await expect(page.locator('.result-card')).toContainText('212');
});

test('primary screen has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('heading', { name: 'Convert temperature' }).waitFor();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
