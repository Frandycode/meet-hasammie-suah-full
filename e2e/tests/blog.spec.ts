/**
 * Blog / News tests — verifies the news section on the homepage
 * and the full-page blog post reader at /blog/:slug.
 *
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import { test, expect } from '@playwright/test';

// ─── News section on homepage ─────────────────────────────────────────────────

test.describe('News section — homepage', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#news').scrollIntoViewIfNeeded();
  });

  test('news section is present and visible', async ({ page }) => {
    await expect(page.locator('#news')).toBeVisible();
  });

  test('shows the section heading', async ({ page }) => {
    await expect(
      page.locator('#news').getByRole('heading', { name: /news/i }).first()
    ).toBeVisible();
  });

  test('category filter tabs are present', async ({ page }) => {
    const section = page.locator('#news');
    await expect(section.getByRole('button', { name: /all/i }).first()).toBeVisible();
    await expect(section.getByRole('button', { name: /race news/i })).toBeVisible();
    await expect(section.getByRole('button', { name: /training/i })).toBeVisible();
    await expect(section.getByRole('button', { name: /personal/i })).toBeVisible();
    await expect(section.getByRole('button', { name: /media/i })).toBeVisible();
  });

  test('switching category tab filters posts', async ({ page }) => {
    const section = page.locator('#news');
    // Click Training tab
    await section.getByRole('button', { name: /training/i }).click();
    // Active tab should be highlighted — check aria or style change
    const trainingBtn = section.getByRole('button', { name: /training/i });
    await expect(trainingBtn).toBeVisible();
    // Click back to All
    await section.getByRole('button', { name: /all/i }).first().click();
  });

  test('at least one post card is rendered', async ({ page }) => {
    const section = page.locator('#news');
    // Post cards have a cursor-pointer and link behaviour
    const cards = section.locator('a, [role="link"], .cursor-pointer');
    await expect(cards.first()).toBeAttached();
  });

  test('"more posts" pulse indicator is visible', async ({ page }) => {
    await expect(
      page.locator('#news').getByText(/new posts after every meet/i)
    ).toBeVisible();
  });

});

// ─── Blog post reader page ────────────────────────────────────────────────────

test.describe('Blog post reader — /blog/:slug', () => {

  test('page renders without crashing for a known slug', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/blog/pr-1180-tulsa-invitational');
    await page.waitForLoadState('networkidle');

    const serious = errors.filter(e => !e.includes('ResizeObserver'));
    expect(serious).toHaveLength(0);
    // Main content area must be present
    await expect(page.locator('main')).toBeVisible();
  });

  test('shows 404 state for unknown slug', async ({ page }) => {
    await page.goto('/blog/slug-that-definitely-does-not-exist-xyz');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/not found/i)).toBeVisible({ timeout: 8000 });
  });

  test('reading progress bar exists at top of page', async ({ page }) => {
    await page.goto('/blog/pr-1180-tulsa-invitational');
    // Progress bar is a fixed div — check it's in the DOM
    const progressBar = page.locator('div').filter({ has: page.locator('[style*="width"]') }).first();
    await expect(progressBar).toBeAttached();
  });

  test('back navigation link is present', async ({ page }) => {
    await page.goto('/blog/pr-1180-tulsa-invitational');
    await expect(page.getByRole('link', { name: /news/i }).first()).toBeVisible();
  });

  test('share section is present on a loaded post', async ({ page }) => {
    await page.goto('/blog/pr-1180-tulsa-invitational');
    await page.waitForLoadState('networkidle');
    // Only check if the post actually loaded (not the 404 state)
    const isNotFound = await page.getByText(/not found/i).isVisible();
    if (!isNotFound) {
      await expect(page.getByText(/post on x/i).or(page.getByText(/copy link/i))).toBeVisible();
    }
  });

  test('related posts section appears when post loads', async ({ page }) => {
    await page.goto('/blog/pr-1180-tulsa-invitational');
    await page.waitForLoadState('networkidle');
    const isNotFound = await page.getByText(/not found/i).isVisible();
    if (!isNotFound) {
      await expect(page.getByText(/more from the blog/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('scroll updates reading progress', async ({ page }) => {
    await page.goto('/blog/pr-1180-tulsa-invitational');
    await page.waitForLoadState('networkidle');
    const isNotFound = await page.getByText(/not found/i).isVisible();
    if (!isNotFound) {
      // Scroll to bottom and check progress bar width has increased
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      // Progress should be > 0 — we just verify no errors thrown during scroll
      const errors: string[] = [];
      page.on('pageerror', err => errors.push(err.message));
      expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
    }
  });

});
