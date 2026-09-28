import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const routes = ['/', '/owners/find', '/vets.html'];
const widths = [390, 1440];

for (const route of routes) {
  for (const width of widths) {
    test(`${route} navbar has named controls at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(route);

      const navbar = page.locator('nav.navbar');
      await expect(navbar.locator('.navbar-brand')).toHaveAccessibleName('PetClinic home');

      const toggle = navbar.locator('.navbar-toggler');
      if (width < 992) {
        await expect(toggle).toHaveAccessibleName('Toggle navigation');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(toggle).toHaveAttribute('aria-controls', 'main-navbar');
        await expect(navbar.locator('#main-navbar')).toBeHidden();
      }
      else {
        await expect(toggle).toBeHidden();
        await expect(navbar.locator('#main-navbar a').first()).toBeVisible();
        await expect(navbar.locator('#main-navbar a').nth(0)).toHaveAccessibleName('Home');
        await expect(navbar.locator('#main-navbar a').nth(1)).toHaveAccessibleName('Find Owners');
        await expect(navbar.locator('#main-navbar a').nth(2)).toHaveAccessibleName('Veterinarians');
        await expect(navbar.locator('#main-navbar a').nth(3)).toHaveAccessibleName('Error');
      }

      const results = await new AxeBuilder({ page })
        .include('nav.navbar')
        .withRules(['button-name', 'link-name'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test('mobile navigation supports keyboard and pointer activation without trapping focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const brand = page.locator('.navbar-brand');
  const toggle = page.getByRole('button', { name: 'Toggle navigation' });
  const homeLink = page.locator('#main-navbar a').filter({ hasText: 'Home' });

  await page.keyboard.press('Tab');
  await expect(brand).toBeFocused();
  await expect(brand).toHaveCSS('outline-style', 'solid');
  await expect(brand).toHaveCSS('outline-width', '3px');

  await page.keyboard.press('Tab');
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveCSS('outline-style', 'solid');
  await expect(toggle).toHaveCSS('outline-width', '3px');
  await page.keyboard.press('Tab');
  await expect(page.locator('#main-navbar a:focus')).toHaveCount(0);

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#main-navbar')).toHaveClass(/show/);
  await expect(page.locator('#main-navbar')).not.toHaveClass(/collapsing/);
  await expect(homeLink).toBeVisible();
  await expect(homeLink).toHaveAccessibleName('Home');
  await expect(page.locator('#main-navbar a').nth(1)).toHaveAccessibleName('Find Owners');
  await expect(page.locator('#main-navbar a').nth(2)).toHaveAccessibleName('Veterinarians');
  await expect(page.locator('#main-navbar a').nth(3)).toHaveAccessibleName('Error');

  const results = await new AxeBuilder({ page })
    .include('nav.navbar')
    .withRules(['button-name', 'link-name'])
    .analyze();
  expect(results.violations).toEqual([]);

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#main-navbar')).not.toHaveClass(/show|collapsing/);
  await expect(homeLink).toBeHidden();

  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#main-navbar')).toHaveClass(/show/);
  await expect(page.locator('#main-navbar')).not.toHaveClass(/collapsing/);
  await expect(homeLink).toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('#main-navbar')).not.toHaveClass(/show|collapsing/);
});

test('desktop navigation remains available while its toggle is excluded from keyboard focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  const toggle = page.locator('.navbar-toggler');
  const homeLink = page.locator('#main-navbar a').filter({ hasText: 'Home' });
  await expect(toggle).toBeHidden();
  await expect(homeLink).toBeVisible();

  await page.keyboard.press('Tab');
  await expect(page.locator('.navbar-brand')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(homeLink).toBeFocused();
});

test('fresh German page load localizes both navigation control names', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?lang=de');

  await expect(page.locator('.navbar-brand')).toHaveAccessibleName('PetClinic-Startseite');
  await expect(page.getByRole('button', { name: 'Navigation umschalten' })).toHaveAttribute('aria-expanded', 'false');
});
