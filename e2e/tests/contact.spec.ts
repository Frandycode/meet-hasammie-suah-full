/**
 * Contact form tests — verifies validation, error states, and submission.
 *
 * These tests don't actually send emails (the backend dev mode logs instead),
 * but they fully exercise the form's client-side behaviour.
 */
import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to the contact section so the form is in view
    await page.locator('#contact').scrollIntoViewIfNeeded();
  });

  test('contact form is visible on the page', async ({ page }) => {
    const form = page.locator('#contact');
    await expect(form).toBeVisible();
    // All four fields must be present
    await expect(page.getByPlaceholder('Your name')).toBeVisible();
    await expect(page.getByPlaceholder('Your email')).toBeVisible();
    await expect(page.getByPlaceholder(/Subject/i)).toBeVisible();
    await expect(page.getByPlaceholder('Your message...')).toBeVisible();
  });

  test('shows validation errors when submitting empty form', async ({ page }) => {
    // Click submit without filling anything in
    await page.getByRole('button', { name: /send message/i }).click();

    // All required field errors should appear
    await expect(page.getByText('Your name is required')).toBeVisible();
    await expect(page.getByText('Your email is required')).toBeVisible();
    await expect(page.getByText('A subject is required')).toBeVisible();
    await expect(page.getByText(/at least 10 characters/i)).toBeVisible();
  });

  test('shows email validation error for invalid email', async ({ page }) => {
    await page.getByPlaceholder('Your email').fill('not-an-email');
    await page.getByPlaceholder('Your email').blur();
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test('clears error when field is corrected', async ({ page }) => {
    // Trigger the name error
    await page.getByRole('button', { name: /send message/i }).click();
    await expect(page.getByText('Your name is required')).toBeVisible();

    // Fix it — error should disappear
    await page.getByPlaceholder('Your name').fill('Coach Taylor');
    await expect(page.getByText('Your name is required')).not.toBeVisible();
  });

  test('submit button shows loading state while sending', async ({ page }) => {
    // Fill the form with valid data
    await page.getByPlaceholder('Your name').fill('Coach Taylor');
    await page.getByPlaceholder('Your email').fill('coach@union.edu');
    await page.getByPlaceholder(/Subject/i).fill('Sponsorship inquiry');
    await page.getByPlaceholder('Your message...').fill(
      'Hi Sammie, we would love to discuss a sponsorship opportunity with you.'
    );

    // Intercept the GraphQL request so we can check the loading state
    // before the server responds
    await page.route('**/graphql', async route => {
      // Delay the response by 500ms so we can catch the loading state
      await new Promise(r => setTimeout(r, 500));
      await route.continue();
    });

    await page.getByRole('button', { name: /send message/i }).click();

    // Loading text should appear briefly
    await expect(page.getByText(/sending/i)).toBeVisible({ timeout: 2000 });
  });

});
