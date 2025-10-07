import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

const LOGIN_URL = process.env.BASE_URL;
const PASSWORD = process.env.PASSWORD;

async function performValidLogin(page, email: string, role: string) {
  if (!LOGIN_URL) throw new Error('BASE_URL is not defined in .env');
  if (!email || !PASSWORD) throw new Error(`${role.toUpperCase()}_EMAIL or PASSWORD is missing in .env`);

  await page.goto(LOGIN_URL);

  const emailSel = 'input[name="email"]';
  const passSel = 'input[name="password"]';
  const submitSel = 'button[type="submit"]';

  await page.fill(emailSel, email);
  await page.fill(passSel, PASSWORD);

  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }),
    page.click(submitSel),
  ]);

  // Pass condition: redirected away from login page
  await expect(page).not.toHaveURL(LOGIN_URL);
}

test.describe('Valid Login Tests (Right Password)', () => {
  test('Admin should log in successfully', async ({ page }) => {
    await performValidLogin(page, process.env.ADMIN_EMAIL!, 'admin');
  });

  test('Lawyer should log in successfully', async ({ page }) => {
    await performValidLogin(page, process.env.LAWYER_EMAIL!, 'lawyer');
  });

  test('Client should log in successfully', async ({ page }) => {
    await performValidLogin(page, process.env.CLIENT_EMAIL!, 'client');
  });

  test('Staff should log in successfully', async ({ page }) => {
    await performValidLogin(page, process.env.STAFF_EMAIL!, 'staff');
  });

  test('Partner should log in successfully', async ({ page }) => {
    await performValidLogin(page, process.env.PARTNER_EMAIL!, 'partner');
  });
});
