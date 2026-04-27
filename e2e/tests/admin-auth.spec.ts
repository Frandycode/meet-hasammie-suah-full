/**
 * Admin auth tests — verifies login, protected routes, and logout.
 * Updated in v3 to cover all new admin pages.
 *
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import { test, expect } from '@playwright/test';

test.describe('Admin authentication', () => {

  // ── Login page ─────────────────────────────────────────────────────────────

  test('admin login page is accessible at /admin', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('admin login page is accessible at /admin/login', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('shows error with wrong password', async ({ page }) => {
    await page.goto('/admin');
    await page.getByRole('textbox').fill('wrongpassword123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/incorrect/i)).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/admin/);
  });

  test('login form has password visibility toggle', async ({ page }) => {
    await page.goto('/admin');
    const input = page.getByRole('textbox');
    await input.fill('testpassword');
    await expect(input).toHaveAttribute('type', 'password');
    const toggleBtn = page.locator('button[type="button"]')
      .filter({ hasNot: page.getByRole('button', { name: /sign in/i }) })
      .first();
    await toggleBtn.click();
    await expect(input).toHaveAttribute('type', 'text');
  });

  // ── Protected route guard — original pages ─────────────────────────────────

  test('visiting /admin/dashboard without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('visiting /admin/hero without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/hero');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('visiting /admin/stats without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/stats');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('visiting /admin/gallery without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/gallery');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('visiting /admin/analytics without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/analytics');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('visiting /admin/press-kit without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/press-kit');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('visiting /admin/sponsors without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/sponsors');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('visiting /admin/videos without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/videos');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  // ── Protected route guard — new v3 pages ──────────────────────────────────

  test('visiting /admin/blog without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/blog');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('visiting /admin/social-feed without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/social-feed');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

  test('visiting /admin/supporter-wall without auth redirects to login', async ({ page }) => {
    await page.goto('/admin/supporter-wall');
    await expect(page.getByRole('textbox')).toBeVisible();
  });

});
