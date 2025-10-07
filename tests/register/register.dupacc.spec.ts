import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) throw new Error('BASE_URL is not defined in .env');

// Build the correct registration URL dynamically
function makeRegisterUrl(base: string) {
  const trimmed = base.trim();
  if (/register\.php$/i.test(trimmed)) return trimmed;
  if (/login\.php$/i.test(trimmed)) return trimmed.replace(/login\.php$/i, 'register.php');
  if (/\.php$/i.test(trimmed)) return trimmed.replace(/[^\/]+\.php$/i, 'register.php');
  return trimmed.replace(/\/+$/, '') + '/register.php';
}

const REGISTER_URL = makeRegisterUrl(BASE_URL);

test.describe('Duplicate Account Registration', () => {
  test('should fail registration when using an existing email', async ({ page }) => {
    await page.goto(REGISTER_URL);

    const existingEmail = process.env.CLIENT_EMAIL || 'client@example.com';
    const testPassword = 'password123';

    // Field selectors — no confirm password
    const firstNameSel = 'input[name="first_name"], input[name="firstname"], #first_name, #fname';
    const lastNameSel = 'input[name="last_name"], input[name="lastname"], #last_name, #lname';
    const emailSel = 'input[name="email"], #email';
    const passSel = 'input[name="password"], #password';

    // Fill form fields
    await page.fill(firstNameSel, 'Duplicate');
    await page.fill(lastNameSel, 'User');
    await page.fill(emailSel, existingEmail);
    await page.fill(passSel, testPassword);

    // Click Create Account button
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      'button:has-text("Create Account")',
      'text=Create Account',
    ];

    let clicked = false;
    for (const sel of submitSelectors) {
      const locator = page.locator(sel);
      if ((await locator.count()) > 0 && (await locator.first().isVisible())) {
        await Promise.all([
          page.waitForResponse(resp => resp.url().includes('register') && resp.status() < 500).catch(() => null),
          locator.first().click(),
        ]);
        clicked = true;
        break;
      }
    }

    if (!clicked) throw new Error('Could not find the Create Account button on the page.');

    // Expect to stay on the same registration page (since it should fail)
    await expect(page).toHaveURL(REGISTER_URL);

    // Check for any visible error message
    const errorSelectors = [
      '.alert-danger',
      '.error',
      '#error',
      '.alert',
      'text=already exists',
      'text=Email already',
      'text=Duplicate',
    ];

    let errorFound = false;
    for (const sel of errorSelectors) {
      const el = page.locator(sel);
      if ((await el.count()) > 0 && (await el.first().isVisible())) {
        const message = await el.first().innerText().catch(() => '');
        console.log('Duplicate registration error detected:', message);
        errorFound = true;
        break;
      }
    }

    //Final assertion — test passes only if registration fails
    expect(errorFound || page.url() === REGISTER_URL).toBeTruthy();
  });
});
