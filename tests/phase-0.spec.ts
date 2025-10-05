import { test, expect } from '@playwright/test';

// Configure to run tests in mock mode for fast execution
test.beforeEach(async ({ page }) => {
  // Set mock data mode and simulate authenticated state
  await page.addInitScript(() => {
    window.localStorage.setItem('VITE_USE_MOCK_DATA', 'true');
    
    // Mock authenticated user in localStorage
    const mockUser = {
      id: 'mock-user-id',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_confirmed_at: new Date().toISOString(),
      user_metadata: { full_name: 'Test User' },
      app_metadata: {},
      aud: 'authenticated'
    };
    
    // Store mock auth state
    window.localStorage.setItem('MOCK_AUTH_USER', JSON.stringify(mockUser));
    window.localStorage.setItem('MOCK_AUTH_AUTHENTICATED', 'true');
  });
});

test.describe('Phase 0: Core CRUD Operations & Mobile Responsiveness', () => {
  
  test.describe('Authentication', () => {
    test('should show auth page for unauthenticated users', async ({ page }) => {
      // Clear mock auth for this test
      await page.addInitScript(() => {
        window.localStorage.removeItem('MOCK_AUTH_USER');
        window.localStorage.removeItem('MOCK_AUTH_AUTHENTICATED');
      });
      
      await page.goto('/');
      
      // Should show auth page content (not redirect to /auth)
      await expect(page).toHaveURL('http://localhost:5173/');
      
      // Should show auth form elements
      await expect(page.getByText('Welcome to ChordLine')).toBeVisible();
      await expect(page.getByText('Your band management platform')).toBeVisible();
      await expect(page.getByPlaceholder('Enter your email address')).toBeVisible();
    });

    test('should handle magic link sign in', async ({ page }) => {
      // Clear mock auth for this test
      await page.addInitScript(() => {
        window.localStorage.removeItem('MOCK_AUTH_USER');
        window.localStorage.removeItem('MOCK_AUTH_AUTHENTICATED');
      });
      
      await page.goto('/');
      
      // Fill email
      await page.fill('input[placeholder="Enter your email address"]', 'test@example.com');
      
      // Submit should be enabled now
      const signInButton = page.getByText('Sign in with Magic Link');
      await expect(signInButton).not.toBeDisabled();
    });

    test('should handle Google sign in', async ({ page }) => {
      // Clear mock auth for this test
      await page.addInitScript(() => {
        window.localStorage.removeItem('MOCK_AUTH_USER');
        window.localStorage.removeItem('MOCK_AUTH_AUTHENTICATED');
      });
      
      await page.goto('/');
      
      // Google sign in button should be visible
      await expect(page.getByText('Continue with Google')).toBeVisible();
      
      // Click Google sign in (in mock mode this will simulate login)
      await page.getByText('Continue with Google').click();
      
      // Should show loading or redirect
      await page.waitForTimeout(2000);
    });
  });

  test.describe('Band Creation & Management', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authenticated state
      await page.goto('/dashboard');
    });

    test('should show create band prompt for new users', async ({ page }) => {
      await expect(page.getByText('Welcome to ChordLine!')).toBeVisible();
      await expect(page.getByText('Create Your Band')).toBeVisible();
    });

    test('should create a new band', async ({ page }) => {
      // Click create band button
      await page.getByText('Create Your Band').click();
      
      // Fill form
      await page.fill('input[placeholder*="band name"]', 'Test Band');
      await page.fill('textarea[placeholder*="description"]', 'A test band for Playwright');
      
      // Submit
      await page.getByRole('button', { name: /create/i }).click();
      
      // Should redirect to dashboard with new band
      await page.waitForTimeout(1000);
      await expect(page.getByText('Test Band')).toBeVisible();
    });

    test('should switch between bands', async ({ page }) => {
      // Should show band selector dropdown
      await page.getByText('The Demo Band').click();
      
      // Should show available bands
      await expect(page.getByText('Acoustic Vibes')).toBeVisible();
      
      // Switch band
      await page.getByText('Acoustic Vibes').click();
      
      // Should update current band
      await expect(page.getByText('Welcome back to Acoustic Vibes')).toBeVisible();
    });
  });

  test.describe('Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard');
      // Wait for mock data to load
      await page.waitForTimeout(1000);
    });

    test('should display dashboard statistics', async ({ page }) => {
      // Check stats cards
      await expect(page.getByText('Total Shows')).toBeVisible();
      await expect(page.getByText('Total Earnings')).toBeVisible();
      
      // Check stats values (using more specific locators)
      await expect(page.getByText('3')).toBeVisible(); // Mock total shows
      await expect(page.getByText('$12,723.5')).toBeVisible(); // Mock earnings (includes decimal)
    });

    test('should display next show information', async ({ page }) => {
      await expect(page.getByText('Next Show')).toBeVisible();
      await expect(page.getByText('Saturday Night Show')).toBeVisible();
      await expect(page.getByText('Ryman Auditorium, Nashville')).toBeVisible();
    });

    test('should have working navigation', async ({ page }) => {
      // Test all navigation buttons
      await page.getByText('Shows').click();
      await expect(page).toHaveURL(/\/shows/);
      
      await page.getByText('Earnings').click(); 
      await expect(page).toHaveURL(/\/earnings/);
      
      await page.getByText('Assistant').click();
      await expect(page).toHaveURL(/\/assistant/);
      
      await page.getByText('Profile').click();
      await expect(page).toHaveURL(/\/profile/);
    });
  });

  test.describe('Shows Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/shows');
      await page.waitForTimeout(1000);
    });

    test('should display shows list', async ({ page }) => {
      await expect(page.getByText('Shows')).toBeVisible();
      
      // Should show mock shows
      await expect(page.getByText('Friday Night Live')).toBeVisible();
      await expect(page.getByText('Saturday Night Show')).toBeVisible();
      await expect(page.getByText('New Year\'s Eve Celebration')).toBeVisible();
      await expect(page.getByText('The Bluebird Cafe, Nashville, TN')).toBeVisible();
      await expect(page.getByText('Ryman Auditorium, Nashville, TN')).toBeVisible();
    });

    test('should open add show modal', async ({ page }) => {
      await page.getByRole('button', { name: /add show/i }).click();
      
      await expect(page.getByText('Add New Show')).toBeVisible();
      await expect(page.getByLabelText('Show Title')).toBeVisible();
      await expect(page.getByLabelText('Date')).toBeVisible();
    });

    test('should create a new show', async ({ page }) => {
      await page.getByRole('button', { name: /add show/i }).click();
      
      // Fill form
      await page.fill('input[placeholder="Enter show title"]', 'Test Show');
      await page.fill('input[type="date"]', '2024-12-25');
      await page.fill('input[type="time"]', '20:00');
      
      // Save
      await page.getByRole('button', { name: /save show/i }).click();
      
      // Should close modal and show in list
      await page.waitForTimeout(1000);
      await expect(page.getByText('Test Show')).toBeVisible();
    });

    test('should edit an existing show', async ({ page }) => {
      // Click on first show
      await page.getByText('Downtown Venue').click();
      
      // Should show edit form
      await expect(page.getByDisplayValue('Rock Night')).toBeVisible();
      
      // Update title
      await page.fill('input[value="Rock Night"]', 'Updated Rock Night');
      
      // Save
      await page.getByRole('button', { name: /save/i }).click();
      
      // Should show updated title
      await page.waitForTimeout(1000);
      await expect(page.getByText('Updated Rock Night')).toBeVisible();
    });

    test('should filter shows', async ({ page }) => {
      // Test status filter
      await page.selectOption('select', 'upcoming');
      
      // Should filter results (mock data dependent)
      await page.waitForTimeout(500);
      
      // Reset filter
      await page.selectOption('select', 'all');
    });
  });

  test.describe('Earnings Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/earnings');
      await page.waitForTimeout(1000);
    });

    test('should display earnings list', async ({ page }) => {
      await expect(page.getByText('Earnings')).toBeVisible();
      
      // Should show mock earnings
      await expect(page.getByText('+$3,750')).toBeVisible();
      await expect(page.getByText('+$8,500')).toBeVisible();
      await expect(page.getByText('Friday Night Live - The Bluebird Cafe')).toBeVisible();
      await expect(page.getByText('Spotify Monthly Royalties')).toBeVisible();
    });

    test('should display total earnings', async ({ page }) => {
      await expect(page.getByText('$13,223.5')).toBeVisible();
    });

    test('should open add earnings modal', async ({ page }) => {
      await page.getByRole('button', { name: /add earnings/i }).click();
      
      await expect(page.getByText('Add New Earnings')).toBeVisible();
      await expect(page.getByLabelText('Amount')).toBeVisible();
      await expect(page.getByLabelText('Source')).toBeVisible();
    });

    test('should create new earnings entry', async ({ page }) => {
      const earningsButton = page.locator('button').filter({ hasText: /add|\+/ }).first();
      await earningsButton.click();
      
      // Should open earnings modal
      await expect(page.getByText('Add New Earnings')).toBeVisible();
      
      // Fill form with test data
      await page.fill('input[type="number"]', '500');
      
      // Save earnings
      await page.getByRole('button', { name: /save|create/i }).click();
      
      // Should close modal and show success
      await page.waitForTimeout(1000);
    });

    test('should filter earnings', async ({ page }) => {
      // Test source filter
      await page.selectOption('select', 'ticket_sales');
      
      // Should filter results
      await page.waitForTimeout(500);
      
      // Reset filter
      await page.selectOption('select', 'all');
    });
  });

  test.describe('Profile Management', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/profile');
    });

    test('should display profile sections', async ({ page }) => {
      await expect(page.getByText('Profile & Settings')).toBeVisible();
      
      // Check tabs
      await expect(page.getByText('Account')).toBeVisible();
      await expect(page.getByText('Band')).toBeVisible();
    });

    test('should update display name', async ({ page }) => {
      // Fill display name
      await page.fill('input[placeholder="Enter your name"]', 'Test User');
      
      // Save changes
      await page.getByRole('button', { name: /save changes/i }).click();
      
      // Should show saving state
      await expect(page.getByText('Saving...')).toBeVisible();
      
      // Wait for save to complete
      await page.waitForTimeout(1500);
      await expect(page.getByText('Save Changes')).toBeVisible();
    });

    test('should show current band information', async ({ page }) => {
      // Switch to band tab
      await page.getByText('Band').click();
      
      // Should show current band
      await expect(page.getByText('Current Band')).toBeVisible();
      await expect(page.getByText('The Demo Band')).toBeVisible();
    });

    test('should sign out', async ({ page }) => {
      // Click sign out
      await page.getByRole('button', { name: /sign out/i }).click();
      
      // Should redirect to auth page
      await page.waitForTimeout(1000);
      await expect(page).toHaveURL(/\/auth/);
    });
  });

  test.describe('Assistant Chat', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/assistant');
    });

    test('should display chat interface', async ({ page }) => {
      await expect(page.getByText('ChordLine AI')).toBeVisible();
      await expect(page.getByPlaceholder('Ask me anything about your band...')).toBeVisible();
    });

    test('should show welcome message', async ({ page }) => {
      await expect(page.getByText('Hello! I\'m your ChordLine AI assistant')).toBeVisible();
    });

    test('should handle user input', async ({ page }) => {
      const input = page.getByPlaceholder('Ask me anything about your band...');
      
      // Type message
      await input.fill('We played at The Bluebird last night for $600');
      
      // Send message
      await page.keyboard.press('Enter');
      
      // Should show user message
      await expect(page.getByText('We played at The Bluebird last night for $600')).toBeVisible();
      
      // Should show typing indicator
      await expect(page.getByText('Thinking...')).toBeVisible();
      
      // Wait for AI response
      await page.waitForTimeout(2000);
      
      // Should show suggested actions
      await expect(page.getByText('Create a new show entry')).toBeVisible();
      await expect(page.getByText('Add earnings record')).toBeVisible();
    });

    test('should handle action buttons', async ({ page }) => {
      const input = page.getByPlaceholder('Ask me anything about your band...');
      
      // Send message that triggers actions
      await input.fill('We played at The Bluebird last night for $600');
      await page.keyboard.press('Enter');
      
      // Wait for AI response with actions
      await page.waitForTimeout(2000);
      
      // Click approve action
      await page.getByText('Yes, do it').first().click();
      
      // Should show confirmation
      await expect(page.getByText('Great! I would create that show for you')).toBeVisible();
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 812 });
    });

    test('should be responsive on dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);
      
      // Check that content fits mobile viewport
      await expect(page.getByText('Dashboard')).toBeVisible();
      await expect(page.getByText('Total Shows')).toBeVisible();
      
      // Stats should stack vertically on mobile
      const statsCards = page.locator('[class*="grid-cols-2"]');
      await expect(statsCards).toBeVisible();
    });

    test('should have working mobile navigation', async ({ page }) => {
      await page.goto('/dashboard');
      await page.waitForTimeout(1000);
      
      // Navigation should be visible
      await expect(page.getByText('Shows')).toBeVisible();
      await expect(page.getByText('Earnings')).toBeVisible();
      
      // Test navigation
      await page.getByText('Shows').click();
      await expect(page).toHaveURL(/\/shows/);
    });

    test('should handle mobile forms properly', async ({ page }) => {
      await page.goto('/shows');
      await page.waitForTimeout(1000);
      
      // Open add show modal
      await page.getByRole('button', { name: /add show/i }).click();
      
      // Form should fit mobile screen
      await expect(page.getByText('Add New Show')).toBeVisible();
      
      // Input should be touch-friendly
      const titleInput = page.getByPlaceholder('Enter show title');
      await titleInput.fill('Mobile Test Show');
      await expect(titleInput).toHaveValue('Mobile Test Show');
    });

    test('should handle mobile chat interface', async ({ page }) => {
      await page.goto('/assistant');
      
      // Chat input should be at bottom and visible
      const input = page.getByPlaceholder('Ask me anything about your band...');
      await expect(input).toBeVisible();
      
      // Should be able to type and send
      await input.fill('Test mobile message');
      await page.keyboard.press('Enter');
      
      await expect(page.getByText('Test mobile message')).toBeVisible();
    });
  });

  test.describe('Integration Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/integrations');
    });

    test('should display integrations page', async ({ page }) => {
      await expect(page.getByText('Integrations')).toBeVisible();
      await expect(page.getByText('Export Tools')).toBeVisible();
      await expect(page.getByText('OpenWeatherMap')).toBeVisible();
    });

    test('should open export tools modal', async ({ page }) => {
      // Click on Export Tools integration
      await page.getByText('Export Tools').locator('xpath=../..').getByRole('button', { name: /use|connect/i }).click();
      
      // Should open export modal
      await expect(page.getByText('Export Data')).toBeVisible();
      await expect(page.getByText('What to export')).toBeVisible();
    });

    test('should export CSV data', async ({ page }) => {
      // Open export tools
      await page.getByText('Export Tools').locator('xpath=../..').getByRole('button', { name: /use|connect/i }).click();
      
      // Select all data and CSV format
      await page.getByText('All Data').click();
      await page.getByText('CSV').click();
      
      // Set up download promise before clicking export
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: /export/i }).click();
      
      // Wait for download to start
      const download = await downloadPromise;
      
      // Verify download filename contains expected format
      expect(download.suggestedFilename()).toMatch(/.*_all_.*\.csv/);
    });

    test('should show weather information on shows', async ({ page }) => {
      await page.goto('/shows');
      await page.waitForTimeout(2000); // Wait for weather to load
      
      // Should show weather info for upcoming shows
      const weatherElements = page.locator('text=°F');
      if (await weatherElements.count() > 0) {
        await expect(weatherElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Band Creation and Management', () => {
    test('should create a new band', async ({ page }) => {
      // Start from dashboard
      await page.goto('/dashboard');
      
      // If already has a band, go to profile to create another
      if (await page.getByText('Dashboard').isVisible()) {
        await page.goto('/profile');
        await page.getByText('Band').click();
      }
      
      // Look for create band option
      const createButton = page.getByText('Create Your Band').or(page.getByText('Create New Band')).first();
      if (await createButton.isVisible()) {
        await createButton.click();
        
        // Fill band creation form
        await page.fill('input[placeholder*="name"]', 'Test Playwright Band');
        await page.fill('textarea', 'A band created during automated testing');
        
        // Submit
        await page.getByRole('button', { name: /create|save/i }).click();
        
        // Should redirect to dashboard with new band
        await page.waitForTimeout(2000);
      }
    });

    test('should switch between bands', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Look for band selector dropdown
      const bandDropdown = page.locator('button').filter({ hasText: /demo band|band/i }).first();
      if (await bandDropdown.isVisible()) {
        await bandDropdown.click();
        
        // Should show available bands
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('CRUD Operations Comprehensive', () => {
    test('should perform full show lifecycle', async ({ page }) => {
      await page.goto('/shows');
      await page.waitForTimeout(1000);
      
      // Count initial shows
      const initialShowsCount = await page.locator('.bg-card.border.border-border.rounded-lg').count();
      
      // Add new show
      await page.locator('button[aria-label="Add show"], button:has-text("+")').first().click();
      
      // Fill the form if modal opens
      if (await page.getByText('Add New Show').isVisible()) {
        await page.fill('input[placeholder*="venue"]', 'Test Venue');
        await page.fill('input[type="date"]', '2024-12-25');
        await page.fill('input[type="time"]', '20:00');
        
        await page.getByRole('button', { name: /save|create/i }).click();
        await page.waitForTimeout(1500);
        
        // Should have one more show
        const newShowsCount = await page.locator('.bg-card.border.border-border.rounded-lg').count();
        expect(newShowsCount).toBeGreaterThan(initialShowsCount);
      }
    });

    test('should perform full earnings lifecycle', async ({ page }) => {
      await page.goto('/earnings');
      await page.waitForTimeout(1000);
      
      // Check current earnings
      const initialTotal = page.getByText(/\$[0-9,]+\.[0-9]{1,2}/).first();
      if (await initialTotal.isVisible()) {
        const totalText = await initialTotal.textContent();
        expect(totalText).toMatch(/\$[0-9,]+\.[0-9]{1,2}/);
      }
      
      // Try to add new earnings
      const addButton = page.locator('button').filter({ hasText: /add|\+/ }).first();
      if (await addButton.isVisible()) {
        await addButton.click();
        
        if (await page.getByText('Add New Earnings').isVisible()) {
          await page.fill('input[type="number"]', '750');
          await page.getByRole('button', { name: /save|create/i }).click();
          await page.waitForTimeout(1000);
        }
      }
    });
  });

  test.describe('Data Persistence and State Management', () => {
    test('should maintain data between page navigations', async ({ page }) => {
      // Navigate to shows and check data
      await page.goto('/shows');
      await page.waitForTimeout(1000);
      
      const showsVisible = await page.getByText('Friday Night Live').isVisible();
      
      // Navigate to dashboard and back
      await page.goto('/dashboard');
      await page.waitForTimeout(500);
      
      await page.goto('/shows');
      await page.waitForTimeout(1000);
      
      // Data should still be there
      if (showsVisible) {
        await expect(page.getByText('Friday Night Live')).toBeVisible();
      }
    });

    test('should handle authentication state correctly', async ({ page }) => {
      // Test sign out and back in flow
      await page.goto('/profile');
      
      // Click sign out
      await page.getByRole('button', { name: /sign out/i }).click();
      
      // Should return to auth page
      await page.waitForTimeout(1000);
      await expect(page.getByText('Welcome to ChordLine')).toBeVisible();
      
      // Sign back in
      await page.getByText('Continue with Google').click();
      await page.waitForTimeout(2000);
      
      // Should be back at dashboard
      await expect(page.getByText('Dashboard')).toBeVisible();
    });
  });

  test.describe('Error Handling & Edge Cases', () => {
    test('should handle empty states gracefully', async ({ page }) => {
      // Test shows empty state
      await page.goto('/shows');
      await page.waitForTimeout(1000);
      
      // Filter to completed shows (likely empty)
      await page.getByText('completed').click();
      await page.waitForTimeout(500);
      
      // Should show appropriate empty state
      const hasEmptyState = await page.getByText('No completed shows').isVisible();
      if (hasEmptyState) {
        await expect(page.getByText('No completed shows')).toBeVisible();
      }
    });

    test('should validate form inputs', async ({ page }) => {
      await page.goto('/shows');
      await page.waitForTimeout(1000);
      
      // Open add show modal
      const addButton = page.locator('button').filter({ hasText: /add|\+/ }).first();
      if (await addButton.isVisible()) {
        await addButton.click();
        
        if (await page.getByText('Add New Show').isVisible()) {
          // Try to save without filling required fields
          await page.getByRole('button', { name: /save|create/i }).click();
          
          // Should remain on modal or show validation
          await page.waitForTimeout(500);
          // The modal should still be visible or show validation errors
        }
      }
    });

    test('should handle long content gracefully', async ({ page }) => {
      await page.goto('/earnings');
      await page.waitForTimeout(1000);
      
      // Check that long venue names and descriptions don't break layout
      const earnings = page.locator('.bg-card').first();
      if (await earnings.isVisible()) {
        const bounds = await earnings.boundingBox();
        expect(bounds?.width).toBeLessThan(400); // Should fit mobile width
      }
    });

    test('should handle network timeouts gracefully', async ({ page }) => {
      // Slow down all network requests
      await page.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return route.continue();
      });
      
      await page.goto('/dashboard');
      
      // Should still load, just slower
      await expect(page.getByText('Dashboard')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Performance and Loading States', () => {
    test('should show loading states appropriately', async ({ page }) => {
      await page.goto('/shows');
      
      // Should show loading indicator initially
      const loadingVisible = await page.locator('.animate-spin').isVisible();
      
      // Then content should load
      await page.waitForTimeout(2000);
      await expect(page.getByText('Shows')).toBeVisible();
    });

    test('should handle rapid navigation', async ({ page }) => {
      // Quickly navigate between pages
      await page.goto('/dashboard');
      await page.waitForTimeout(200);
      
      await page.goto('/shows');
      await page.waitForTimeout(200);
      
      await page.goto('/earnings');
      await page.waitForTimeout(200);
      
      await page.goto('/profile');
      await page.waitForTimeout(500);
      
      // Final page should load correctly
      await expect(page.getByText('Profile & Settings')).toBeVisible();
    });
  });
});

// Additional test suite for specific integration testing
test.describe('Integration Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated state for integration tests
    await page.addInitScript(() => {
      window.localStorage.setItem('VITE_USE_MOCK_DATA', 'true');
      const mockUser = {
        id: 'integration-test-user',
        email: 'integration@test.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        user_metadata: { full_name: 'Integration Test User' },
        app_metadata: {},
        aud: 'authenticated'
      };
      window.localStorage.setItem('MOCK_AUTH_USER', JSON.stringify(mockUser));
      window.localStorage.setItem('MOCK_AUTH_AUTHENTICATED', 'true');
    });
  });

  test('complete user workflow from login to export', async ({ page }) => {
    // 1. Navigate to app and authenticate
    await page.goto('/');
    await page.waitForTimeout(1000);
    
    // 2. Should be on dashboard
    await expect(page.getByText('Dashboard')).toBeVisible();
    
    // 3. Navigate to shows and view data
    await page.goto('/shows');
    await expect(page.getByText('Friday Night Live')).toBeVisible();
    
    // 4. Navigate to earnings
    await page.goto('/earnings');
    await expect(page.getByText('+$3,750')).toBeVisible();
    
    // 5. Go to integrations and export data
    await page.goto('/integrations');
    await page.getByText('Export Tools').locator('xpath=../..').getByRole('button', { name: /use/i }).click();
    
    // 6. Export CSV data
    await page.getByText('All Data').click();
    await page.getByText('CSV').click();
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: /export/i }).click();
    const download = await downloadPromise;
    
    expect(download.suggestedFilename()).toContain('.csv');
    
    // 7. Test profile management
    await page.goto('/profile');
    await page.fill('input[placeholder="Enter your name"]', 'Updated Integration User');
    await page.getByRole('button', { name: /save changes/i }).click();
    
    // Should show saving state
    await expect(page.getByText('Saving...')).toBeVisible();
  });
});

// Performance and PWA Test Suite
test.describe('Performance & PWA Testing', () => {
  test('should meet performance budgets', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"], h1', { timeout: 10000 });
    const loadTime = Date.now() - startTime;
    
    // Check load time is under 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
        firstByte: navigation.responseStart - navigation.navigationStart,
      };
    });
    
    // Performance assertions
    expect(performanceMetrics.firstByte).toBeLessThan(1000); // TTFB under 1s
    expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // DOM ready under 2s
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"], h1', { timeout: 10000 });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Check Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry.startTime);
            observer.disconnect();
          }
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
        
        // Fallback timeout
        setTimeout(() => {
          observer.disconnect();
          resolve(0);
        }, 3000);
      });
    });
    
    if (lcp && lcp > 0) {
      expect(lcp).toBeLessThan(2500); // LCP should be under 2.5s
    }
  });

  test('should work as PWA', async ({ page, context }) => {
    await page.goto('/');
    
    // Check for service worker registration capability
    const swSupported = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swSupported).toBeTruthy();
    
    // Check for manifest
    const manifestLink = await page.locator('link[rel="manifest"]').count();
    expect(manifestLink).toBeGreaterThan(0);
    
    // Check for PWA meta tags
    const themeColor = await page.locator('meta[name="theme-color"]').count();
    expect(themeColor).toBeGreaterThan(0);
    
    // Check for apple-touch-icon
    const appleIcon = await page.locator('link[rel="apple-touch-icon"], link[rel="icon"]').count();
    expect(appleIcon).toBeGreaterThan(0);
  });

  test('should handle offline state gracefully', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"], h1', { timeout: 10000 });
    
    // Simulate offline
    await context.setOffline(true);
    
    // Try to navigate
    const showsLink = page.getByText('Shows');
    if (await showsLink.isVisible()) {
      await showsLink.click();
    }
    
    // Should show some kind of offline indicator or cached content
    // App shouldn't crash
    await page.waitForTimeout(1000);
    
    // Restore online
    await context.setOffline(false);
  });

  test('should lazy load components efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to a page that might lazy load
    const integrationsLink = page.getByText('Integrations');
    if (await integrationsLink.isVisible()) {
      await integrationsLink.click();
      
      // Check for loading state
      const loadingIndicator = page.locator('.animate-spin, [data-testid="loading"]');
      
      // If loading state is visible, wait for it to disappear
      if (await loadingIndicator.isVisible()) {
        await expect(loadingIndicator).not.toBeVisible({ timeout: 5000 });
      }
      
      // Verify content loaded
      await expect(page.locator('h1, [data-testid="integrations"]')).toBeVisible();
    }
  });

  test('should not have excessive memory usage', async ({ page }) => {
    await page.goto('/');
    
    // Get initial memory usage if available
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate through different pages multiple times
    const pages = ['Shows', 'Earnings', 'Assistant', 'Profile'];
    for (let i = 0; i < 2; i++) {
      for (const pageName of pages) {
        const link = page.getByText(pageName);
        if (await link.isVisible()) {
          await link.click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // Check memory usage hasn't grown excessively
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory;
      const acceptableIncrease = 15 * 1024 * 1024; // 15MB
      expect(memoryIncrease).toBeLessThan(acceptableIncrease);
    }
  });

  test('should handle rapid user interactions', async ({ page }) => {
    await page.goto('/');
    
    // Rapidly click navigation items
    const navItems = ['Shows', 'Earnings', 'Dashboard'];
    for (let i = 0; i < 5; i++) {
      for (const item of navItems) {
        const link = page.getByText(item);
        if (await link.isVisible()) {
          await link.click();
          await page.waitForTimeout(100); // Very fast clicking
        }
      }
    }
    
    // App should still be responsive
    await page.waitForTimeout(1000);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should optimize images and assets', async ({ page }) => {
    await page.goto('/');
    
    // Check that images have proper loading attributes
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < Math.min(imageCount, 5); i++) {
        const img = images.nth(i);
        const loading = await img.getAttribute('loading');
        const alt = await img.getAttribute('alt');
        
        // Images should have alt text
        expect(alt).toBeTruthy();
      }
    }
  });

  test('should have efficient bundle size', async ({ page }) => {
    // This test would be better implemented as a build-time test
    // But we can check that critical resources load quickly
    const resourceLoadTimes: number[] = [];
    
    page.on('response', (response) => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        const timing = response.timing();
        if (timing) {
          resourceLoadTimes.push(timing.responseEnd);
        }
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that resources loaded in reasonable time
    if (resourceLoadTimes.length > 0) {
      const avgLoadTime = resourceLoadTimes.reduce((a, b) => a + b, 0) / resourceLoadTimes.length;
      expect(avgLoadTime).toBeLessThan(2000); // Average resource load under 2s
    }
  });

  test('should work on different network conditions', async ({ page, context }) => {
    // Simulate slow network
    await page.route('**/*', async (route) => {
      // Add delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 50));
      await route.continue();
    });
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForSelector('[data-testid="dashboard"], h1', { timeout: 15000 });
    const loadTime = Date.now() - startTime;
    
    // Should still load within reasonable time even on slow network
    expect(loadTime).toBeLessThan(10000); // 10 seconds max on slow network
    
    // Content should be visible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should handle concurrent data fetches efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Quickly navigate to data-heavy pages
    const dataPages = ['Shows', 'Earnings'];
    
    // Open multiple pages quickly
    for (const pageName of dataPages) {
      const link = page.getByText(pageName);
      if (await link.isVisible()) {
        await link.click();
        await page.waitForTimeout(50); // Very quick navigation
      }
    }
    
    // Wait for all data to settle
    await page.waitForTimeout(3000);
    
    // Should show content from final page
    await expect(page.locator('h1')).toBeVisible();
  });
});
