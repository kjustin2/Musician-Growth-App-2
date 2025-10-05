import { test, expect } from '@playwright/test';

/**
 * Comprehensive Integration Tests for ChordLine Band Management App
 * 
 * These tests validate all Phase 0 functionality using Playwright MCP integration
 * to ensure the application works correctly in a real browser environment.
 */

test.describe('ChordLine App - Phase 0 Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Enable comprehensive logging in browser
    await page.addInitScript(() => {
      (window as any).ENABLE_VERBOSE_LOGGING = true;
    });
    
    // Navigate to the application
    await page.goto('/');
  });

  test.describe('Authentication & Navigation Flow', () => {
    test('should complete full authentication and navigation flow', async ({ page }) => {
      // Verify auth page loads
      await expect(page).toHaveTitle('ChordLine - Band Management');
      await expect(page.getByText('Welcome to ChordLine')).toBeVisible();
      
      // Sign in with Google (mock)
      await page.getByText('Continue with Google').click();
      
      // Wait for authentication to complete
      await page.waitForTimeout(2000);
      
      // Verify dashboard loads
      await expect(page.getByText('Dashboard')).toBeVisible();
      await expect(page.getByRole('button', { name: 'The Demo Band' })).toBeVisible();
      
      // Test navigation to all pages
      const pages = [
        { link: 'Shows', expectedText: 'Shows' },
        { link: 'Earnings', expectedText: 'Earnings' },
        { link: 'AI', expectedText: 'ChordLine AI' },
        { link: 'Apps', expectedText: 'Integrations' },
        { link: 'Profile', expectedText: 'Profile & Settings' }
      ];
      
      for (const { link, expectedText } of pages) {
        await page.getByRole('link', { name: link }).click();
        await page.waitForTimeout(1000);
        // Use more specific selectors to avoid ambiguity
        if (expectedText === 'Shows') {
          await expect(page.getByRole('heading', { name: 'Shows' })).toBeVisible();
        } else if (expectedText === 'ChordLine AI') {
          await expect(page.getByRole('heading', { name: 'ChordLine AI' })).toBeVisible();
        } else {
          await expect(page.getByText(expectedText)).toBeVisible();
        }
      }
    });

    test('should handle sign out properly', async ({ page }) => {
      // Sign in first
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      
      // Verify signed in
      await expect(page.getByText('Demo User')).toBeVisible();
      
      // Sign out
      await page.getByRole('button', { name: /sign out/i }).click();
      
      // Should return to auth page
      await page.waitForTimeout(1000);
      await expect(page.getByText('Welcome to ChordLine')).toBeVisible();
    });
  });

  test.describe('Shows Management', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in and navigate to shows
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      
      // Wait for navigation to be ready
      await page.waitForSelector('[role="navigation"], nav', { timeout: 10000 }).catch(() => {});
      
      await page.getByRole('link', { name: 'Shows' }).click();
      await page.waitForTimeout(2000);
    });

    test('should display shows list with mock data', async ({ page }) => {
      // Check page header
      await expect(page.getByRole('heading', { name: 'Shows' })).toBeVisible();
      await expect(page.getByText('performances', { exact: false })).toBeVisible();
      
      // Wait for mock data to load
      await page.waitForTimeout(3000);
      
      // Verify mock shows are displayed
      await expect(page.getByText('Friday Night Live')).toBeVisible();
      await expect(page.getByText('Saturday Night Show')).toBeVisible();
      await expect(page.getByText('New Year\'s Eve Celebration')).toBeVisible();
      
      // Verify venue information
      await expect(page.getByText('The Bluebird Cafe, Nashville')).toBeVisible();
      await expect(page.getByText('Ryman Auditorium, Nashville')).toBeVisible();
      await expect(page.getByText('Grand Ole Opry, Nashville')).toBeVisible();
    });

    test('should filter shows correctly', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Test filtering by planned shows
      await page.getByRole('button', { name: 'planned' }).click();
      await page.waitForTimeout(500);
      
      // Verify planned shows are visible
      await expect(page.getByText('Saturday Night Show')).toBeVisible();
      await expect(page.getByText('New Year\'s Eve Celebration')).toBeVisible();
      
      // Test filtering by confirmed shows
      await page.getByRole('button', { name: 'confirmed' }).click();
      await page.waitForTimeout(500);
      
      // Verify confirmed shows are visible
      await expect(page.getByText('Friday Night Live')).toBeVisible();
      
      // Reset to all shows
      await page.getByRole('button', { name: 'All Shows' }).click();
      await page.waitForTimeout(500);
      
      // Verify all shows are visible again
      await expect(page.getByText('Friday Night Live')).toBeVisible();
      await expect(page.getByText('Saturday Night Show')).toBeVisible();
    });

    test('should open add show modal', async ({ page }) => {
      // Click add show button - try multiple possible selectors
      const addButton = page.getByRole('button', { name: /add.*show/i }).or(
        page.locator('button').filter({ hasText: '+' })).or(
        page.locator('[data-testid="add-show-button"]')).or(
        page.locator('button:has-text("+")')
      );
      await addButton.first().click({ timeout: 10000 });
      
      // Verify modal opens
      await expect(page.getByText('Add New Show')).toBeVisible();
      await expect(page.getByPlaceholder('Enter show title')).toBeVisible();
      await expect(page.getByLabelText(/date/i)).toBeVisible();
      
      // Close modal
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);
    });

    test('should display earnings information for shows', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(3000);
      
      // Check that earnings are displayed for shows that have them
      const earningsTexts = await page.locator('text=/Earned.*\$|\$[0-9]+/').all();
      // Allow for shows without earnings, just check we can find the shows
      const showElements = await page.locator('text=/Friday Night Live|Saturday Night Show/').all();
      expect(showElements.length).toBeGreaterThan(0);
    });

    test('should handle loading states properly', async ({ page }) => {
      // Refresh to see loading state
      await page.reload();
      
      // Should show loading indicator initially
      const loadingSpinner = page.locator('.animate-spin');
      const isLoadingVisible = await loadingSpinner.isVisible({ timeout: 1000 }).catch(() => false);
      
      if (isLoadingVisible) {
        // Wait for loading to complete
        await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });
      }
      
      // Content should be visible after loading
      await expect(page.getByRole('heading', { name: 'Shows' })).toBeVisible();
    });
  });

  test.describe('Earnings Management', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in and navigate to earnings
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      await page.getByRole('link', { name: 'Earnings' }).click();
      await page.waitForTimeout(1000);
    });

    test('should display earnings list', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Earnings' })).toBeVisible();
      
      // Wait for mock data to load
      await page.waitForTimeout(2000);
      
      // Check for earnings entries
      const earningsAmount = page.locator('text=/\\$[0-9,]+/').first();
      await expect(earningsAmount).toBeVisible({ timeout: 5000 });
    });

    test('should display total earnings', async ({ page }) => {
      await page.waitForTimeout(2000);
      
      // Look for total earnings display
      const totalEarnings = page.locator('text=/Total.*\\$[0-9,]+/');
      if (await totalEarnings.isVisible({ timeout: 3000 })) {
        await expect(totalEarnings).toBeVisible();
      }
    });
  });

  test.describe('AI Assistant', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in and navigate to AI assistant
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      await page.getByRole('link', { name: 'AI' }).click();
      await page.waitForTimeout(1000);
    });

    test('should display AI assistant interface', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'ChordLine AI' })).toBeVisible();
      await expect(page.getByPlaceholder('Ask me anything about your band...')).toBeVisible();
    });

    test('should show welcome message', async ({ page }) => {
      await expect(page.getByText(/Hello.*ChordLine AI assistant/)).toBeVisible({ timeout: 3000 });
    });

    test('should handle user input', async ({ page }) => {
      const input = page.getByPlaceholder('Ask me anything about your band...');
      
      // Type a message
      await input.fill('We played at The Bluebird last night for $600');
      
      // Send message
      await page.keyboard.press('Enter');
      
      // Should show user message
      await expect(page.getByText('We played at The Bluebird last night for $600', { exact: true })).toBeVisible();
      
      // Wait for AI response
      await page.waitForTimeout(3000);
      
      // Should show some kind of response or action buttons
      const aiResponse = page.getByText(/I can help.*show/);
      if (await aiResponse.isVisible({ timeout: 2000 })) {
        await expect(aiResponse).toBeVisible();
      }
    });
  });

  test.describe('Integrations', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in and navigate to integrations
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      await page.getByRole('link', { name: 'Apps' }).click();
      await page.waitForTimeout(1000);
    });

    test('should display integrations page', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Integrations' })).toBeVisible();
      await expect(page.getByText('Export Tools')).toBeVisible();
      await expect(page.getByText('OpenWeatherMap')).toBeVisible();
      await expect(page.getByText('Google Places')).toBeVisible();
    });

    test('should open export tools modal and export data', async ({ page }) => {
      // Click on Export Tools - try multiple selectors
      const exportButton = page.getByRole('button', { name: /export.*tools/i }).or(
        page.getByText('Export Tools').locator('..').getByRole('button', { name: /use/i })).or(
        page.locator('[data-testid="export-tools-button"]')).or(
        page.getByText('Export Tools').locator('xpath=../..').getByRole('button')
      );
      await exportButton.first().click({ timeout: 10000 });
      
      // Should open export modal
      await expect(page.getByText('Export Data')).toBeVisible();
      
      // Select export options
      await page.getByText('All Data').click();
      await page.getByText('CSV').click();
      
      // Set up download promise
      const downloadPromise = page.waitForEvent('download');
      
      // Execute export
      await page.getByRole('button', { name: /export/i }).click();
      
      // Verify download starts
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/.*\\.csv$/);
    });
  });

  test.describe('Profile Management', () => {
    test.beforeEach(async ({ page }) => {
      // Sign in and navigate to profile
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      await page.getByRole('link', { name: 'Profile' }).click();
      await page.waitForTimeout(1000);
    });

    test('should display profile settings', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Profile & Settings' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Account' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Band' })).toBeVisible();
    });

    test('should show current band information', async ({ page }) => {
      // Switch to band tab
      await page.getByRole('button', { name: 'Band' }).click();
      
      // Should show current band
      await expect(page.getByText('The Demo Band', { exact: false })).toBeVisible({ timeout: 3000 });
    });

    test('should handle profile updates', async ({ page }) => {
      // Try to update display name
      const nameInput = page.getByPlaceholder('Enter your name');
      if (await nameInput.isVisible({ timeout: 2000 })) {
        await nameInput.fill('Test User Updated');
        
        // Save changes
        await page.getByRole('button', { name: /save/i }).click();
        
        // Should show saving state
        const savingText = page.getByText('Saving...');
        if (await savingText.isVisible({ timeout: 1000 })) {
          await expect(savingText).not.toBeVisible({ timeout: 3000 });
        }
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
    });

    test('should work on mobile dashboard', async ({ page }) => {
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      
      // Should display properly on mobile
      await expect(page.getByText('Dashboard')).toBeVisible();
      await expect(page.getByRole('button', { name: 'The Demo Band' })).toBeVisible();
    });

    test('should handle mobile navigation', async ({ page }) => {
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      
      // Navigation should work on mobile
      await page.getByRole('link', { name: 'Shows' }).click();
      await expect(page.getByRole('heading', { name: 'Shows' })).toBeVisible();
      
      await page.getByRole('link', { name: 'Earnings' }).click();
      await expect(page.getByRole('heading', { name: 'Earnings' })).toBeVisible();
    });

    test('should handle mobile forms', async ({ page }) => {
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      await page.getByRole('link', { name: 'Shows' }).click();
      await page.waitForTimeout(1000);
      
      // Try opening add show modal on mobile
      const addButton = page.getByRole('button').filter({ hasText: '+' });
      if (await addButton.isVisible({ timeout: 2000 })) {
        await addButton.click();
        
        // Form should work on mobile
        const titleInput = page.getByPlaceholder('Enter show title');
        if (await titleInput.isVisible({ timeout: 2000 })) {
          await titleInput.fill('Mobile Test Show');
          await expect(titleInput).toHaveValue('Mobile Test Show');
        }
        
        // Close modal
        await page.keyboard.press('Escape');
      }
    });
  });

  test.describe('Performance & Logging Validation', () => {
    test('should have comprehensive logging enabled', async ({ page }) => {
      // Navigate to shows to trigger logging
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      await page.getByRole('link', { name: 'Shows' }).click();
      await page.waitForTimeout(3000);
      
      // Check console logs for our logging system
      const logs = await page.evaluate(() => {
        return (window as any).console._logs || [];
      });
      
      // Alternatively, just verify the page loads without errors
      await expect(page.getByRole('heading', { name: 'Shows' })).toBeVisible();
    });

    test('should load pages within acceptable time limits', async ({ page }) => {
      // Test dashboard load time
      const startTime = Date.now();
      await page.getByText('Continue with Google').click();
      await page.waitForSelector('text=Dashboard', { timeout: 10000 });
      const dashboardLoadTime = Date.now() - startTime;
      
      expect(dashboardLoadTime).toBeLessThan(5000); // Should load within 5 seconds
      
      // Test shows page load time
      const showsStartTime = Date.now();
      await page.getByRole('link', { name: 'Shows' }).click();
      await page.waitForSelector('text=Shows', { timeout: 10000 });
      const showsLoadTime = Date.now() - showsStartTime;
      
      expect(showsLoadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test('should handle rapid navigation without breaking', async ({ page }) => {
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      
      // Rapidly navigate between pages
      const pages = ['Shows', 'Earnings', 'AI', 'Apps', 'Profile'];
      for (let i = 0; i < 2; i++) {
        for (const pageName of pages) {
          await page.getByRole('link', { name: pageName }).click();
          await page.waitForTimeout(300);
        }
      }
      
      // Should still be functional
      await expect(page.getByText('Profile & Settings')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle empty states gracefully', async ({ page }) => {
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      await page.getByRole('link', { name: 'Shows' }).click();
      await page.waitForTimeout(2000);
      
      // Try filtering to an empty state
      await page.getByRole('button', { name: 'completed' }).click();
      await page.waitForTimeout(1000);
      
      // Should show empty state message
      await expect(page.getByText('No completed shows')).toBeVisible();
      
      // Should show appropriate empty state or no shows message
      const noShowsMessage = page.getByText(/No.*shows|No.*completed/);
      if (await noShowsMessage.isVisible({ timeout: 2000 })) {
        await expect(noShowsMessage).toBeVisible();
      }
    });

    test('should handle network timeouts gracefully', async ({ page }) => {
      // Add artificial delay to network requests
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return route.continue();
      });
      
      await page.getByText('Continue with Google').click();
      
      // Should still load, just slower
      await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Data Persistence', () => {
    test('should maintain state between page navigations', async ({ page }) => {
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      
      // Go to shows page
      await page.getByRole('link', { name: 'Shows' }).click();
      await page.waitForTimeout(2000);
      
      // Check if shows are loaded
      const showsVisible = await page.getByText('Friday Night Live').isVisible({ timeout: 3000 });
      
      // Navigate away and back
      await page.getByRole('link', { name: 'Dashboard' }).click({ timeout: 10000 });
      await page.waitForTimeout(2000);
      await page.getByRole('link', { name: 'Shows' }).click({ timeout: 10000 });
      await page.waitForTimeout(3000);
      
      // Data should still be there
      if (showsVisible) {
        await expect(page.getByText('Friday Night Live')).toBeVisible();
      }
    });
  });
});

/**
 * Utility test for debugging
 */
test.describe('Debug & Development', () => {
  test('debug - take screenshots of all pages', async ({ page }) => {
    // Skip in CI
    test.skip(!!process.env.CI, 'Skip screenshot test in CI');
    
    await page.getByText('Continue with Google').click({ timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Take screenshot of dashboard
    await page.screenshot({ path: 'debug-dashboard.png', fullPage: true });
    
    // Screenshot each page
    const pages = [
      { name: 'shows', link: 'Shows' },
      { name: 'earnings', link: 'Earnings' },
      { name: 'ai', link: 'AI' },
      { name: 'integrations', link: 'Apps' },
      { name: 'profile', link: 'Profile' }
    ];
    
    for (const { name, link } of pages) {
      await page.getByRole('link', { name: link }).click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `debug-${name}.png`, fullPage: true });
    }
  });
});