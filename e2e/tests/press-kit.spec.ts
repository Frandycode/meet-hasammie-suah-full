/**
 * Press kit page tests — verifies the public press kit page loads
 * correctly and all key sections are present.
 */
import { test, expect } from '@playwright/test';

test.describe('Press kit page', () => {

  test('is accessible at /press-kit', async ({ page }) => {
    await page.goto('/press-kit');
    await expect(page).toHaveURL('/press-kit');
    await expect(page.getByRole('heading', { name: /press kit/i })).toBeVisible();
  });

  test('shows the for media label', async ({ page }) => {
    await page.goto('/press-kit');
    await expect(page.getByText(/for media/i)).toBeVisible();
  });

  test('shows quick facts section', async ({ page }) => {
    await page.goto('/press-kit');
    await expect(page.getByText(/quick facts/i)).toBeVisible();
    await expect(page.getByText(/tulsa/i)).toBeVisible();
    await expect(page.getByText(/union high school/i)).toBeVisible();
  });

  test('shows official biography heading', async ({ page }) => {
    await page.goto('/press-kit');
    await expect(page.getByRole('heading', { name: /official biography/i })).toBeVisible();
  });

  test('back link navigates to homepage', async ({ page }) => {
    await page.goto('/press-kit');
    await page.getByRole('link', { name: /back to site/i }).click();
    await expect(page).toHaveURL('/');
  });

  test('press kit link is visible in navbar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /press kit/i }).first()).toBeVisible();
  });

  test('press kit link is visible in footer', async ({ page }) => {
    await page.goto('/');
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.getByRole('link', { name: /press kit/i }).last()).toBeVisible();
  });

  test('navbar press kit link navigates correctly', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /press kit/i }).first().click();
    await expect(page).toHaveURL('/press-kit');
  });

});
