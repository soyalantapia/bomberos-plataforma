import { expect, test } from '@playwright/test';

test('home renderiza el placeholder de Faro', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Faro' })).toBeVisible();
});
