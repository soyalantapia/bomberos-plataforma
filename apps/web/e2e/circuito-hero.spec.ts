import { expect, test } from '@playwright/test';

/**
 * Circuito hero: "De la calle al subsidio".
 * Cubre el demo navegable: Login OTP demo → Selector perfil → Dashboard Mando
 * → Cómputo → Rendición. El registro de servicio se cubre como flujo separado.
 */

test.describe('Circuito hero', () => {
  test('Login demo + Selector + Dashboard + Cómputo + Rendición', async ({ page }) => {
    // Login OTP demo
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Faro' })).toBeVisible();
    await page.locator('#legajo').fill('0017');
    await page.getByRole('button', { name: /Enviar código/i }).click();

    await expect(page.getByRole('heading', { name: 'Tu código' })).toBeVisible();
    await page.locator('#codigo').fill('000000');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Selector
    await expect(page.getByRole('heading', { name: /¿Cómo querés entrar?/ })).toBeVisible();
    await page.getByRole('button', { name: /^Entrar/i }).click();

    // Dashboard mando
    await expect(page.getByRole('heading', { name: 'Dashboard del cuartel' })).toBeVisible();
    await expect(page.getByText('Villa Ballester', { exact: false })).toBeVisible();
    await expect(page.getByText('Rendición al Fondo')).toBeVisible();

    // Cómputo
    await page.goto('/mando/computo');
    await expect(page.getByRole('heading', { name: 'Cómputo mensual' })).toBeVisible();
    await expect(page.getByText('Cómputo instantáneo')).toBeVisible();
    await expect(page.getByText('GIB: 26 segundos')).toBeVisible();

    // Rendición
    await page.goto('/mando/rendicion');
    await expect(page.getByRole('heading', { name: 'Rendición al Fondo' })).toBeVisible();
    await expect(page.getByText('Requisitos del Fondo')).toBeVisible();
    await expect(page.getByRole('button', { name: /Copiloto IA/ })).toBeVisible();
  });

  test('Registro de servicio: IA propone y persona confirma', async ({ page }) => {
    // Login y entrada como mando
    await page.goto('/login');
    await page.locator('#legajo').fill('0017');
    await page.getByRole('button', { name: /Enviar código/i }).click();
    await page.locator('#codigo').fill('000000');
    await page.getByRole('button', { name: /Entrar/i }).click();
    await page.getByRole('button', { name: /^Entrar/i }).click();

    // Ir a Registrar servicio (perfil bombero)
    await page.goto('/bombero/registrar-servicio');
    await expect(page.getByRole('heading', { name: 'Registrar servicio' })).toBeVisible();
    await expect(page.getByText(/Cargar por voz/)).toBeVisible();

    // Probar IA
    await page.getByRole('button', { name: /Probar con IA/ }).click();

    // La IA propone — banner visible en step ubicación
    await expect(page.getByText(/La IA propuso una versión/)).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/Confianza/)).toBeVisible();
  });

  test('Tablero Federación muestra cuatro cuarteles con semáforo', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#legajo').fill('0017');
    await page.getByRole('button', { name: /Enviar código/i }).click();
    await page.locator('#codigo').fill('000000');
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Atajo "Entrar como Federación"
    await page.getByRole('button', { name: /Entrar como Federación/ }).click();
    await expect(page.getByRole('heading', { name: 'Tablero Federación' })).toBeVisible();

    // Los 4 cuarteles del semáforo
    await expect(page.getByText('Villa Ballester')).toBeVisible();
    await expect(page.getByText('San Martín')).toBeVisible();
    await expect(page.getByText('San Isidro')).toBeVisible();
    await expect(page.getByText('Tigre')).toBeVisible();
  });
});
