import { expect, test } from '@playwright/test';

test('регистрация, сделка и аудит переноса', async ({ page }) => {
  const stamp = Date.now();
  const email = `e2e-${stamp}@example.com`;
  const orgName = `Acme ${stamp}`;
  const contactName = `Контакт ${stamp}`;
  const dealTitle = `Сделка ${stamp}`;

  await page.goto('/register');
  await page.getByRole('textbox', { name: 'Имя' }).fill('E2E');
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Пароль' }).fill('password1');
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  await expect(page.getByRole('heading', { name: 'Организации' })).toBeVisible();

  await page.getByRole('textbox', { name: 'Название' }).fill(orgName);
  await page.getByRole('button', { name: 'Создать' }).click();
  await page.getByRole('link', { name: new RegExp(orgName) }).click({ noWaitAfter: true });
  await expect(page.getByText('Организация открыта.')).toBeVisible();

  await page.getByRole('link', { name: 'Контакты' }).click({ noWaitAfter: true });
  await expect(page.getByRole('heading', { name: 'Контакты' })).toBeVisible();
  await page.getByRole('textbox', { name: 'Имя' }).fill(contactName);
  await page.getByRole('button', { name: 'Добавить' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: contactName })).toBeVisible();

  await page.getByRole('link', { name: 'Сделки' }).click({ noWaitAfter: true });
  await expect(page.getByRole('heading', { name: 'Сделки' })).toBeVisible();
  await page.getByRole('button', { name: 'Новая сделка' }).click();
  await page.getByRole('textbox', { name: 'Название' }).fill(dealTitle);
  await page.getByRole('spinbutton', { name: 'Сумма, ₽' }).fill('1000');
  await page.getByRole('button', { name: 'Создать' }).click();
  await expect(page.getByRole('heading', { name: dealTitle })).toBeVisible();

  await page.getByRole('link', { name: 'Сделки' }).click({ noWaitAfter: true });
  await expect(page.getByRole('heading', { name: 'Сделки' })).toBeVisible();
  await page.reload();
  const card = page.locator('article', { hasText: dealTitle });
  const handle = card.getByRole('button', { name: 'Перетащить' });
  const column = page.locator('section').filter({
    has: page.getByRole('heading', { name: 'Переговоры' }),
  });
  const from = await handle.boundingBox();
  const to = await column.boundingBox();
  if (!from || !to) throw new Error('Доска не отрисовалась');

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + 80, { steps: 25 });
  await page.mouse.up();
  await page.reload();

  await expect(column.getByRole('link', { name: dealTitle })).toBeVisible();

  await page.getByRole('link', { name: 'Аудит' }).click({ noWaitAfter: true });
  await expect(page.getByRole('heading', { name: 'Аудит' })).toBeVisible();
  await expect(page.getByText('Смена стадии')).toBeVisible();
  await expect(page.getByText('Новая → Переговоры')).toBeVisible();
});
