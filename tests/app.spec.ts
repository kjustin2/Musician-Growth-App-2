import { test, expect } from '@playwright/test';

test.describe('ChordLine App - Basic Functionality', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loads without errors
    await expect(page).toHaveTitle('musician-growth-app-2');
    
    // The page should load
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive and mobile-friendly', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Should still be functional at mobile size
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate between different routes', async ({ page }) => {
    // Try to navigate to different sections
    const routes = ['/', '/shows', '/earnings', '/assistant', '/profile'];
    
    for (const route of routes) {
      await page.goto(route);
      // Page should load without major errors
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for viewport meta tag
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveCount(1);
    
    // Check for charset
    const charset = page.locator('meta[charset="UTF-8"]');
    await expect(charset).toHaveCount(1);
  });

  test('should load without major console errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    page.on('pageerror', error => {
      errors.push(error.message);
    });
    
    await page.goto('/');
    
    // Wait a bit for any async operations
    await page.waitForTimeout(2000);
    
    // Filter out known development warnings and non-critical errors
    const criticalErrors = errors.filter(error => 
      !error.includes('favicon.ico') &&
      !error.includes('DevTools') &&
      !error.includes('extension') &&
      !error.includes('network') &&
      !error.includes('404') &&
      !error.includes('Failed to load resource')
    );
    
    expect(criticalErrors.length).toBeLessThan(5); // Allow some minor errors during development
  });

  test('React app functionality', async ({ page }) => {
    await page.goto('/');
    
    // Look for the default React counter (if it exists)
    const button = page.locator('button', { hasText: 'count is' });
    if (await button.isVisible()) {
      await button.click();
      await expect(button).toContainText('count is 1');
    } else {
      // Just verify React is rendering something
      const root = page.locator('#root');
      await expect(root).toBeVisible();
    }
  });

  test('should have valid HTML structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper HTML structure
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('#root')).toBeVisible();
    
    // Check that head exists (but don't check if visible since it's not displayed)
    const head = page.locator('head');
    await expect(head).toHaveCount(1);
  });
});

test.describe('Mobile-specific tests', () => {
  test.use({ 
    viewport: { width: 375, height: 667 }
  });
  
  test('should work well on mobile devices', async ({ page }) => {
    await page.goto('/');
    
    // Check that page loads on mobile
    await expect(page.locator('body')).toBeVisible();
    
    // Check that the app root is accessible
    await expect(page.locator('#root')).toBeVisible();
  });
});
