/**
 * Responsive layout tests — verifies the site works on mobile screen sizes.
 *
 * These run in the 'mobile-chrome' project (Pixel 5 viewport) defined in
 * playwright.config.ts, but we can also set the viewport manually here.
 */
import { test, expect } from '@playwright/test';

test.describe('Mobile layout', () => {

  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14

  test('homepage renders correctly on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#hero')).toBeVisible();
    // The page should not overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = 390;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test('hamburger menu is visible on mobile', async ({ page }) => {
    await page.goto('/');
    // On mobile the hamburger button should be present (desktop nav is hidden)
    // We check for a button with a menu icon — the exact selector depends on
    // whether the nav is open or closed
    const menuBtn = page.locator('nav button').first();
    await expect(menuBtn).toBeVisible();
  });

  test('admin login is usable on mobile', async ({ page }) => {
    await page.goto('/admin');
    const input = page.getByRole('textbox');
    await expect(input).toBeVisible();
    // The input should be tappable and accept text
    await input.fill('test');
    await expect(input).toHaveValue('test');
  });

});

test.describe('SEO and meta tags', () => {

  test('page has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/HaSammie Suah/);
  });

  test('page has meta description', async ({ page }) => {
    await page.goto('/');
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute('content', /.+/);
  });

  test('page has Open Graph tags', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', /.+/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /.+/);
  });

  test('robots.txt is accessible', async ({ page }) => {
    const res = await page.goto('/robots.txt');
    expect(res?.status()).toBe(200);
    const body = await page.content();
    expect(body).toContain('User-agent');
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const res = await page.goto('/sitemap.xml');
    expect(res?.status()).toBe(200);
  });

});
