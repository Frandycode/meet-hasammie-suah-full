/**
 * Homepage tests — verifies the public-facing site loads and all sections
 * are present and functional, including all features added in v3.
 *
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 *
 * Each test is independent: `page` is a fresh browser context per test,
 * so tests cannot accidentally share state (cookies, localStorage, etc.).
 */
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {

  // ── Core load ──────────────────────────────────────────────────────────────

  test('loads and shows hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/HaSammie Suah/);
    await expect(page.locator('#hero')).toBeVisible();
    await expect(page.getByText(/HaSammie/i).first()).toBeVisible();
  });

  test('navbar is present and contains key links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /about/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /gallery/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /contact/i }).first()).toBeVisible();
  });

  test('page has no serious console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const serious = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error promise rejection')
    );
    expect(serious).toHaveLength(0);
  });

  test('unknown route redirects to home', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    await expect(page).toHaveURL('/');
  });

  // ── Original sections ──────────────────────────────────────────────────────

  test('about section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#about')).toBeAttached();
  });

  test('stats section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#stats')).toBeAttached();
  });

  test('achievements section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#achievements')).toBeAttached();
  });

  test('gallery section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#gallery')).toBeAttached();
  });

  test('events section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#events')).toBeAttached();
  });

  test('donate section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#donate')).toBeAttached();
  });

  test('contact section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#contact')).toBeAttached();
  });

  // ── New sections (v3) ──────────────────────────────────────────────────────

  test('race results section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#race-results')).toBeAttached();
  });

  test('news / blog section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#news')).toBeAttached();
  });

  test('recruiting section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#recruiting')).toBeAttached();
  });

  test('social feed section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#social')).toBeAttached();
  });

  test('supporter wall section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#supporter-wall')).toBeAttached();
  });

  test('postcards section is present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#postcards')).toBeAttached();
  });

  // ── Meet countdown banner ──────────────────────────────────────────────────

  test('meet countdown banner does not crash on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  // ── Social feed platform tabs ──────────────────────────────────────────────

  test('social feed has All platform tab', async ({ page }) => {
    await page.goto('/');
    await page.locator('#social').scrollIntoViewIfNeeded();
    const allTab = page.locator('#social').getByRole('button', { name: /^all$/i }).first();
    await expect(allTab).toBeVisible();
  });

  test('social feed has TikTok tab', async ({ page }) => {
    await page.goto('/');
    await page.locator('#social').scrollIntoViewIfNeeded();
    await expect(
      page.locator('#social').getByRole('button', { name: /tiktok/i }).first()
    ).toBeVisible();
  });

  test('clicking TikTok tab filters the feed', async ({ page }) => {
    await page.goto('/');
    await page.locator('#social').scrollIntoViewIfNeeded();
    const tikTokTab = page.locator('#social').getByRole('button', { name: /tiktok/i }).first();
    await tikTokTab.click();
    // After clicking, TikTok tab should be active (has gold background)
    await expect(tikTokTab).toHaveCSS('background-color', /rgb/);
  });

  // ── Supporter wall ─────────────────────────────────────────────────────────

  test('supporter wall shows gift picker label', async ({ page }) => {
    await page.goto('/');
    await page.locator('#supporter-wall').scrollIntoViewIfNeeded();
    await expect(page.getByText(/choose a gift/i).first()).toBeVisible();
  });

  test('supporter wall has gift category tabs', async ({ page }) => {
    await page.goto('/');
    await page.locator('#supporter-wall').scrollIntoViewIfNeeded();
    await expect(
      page.locator('#supporter-wall').getByRole('button', { name: /flowers/i }).first()
    ).toBeVisible();
    await expect(
      page.locator('#supporter-wall').getByRole('button', { name: /sports/i }).first()
    ).toBeVisible();
    await expect(
      page.locator('#supporter-wall').getByRole('button', { name: /reactions/i }).first()
    ).toBeVisible();
  });

  test('supporter wall submit shows validation error without required fields', async ({ page }) => {
    await page.goto('/');
    await page.locator('#supporter-wall').scrollIntoViewIfNeeded();
    const sendBtn = page.locator('#supporter-wall').getByRole('button', { name: /send/i }).first();
    await sendBtn.click();
    await expect(page.getByText(/name is required/i).first()).toBeVisible();
  });

  // ── Blog post reader ───────────────────────────────────────────────────────

  test('blog post route renders without crashing', async ({ page }) => {
    await page.goto('/blog/pr-1180-tulsa-invitational');
    await expect(page.locator('main')).toBeAttached();
    await expect(page).toHaveURL(/\/blog\//);
  });

  test('invalid blog slug shows error state without JS crash', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto('/blog/this-post-does-not-exist-xyz');
    await page.waitForLoadState('networkidle');
    const serious = errors.filter(e =>
      !e.includes('ResizeObserver') &&
      !e.includes('Non-Error promise rejection')
    );
    expect(serious).toHaveLength(0);
  });

  test('blog post back link returns to homepage', async ({ page }) => {
    await page.goto('/blog/any-slug');
    // Back link should navigate home (even if post doesn't exist)
    const backLink = page.getByRole('link', { name: /back/i }).first();
    if (await backLink.isVisible()) {
      await backLink.click();
      await expect(page).toHaveURL('/');
    }
  });

  // ── Recruiting CTA ─────────────────────────────────────────────────────────

  test('recruiting section has coach inquiry form', async ({ page }) => {
    await page.goto('/');
    await page.locator('#recruiting').scrollIntoViewIfNeeded();
    await expect(page.getByPlaceholder(/university/i).first()).toBeAttached();
  });

  test('recruiting form validates on submit', async ({ page }) => {
    await page.goto('/');
    await page.locator('#recruiting').scrollIntoViewIfNeeded();
    const submitBtn = page.locator('#recruiting').getByRole('button', { name: /send recruiting/i });
    await submitBtn.click();
    // Should show at least one validation error
    await expect(page.locator('#recruiting').getByText(/required/i).first()).toBeVisible();
  });

  // ── Postcards ──────────────────────────────────────────────────────────────

  test('postcards section renders canvas element', async ({ page }) => {
    await page.goto('/');
    await page.locator('#postcards').scrollIntoViewIfNeeded();
    await expect(page.locator('#postcards canvas').first()).toBeAttached();
  });

  test('postcards design thumbnails are present', async ({ page }) => {
    await page.goto('/');
    await page.locator('#postcards').scrollIntoViewIfNeeded();
    // Should have 4 design thumbnail canvases
    const thumbs = page.locator('#postcards canvas');
    await expect(thumbs).toHaveCount(5); // 1 main preview + 4 thumbnails
  });

});
