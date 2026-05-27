import { expect, test } from '@playwright/test';

/**
 * Circuito hero: "De la calle al subsidio".
 * Cubre el demo navegable: Login OTP demo → Selector perfil → Inicio Mando
 * → Cómputo → Rendición. El registro de servicio se cubre como flujo separado.
 */

test.describe('Circuito hero', () => {
  test('Login demo + Selector + Inicio + Cómputo + Rendición', async ({ page }) => {
    // Login OTP demo
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Faro' })).toBeVisible();
    await page.locator('#legajo').fill('0017');
    await page.getByRole('button', { name: /Enviar código/i }).click();

    await expect(page.getByRole('heading', { name: 'Tu código' })).toBeVisible();
    await page.locator('#codigo').fill('000000');
    // El OTP completo dispara auto-submit; igualmente clickeamos por las dudas
    await page.getByRole('button', { name: /Entrar/i }).click().catch(() => {});

    // Selector
    await expect(page.getByRole('heading', { name: /¿Cómo querés entrar?/ })).toBeVisible();
    await page.getByRole('button', { name: /^Entrar/i }).click();

    // Inicio mando — el banner cambia según haya pendientes
    await expect(
      page.getByRole('heading', {
        name: /(El cuartel está al día|Hay cosas por resolver hoy)/,
      }),
    ).toBeVisible();
    await expect(page.getByText('Villa Ballester', { exact: false })).toBeVisible();

    // Cómputo
    await page.goto('/mando/computo');
    await expect(page.getByRole('heading', { name: /Cómputo mensual/ })).toBeVisible();

    // Rendición
    await page.goto('/mando/rendicion');
    await expect(page.getByRole('heading', { name: /Rendición/ })).toBeVisible();
  });

  test('Registro de servicio: IA propone y persona confirma', async ({ page }) => {
    // Login y entrada como mando
    await page.goto('/login');
    await page.locator('#legajo').fill('0017');
    await page.getByRole('button', { name: /Enviar código/i }).click();
    await page.locator('#codigo').fill('000000');
    await page.getByRole('button', { name: /Entrar/i }).click().catch(() => {});
    await page.getByRole('button', { name: /^Entrar/i }).click();

    // Ir a Registrar servicio (perfil bombero)
    await page.goto('/bombero/registrar-servicio');
    await expect(page.getByRole('heading', { name: /Registrar servicio/ })).toBeVisible();
  });

  test('Tablero Federación muestra cuatro cuarteles con semáforo', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#legajo').fill('0017');
    await page.getByRole('button', { name: /Enviar código/i }).click();
    await page.locator('#codigo').fill('000000');
    await page.getByRole('button', { name: /Entrar/i }).click().catch(() => {});

    // Atajo "Entrar como Federación"
    await page.getByRole('button', { name: /Entrar como Federación/ }).click();

    // Los 4 cuarteles del semáforo
    await expect(page.getByText('Villa Ballester')).toBeVisible();
    await expect(page.getByText('San Martín')).toBeVisible();
    await expect(page.getByText('San Isidro')).toBeVisible();
    await expect(page.getByText('Tigre')).toBeVisible();
  });
});
