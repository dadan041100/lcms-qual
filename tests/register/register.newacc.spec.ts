// tests/register.newacc.spec.ts
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.BASE_URL;
if (!BASE_URL) throw new Error('BASE_URL is not defined in .env');

// Automatically resolve the registration page
function makeRegisterUrl(base: string) {
  const trimmed = base.trim();
  if (/register\.php$/i.test(trimmed)) return trimmed;
  if (/login\.php$/i.test(trimmed)) return trimmed.replace(/login\.php$/i, 'register.php');
  if (/\.php$/i.test(trimmed)) return trimmed.replace(/[^\/]+\.php$/i, 'register.php');
  return trimmed.replace(/\/+$/, '') + '/register.php';
}

const REGISTER_URL = makeRegisterUrl(BASE_URL);

test.describe('New Account Registration', () => {
  test('should register a new user successfully', async ({ page }) => {
    await page.goto(REGISTER_URL);

    const random = Math.floor(Math.random() * 100000);
    const testEmail = `xxtest${random}@example.com`;
    const testPassword = 'password123';

    // Form field selectors
    const firstNameSel = 'input[name="first_name"], input[name="firstname"], #first_name, #fname';
    const lastNameSel = 'input[name="last_name"], input[name="lastname"], #last_name, #lname';
    const emailSel = 'input[name="email"], #email';
    const passSel = 'input[name="password"], #password';

    // Fill form fields
    await page.fill(firstNameSel, 'Testexample');
    await page.fill(lastNameSel, `Test${random}`);
    await page.fill(emailSel, testEmail);
    await page.fill(passSel, testPassword);

    // ✅ Corrected submit logic: try multiple selectors separately
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
          page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => null),
          locator.first().click(),
        ]);
        clicked = true;
        break;
      }
    }

    if (!clicked) throw new Error('Could not find the Create Account button on the page.');

    // ✅ Check for success
    const successSelectors = [
      'text=Registration successful',
      'text=Account created',
      'text=Welcome',
      'text=successfully registered',
      'text=Check your email',
    ];

    let successFound = false;
    for (const sel of successSelectors) {
      const el = page.locator(sel);
      if ((await el.count()) > 0 && (await el.first().isVisible())) {
        successFound = true;
        console.log('Registration success message detected:', sel);
        break;
      }
    }

    //Assert success
    if (page.url() !== REGISTER_URL || successFound) {
      console.log(`✅ Successfully registered user: ${testEmail}`);
    } else {
      throw new Error('Registration did not redirect or show a success message.');
    }

    await expect(page).not.toHaveURL(REGISTER_URL);
  });
});
