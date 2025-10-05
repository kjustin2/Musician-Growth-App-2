import { test, expect } from '@playwright/test';

test('Simple authenticated dashboard test', async ({ page }) => {
  // Navigate to the app and simulate Google login
  await page.goto('http://localhost:5173');
  
  // Click the Google login button to simulate authentication
  await page.getByText('Continue with Google').click();
  
  // Wait for the app to load and show the dashboard
  await page.waitForTimeout(3000);
  
  // Check if we're on the dashboard (authenticated)
  await expect(page.getByText('Dashboard')).toBeVisible();
  await expect(page.getByText('Total Shows')).toBeVisible();
  await expect(page.getByText('Total Earnings')).toBeVisible();
  
  // Test navigation
  await page.getByRole('link', { name: 'Shows' }).click();
  await expect(page.getByText('Friday Night Live')).toBeVisible();
  
  await page.getByRole('link', { name: 'Earnings' }).click();
  await expect(page.getByText('+$3,750')).toBeVisible();
  
  await page.getByRole('link', { name: 'AI' }).click();
  await expect(page.getByRole('heading', { name: 'ChordLine AI' })).toBeVisible();
  
  await page.getByRole('link', { name: 'Profile' }).click();
  await expect(page.getByText('Profile & Settings')).toBeVisible();
});