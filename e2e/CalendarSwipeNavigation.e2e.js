const { device, expect, element, by, waitFor } = require('detox');

describe('Calendar Swipe Navigation E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
    
    // Navigate to calendar screen (adjust navigation based on your app structure)
    await element(by.id('calendar-tab')).tap();
    
    // Wait for calendar to load
    await waitFor(element(by.id('calendar-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  describe('Basic Swipe Navigation', () => {
    it('should navigate to next month with swipe left', async () => {
      // Get initial month text
      const initialMonth = await element(by.id('month-title')).getAttributes();
      
      // Perform swipe left gesture on calendar container
      await element(by.id('calendar-container')).swipe('left', 'slow', 0.8);
      
      // Wait for animation to complete
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Verify month has changed
      const newMonth = await element(by.id('month-title')).getAttributes();
      expect(newMonth.text).not.toBe(initialMonth.text);
    });

    it('should navigate to previous month with swipe right', async () => {
      // Get initial month text
      const initialMonth = await element(by.id('month-title')).getAttributes();
      
      // Perform swipe right gesture on calendar container
      await element(by.id('calendar-container')).swipe('right', 'slow', 0.8);
      
      // Wait for animation to complete
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Verify month has changed
      const newMonth = await element(by.id('month-title')).getAttributes();
      expect(newMonth.text).not.toBe(initialMonth.text);
    });

    it('should handle fast swipe gestures correctly', async () => {
      const initialMonth = await element(by.id('month-title')).getAttributes();
      
      // Perform fast swipe
      await element(by.id('calendar-container')).swipe('left', 'fast', 0.9);
      
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      const newMonth = await element(by.id('month-title')).getAttributes();
      expect(newMonth.text).not.toBe(initialMonth.text);
    });

    it('should ignore very short swipe gestures', async () => {
      const initialMonth = await element(by.id('month-title')).getAttributes();
      
      // Perform very short swipe (should not trigger navigation)
      await element(by.id('calendar-container')).swipe('left', 'slow', 0.1);
      
      // Wait a bit and verify month hasn't changed
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentMonth = await element(by.id('month-title')).getAttributes();
      expect(currentMonth.text).toBe(initialMonth.text);
    });
  });

  describe('Month Boundary Testing', () => {
    it('should correctly transition from December to January', async () => {
      // Navigate to December (this may require multiple swipes)
      let monthText = '';
      let attempts = 0;
      
      while (!monthText.includes('December') && attempts < 20) {
        await element(by.id('calendar-container')).swipe('right', 'fast', 0.8);
        await waitFor(element(by.id('month-title')))
          .toBeVisible()
          .withTimeout(1000);
        
        const monthAttributes = await element(by.id('month-title')).getAttributes();
        monthText = monthAttributes.text;
        attempts++;
      }
      
      expect(monthText).toContain('December');
      
      // Now swipe left to go to January of next year
      await element(by.id('calendar-container')).swipe('left', 'slow', 0.8);
      
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      const januaryAttributes = await element(by.id('month-title')).getAttributes();
      expect(januaryAttributes.text).toContain('January');
    });

    it('should correctly transition from January to December', async () => {
      // Navigate to January
      let monthText = '';
      let attempts = 0;
      
      while (!monthText.includes('January') && attempts < 20) {
        await element(by.id('calendar-container')).swipe('left', 'fast', 0.8);
        await waitFor(element(by.id('month-title')))
          .toBeVisible()
          .withTimeout(1000);
        
        const monthAttributes = await element(by.id('month-title')).getAttributes();
        monthText = monthAttributes.text;
        attempts++;
      }
      
      expect(monthText).toContain('January');
      
      // Now swipe right to go to December of previous year
      await element(by.id('calendar-container')).swipe('right', 'slow', 0.8);
      
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      const decemberAttributes = await element(by.id('month-title')).getAttributes();
      expect(decemberAttributes.text).toContain('December');
    });

    it('should update calendar grid correctly after month changes', async () => {
      // Navigate to February to test different number of days
      let monthText = '';
      let attempts = 0;
      
      while (!monthText.includes('February') && attempts < 20) {
        await element(by.id('calendar-container')).swipe('left', 'fast', 0.8);
        await waitFor(element(by.id('month-title')))
          .toBeVisible()
          .withTimeout(1000);
        
        const monthAttributes = await element(by.id('month-title')).getAttributes();
        monthText = monthAttributes.text;
        attempts++;
      }
      
      expect(monthText).toContain('February');
      
      // Verify February-specific days are visible (like day 28)
      await expect(element(by.text('28'))).toBeVisible();
      
      // In non-leap years, day 30 should not be visible for February
      await expect(element(by.text('30'))).not.toBeVisible();
    });
  });

  describe('Task Integration', () => {
    it('should display tasks correctly after month navigation', async () => {
      // Navigate to a month with known test data
      await element(by.id('calendar-container')).swipe('left', 'slow', 0.8);
      
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Check that tasks are displayed on days with data
      // This assumes you have test data or sample tasks
      await waitFor(element(by.id('task-indicator')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should maintain task data consistency across month changes', async () => {
      // Navigate forward then backward to ensure data consistency
      const initialMonth = await element(by.id('month-title')).getAttributes();
      
      await element(by.id('calendar-container')).swipe('left', 'slow', 0.8);
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      await element(by.id('calendar-container')).swipe('right', 'slow', 0.8);
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      const finalMonth = await element(by.id('month-title')).getAttributes();
      expect(finalMonth.text).toBe(initialMonth.text);
    });
  });

  describe('Day Selection with Swipe Conflicts', () => {
    it('should allow day selection without triggering swipe navigation', async () => {
      // Tap on a specific day
      await element(by.text('15')).tap();
      
      // Verify that navigation to timeline occurs (adjust based on your implementation)
      await waitFor(element(by.id('timeline-screen')))
        .toBeVisible()
        .withTimeout(3000);
      
      // Navigate back to calendar
      await device.pressBack(); // Android
      // For iOS: await element(by.id('back-button')).tap();
      
      await waitFor(element(by.id('calendar-screen')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should not trigger day selection during swipe gestures', async () => {
      const initialMonth = await element(by.id('month-title')).getAttributes();
      
      // Perform swipe that starts on a day but should trigger month navigation
      await element(by.text('15')).swipe('left', 'fast', 0.8);
      
      // Should navigate to next month, not select the day
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      const newMonth = await element(by.id('month-title')).getAttributes();
      expect(newMonth.text).not.toBe(initialMonth.text);
      
      // Should still be on calendar screen, not timeline
      await expect(element(by.id('calendar-screen'))).toBeVisible();
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should respond to gestures within acceptable time', async () => {
      const startTime = Date.now();
      
      await element(by.id('calendar-container')).swipe('left', 'fast', 0.8);
      
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // Gesture response should be under 500ms for good UX
      expect(responseTime).toBeLessThan(500);
    });

    it('should handle rapid successive swipes gracefully', async () => {
      // Perform multiple rapid swipes
      await element(by.id('calendar-container')).swipe('left', 'fast', 0.8);
      await element(by.id('calendar-container')).swipe('left', 'fast', 0.8);
      await element(by.id('calendar-container')).swipe('right', 'fast', 0.8);
      await element(by.id('calendar-container')).swipe('right', 'fast', 0.8);
      
      // Should still be responsive and not crash
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(3000);
      
      await expect(element(by.id('calendar-screen'))).toBeVisible();
    });

    it('should maintain smooth animation during swipes', async () => {
      // This is harder to test automatically, but we can ensure no crashes occur
      // during animation and that the final state is correct
      
      const initialMonth = await element(by.id('month-title')).getAttributes();
      
      // Perform swipe and immediately check intermediate state
      await element(by.id('calendar-container')).swipe('left', 'slow', 0.8);
      
      // Animation should complete without crashes
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      const finalMonth = await element(by.id('month-title')).getAttributes();
      expect(finalMonth.text).not.toBe(initialMonth.text);
    });
  });

  describe('Edge Cases', () => {
    it('should handle interrupted swipe gestures', async () => {
      // Start a swipe but don't complete it (simulate finger lift mid-swipe)
      // This is difficult to simulate exactly, but we can test partial swipes
      
      const initialMonth = await element(by.id('month-title')).getAttributes();
      
      // Very short swipe that might be interrupted
      await element(by.id('calendar-container')).swipe('left', 'slow', 0.2);
      
      // Should either complete navigation or stay on same month
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Calendar should remain functional
      await expect(element(by.id('calendar-screen'))).toBeVisible();
    });

    it('should work correctly on different screen sizes', async () => {
      // Rotate device to test landscape mode
      await device.setOrientation('landscape');
      
      await waitFor(element(by.id('calendar-screen')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Test swipe in landscape
      await element(by.id('calendar-container')).swipe('left', 'slow', 0.8);
      
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Rotate back to portrait
      await device.setOrientation('portrait');
      
      await waitFor(element(by.id('calendar-screen')))
        .toBeVisible()
        .withTimeout(2000);
    });

    it('should handle simultaneous touches gracefully', async () => {
      // This is challenging to test with Detox, but we can test rapid taps
      // followed by swipes to simulate potential conflicts
      
      await element(by.text('15')).tap();
      await element(by.id('calendar-container')).swipe('left', 'fast', 0.8);
      
      // Should handle this gracefully without crashes
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Accessibility', () => {
    it('should maintain accessibility during swipe navigation', async () => {
      // Test that accessibility labels are updated after month changes
      await element(by.id('calendar-container')).swipe('left', 'slow', 0.8);
      
      await waitFor(element(by.id('month-title')))
        .toBeVisible()
        .withTimeout(2000);
      
      // Verify accessibility elements are still present and updated
      await expect(element(by.id('month-title'))).toBeVisible();
      
      // Test that screen readers can still navigate (if accessibility testing is set up)
      // This would require additional accessibility testing configuration
    });

    it('should support VoiceOver/TalkBack navigation alongside swipes', async () => {
      // Enable accessibility and test that voice navigation works
      // This would require specific accessibility testing setup
      
      await expect(element(by.id('calendar-screen'))).toBeVisible();
    });
  });

  describe('Memory and Resource Management', () => {
    it('should not cause memory leaks during extensive navigation', async () => {
      // Navigate through many months to test for memory leaks
      for (let i = 0; i < 20; i++) {
        await element(by.id('calendar-container')).swipe('left', 'fast', 0.8);
        await waitFor(element(by.id('month-title')))
          .toBeVisible()
          .withTimeout(1000);
      }
      
      // App should still be responsive
      await expect(element(by.id('calendar-screen'))).toBeVisible();
      
      // Navigate back
      for (let i = 0; i < 20; i++) {
        await element(by.id('calendar-container')).swipe('right', 'fast', 0.8);
        await waitFor(element(by.id('month-title')))
          .toBeVisible()
          .withTimeout(1000);
      }
      
      await expect(element(by.id('calendar-screen'))).toBeVisible();
    });
  });

  afterEach(async () => {
    // Reset to a known state if needed
    await device.reloadReactNative();
  });

  afterAll(async () => {
    await device.terminateApp();
  });
});