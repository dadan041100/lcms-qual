import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const LOGIN_URL = process.env.BASE_URL;

async function performInvalidLogin(page, email: string, role: string) {
  if (!LOGIN_URL) throw new Error('BASE_URL is not defined in .env');
  if (!email) throw new Error(`${role.toUpperCase()}_EMAIL is missing in .env`);

  await page.goto(LOGIN_URL);

  const emailSel = 'input[name="email"]';
  const passSel = 'input[name="password"]';
  const submitSel = 'button[type="submit"]';

  await page.fill(emailSel, email);
  await page.fill(passSel, 'wrongpassword');

  await Promise.all([
    page.waitForResponse((resp) => resp.url().includes('login') && resp.status() < 500),
    page.click(submitSel),
  ]);

  //  Pass condition: still on login page
  await expect(page).toHaveURL(LOGIN_URL);

  // Optional error message check
  const errorSelector = '.alert-danger, .error, #error, .alert';
  const errorVisible = await page.locator(errorSelector).isVisible().catch(() => false);
  if (errorVisible) {
    const message = await page.locator(errorSelector).innerText().catch(() => '');
    console.log(`${role} invalid login error:`, message);
  }
}

test.describe('Invalid Login Tests (Wrong Password)', () => {
  test('Admin should fail with wrong password', async ({ page }) => {
    await performInvalidLogin(page, process.env.ADMIN_EMAIL!, 'admin');
  });

  test('Lawyer should fail with wrong password', async ({ page }) => {
    await performInvalidLogin(page, process.env.LAWYER_EMAIL!, 'lawyer');
  });

  test('Client should fail with wrong password', async ({ page }) => {
    await performInvalidLogin(page, process.env.CLIENT_EMAIL!, 'client');
  });

  test('Staff should fail with wrong password', async ({ page }) => {
    await performInvalidLogin(page, process.env.STAFF_EMAIL!, 'staff');
  });

  test('Partner should fail with wrong password', async ({ page }) => {
    await performInvalidLogin(page, process.env.PARTNER_EMAIL!, 'partner');
  });
});
