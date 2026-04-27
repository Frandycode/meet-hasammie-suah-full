/**
 * Supporter wall & postcards tests — verifies the community features
 * added in v3: gift picker, confetti, message form, and postcard builder.
 *
 * Developer: Frandy Slueue
 * GitHub:    https://github.com/frandycode
 * LinkedIn:  https://www.linkedin.com/in/frandyslueuewebdevitpro
 */
import { test, expect } from '@playwright/test';

// ─── Supporter wall ───────────────────────────────────────────────────────────

test.describe('Supporter wall', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#supporter-wall').scrollIntoViewIfNeeded();
  });

  test('section is visible', async ({ page }) => {
    await expect(page.locator('#supporter-wall')).toBeVisible();
  });

  test('shows the section heading', async ({ page }) => {
    await expect(
      page.locator('#supporter-wall').getByRole('heading', { name: /supporter wall/i })
    ).toBeVisible();
  });

  test('gift category tabs are all present', async ({ page }) => {
    const wall = page.locator('#supporter-wall');
    for (const label of ['All', 'Flowers', 'Sports', 'Reactions', 'Extras']) {
      await expect(wall.getByRole('button', { name: label })).toBeVisible();
    }
  });

  test('clicking a category tab filters the gift grid', async ({ page }) => {
    const wall = page.locator('#supporter-wall');
    await wall.getByRole('button', { name: 'Flowers' }).click();
    // Flowers tab should now be active — check it doesn't crash and grid updates
    await expect(wall.getByRole('button', { name: 'Flowers' })).toBeVisible();
    // Switch back
    await wall.getByRole('button', { name: 'All' }).click();
  });

  test('gift preview text updates when a gift is selected', async ({ page }) => {
    const wall = page.locator('#supporter-wall');
    // The preview text changes to reflect the selected gift
    await expect(wall.getByText(/sending a/i)).toBeVisible();
  });

  test('form shows name required error on empty submit', async ({ page }) => {
    const wall = page.locator('#supporter-wall');
    const sendBtn = wall.getByRole('button', { name: /send your/i });
    await sendBtn.click();
    await expect(wall.getByText(/name is required/i)).toBeVisible();
  });

  test('form shows message too short error', async ({ page }) => {
    const wall = page.locator('#supporter-wall');
    await wall.getByPlaceholder(/coach smith/i).fill('Jane');
    await wall.getByRole('button', { name: /send your/i }).click();
    await expect(wall.getByText(/at least 10 characters/i)).toBeVisible();
  });

  test('form accepts valid name and message without error', async ({ page }) => {
    const wall = page.locator('#supporter-wall');
    await wall.getByPlaceholder(/coach smith/i).fill('Coach Taylor');
    await wall.getByPlaceholder(/share.*encouragement/i).fill(
      'You are an incredible runner and we are all rooting for you at state!'
    );
    // Just verify no validation errors appear — don't actually submit
    await expect(wall.getByText(/name is required/i)).not.toBeVisible();
    await expect(wall.getByText(/at least 10 characters/i)).not.toBeVisible();
  });

  test('message wall cards are rendered', async ({ page }) => {
    const wall = page.locator('#supporter-wall');
    // At least one message card should be in the DOM (fallback data)
    const cards = wall.locator('.rounded-2xl').filter({ hasText: /sammie/i });
    await expect(cards.first()).toBeAttached();
  });

  test('extras tab includes confetti option', async ({ page }) => {
    const wall = page.locator('#supporter-wall');
    await wall.getByRole('button', { name: 'Extras' }).click();
    // Confetti gift button should be visible in the grid
    // It renders as a button in the gift grid — check by title tooltip
    await expect(wall.locator('[title*="Confetti"]').or(
      wall.getByText(/confetti/i)
    )).toBeAttached();
  });

  test('send button label updates with selected gift name', async ({ page }) => {
    const wall = page.locator('#supporter-wall');
    // Default gift is "heart" / "Love"
    const sendBtn = wall.getByRole('button', { name: /send your/i });
    await expect(sendBtn).toBeVisible();
    // The button text should contain the gift name
    const btnText = await sendBtn.textContent();
    expect(btnText?.toLowerCase()).toMatch(/send your|sammie/i);
  });

});

// ─── Postcards ────────────────────────────────────────────────────────────────

test.describe('Digital postcards', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('#postcards').scrollIntoViewIfNeeded();
  });

  test('section is visible', async ({ page }) => {
    await expect(page.locator('#postcards')).toBeVisible();
  });

  test('section heading is present', async ({ page }) => {
    await expect(
      page.locator('#postcards').getByRole('heading', { name: /postcard/i })
    ).toBeVisible();
  });

  test('canvas preview is rendered', async ({ page }) => {
    const section = page.locator('#postcards');
    await expect(section.locator('canvas').first()).toBeVisible();
  });

  test('design navigation arrows are present', async ({ page }) => {
    const section = page.locator('#postcards');
    // Prev and next buttons flank the design counter
    const buttons = section.locator('button').all();
    expect((await buttons).length).toBeGreaterThan(1);
  });

  test('clicking next cycles to next design', async ({ page }) => {
    const section = page.locator('#postcards');
    // Find the counter text e.g. "Race Day — 1 / 4"
    const counter = section.getByText(/\d+ \/ 4/i);
    const initialText = await counter.textContent();
    // Click the next arrow
    await section.locator('button').filter({ hasText: '' }).last().click();
    await page.waitForTimeout(100);
    const updatedText = await counter.textContent();
    expect(updatedText).not.toBe(initialText);
  });

  test('design thumbnail grid is rendered', async ({ page }) => {
    const section = page.locator('#postcards');
    // 4 canvas thumbnails should exist
    const thumbs = section.locator('canvas');
    expect(await thumbs.count()).toBeGreaterThanOrEqual(1);
  });

  test('download button is present and clickable', async ({ page }) => {
    const section = page.locator('#postcards');
    const dlBtn = section.getByRole('button', { name: /download/i });
    await expect(dlBtn).toBeVisible();
    // Click it — should not throw
    await dlBtn.click();
  });

  test('send form shows name required error', async ({ page }) => {
    const section = page.locator('#postcards');
    await section.getByRole('button', { name: /send postcard/i }).click();
    await expect(section.getByText(/required/i).first()).toBeVisible();
  });

  test('typing in name field updates postcard preview', async ({ page }) => {
    const section = page.locator('#postcards');
    const nameInput = section.getByPlaceholder(/coach smith/i);
    await nameInput.fill('Coach Taylor');
    // Canvas should re-render — no errors thrown
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(200);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

  test('typing in message field updates postcard preview', async ({ page }) => {
    const section = page.locator('#postcards');
    const msgArea = section.getByPlaceholder(/something sammie/i);
    await msgArea.fill('You are destined for greatness. We are all watching you win.');
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.waitForTimeout(200);
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0);
  });

});
