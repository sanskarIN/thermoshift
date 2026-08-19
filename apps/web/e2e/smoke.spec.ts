import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const completeOnboarding = async (page: import('@playwright/test').Page) => {
  const start = page.getByRole('button', { name: 'Start converting' });
  if (await start.isVisible()) await start.click();
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
