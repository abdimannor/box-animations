// Motion button in a browser that asks for reduced motion: motion stays on by default.
const { test, expect } = require('@playwright/test');

test.use({ contextOptions: { reducedMotion: 'reduce' } });

const toggle = '#motion-switch';

test('moving by default, off after the button, remembered after reload', async ({ page }) => {
  await page.goto('./');
  const html = page.locator('html');
  const button = page.locator(toggle);
  await expect(html).toHaveAttribute('data-motion', 'on');
  await expect(button).toBeVisible();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(button).toHaveAccessibleName('Pause motion');
  await expect.poll(() => page.evaluate(() =>
    document.getAnimations().filter((a) => a.playState === 'running').length)).toBeGreaterThanOrEqual(6);
  await button.click();
  await expect(html).toHaveAttribute('data-motion', 'off');
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(button).toHaveAccessibleName('Play motion');
  await page.reload();
  await expect(html).toHaveAttribute('data-motion', 'off');
  await expect.poll(() => page.evaluate(() =>
    document.querySelectorAll('.stage *').length && document.getAnimations().filter((a) => a.effect?.target?.closest?.('.stage')).length)).toBe(0);
  await button.click();
  await expect(html).toHaveAttribute('data-motion', 'on');
  await page.reload();
  await expect(html).toHaveAttribute('data-motion', 'on');
});
