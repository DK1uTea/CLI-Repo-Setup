import { expect, test } from '@playwright/test';

import { authHeaders, camCredentials, localizedCamPath, CAM_ROUTES } from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';
import { authenticateViaApi } from '../../shared/session';

async function openAdmin(page: import('@playwright/test').Page) {
  const credentials = camCredentials('admin');
  test.skip(!credentials, 'Missing Admin CAM credentials.');
  await authenticateViaApi(page, credentials!);
  const cam = new CustomerActivationPage(page);
  await cam.goto();
  return cam;
}

test('admin dashboard', async ({ page }) => {
  const cam = await openAdmin(page);
  const locale = cam.locale;
  const isEnglish = locale === 'en';

  await expect(cam.heading).toBeVisible();
  await expect(cam.adminTab(cam.copy.adminTabs[0])).toHaveAttribute('aria-selected', 'true');
  await expect(cam.newActivation).toHaveAttribute('href', /\/customer-activation\/new-activation/);

  const statsResponse = await page.request.get('/api/cam/activations-admin/stats', {
    headers: await authHeaders(page),
  });
  expect(statsResponse.ok()).toBeTruthy();
  const statsBody = await statsResponse.json();
  const stats = statsBody?.data ?? statsBody;
  const summary = isEnglish
    ? [['New Submissions', 'ready'], ['Under Review', 'review'], ['Needs Clarifications', 'clarification']]
    : [['Neue', 'ready'], ['In Prüfung', 'review'], ['Klärungsbedarf', 'clarification']];

  for (const [label, key] of summary) {
    const card = page.getByText(label, { exact: true }).locator('..');
    await expect(card).toContainText(String(stats?.[key] ?? 0));
    const urlBefore = page.url();
    await card.click();
    expect(page.url()).toBe(urlBefore);
  }

  const columns = isEnglish
    ? ['Cases', 'Owner', 'Brand Fit', 'Score', 'Status', 'Last Activity']
    : ['Fälle', 'Inhaber', 'Markenfit', 'Bewertung', 'Status', 'Letzte Aktivität'];
  for (const column of columns) {
    await expect(page.getByRole('columnheader', { name: column, exact: true })).toBeVisible();
  }

  const activations = await cam.adminActivations();
  if (activations.length > 0) {
    const item = activations[0];
    const row = page.getByRole('row').filter({ hasText: item.name }).first();
    await expect(row).toBeVisible();
    if (item.owner) await expect(row).toContainText(item.owner);
    await expect(row.getByRole('cell').nth(2)).not.toBeEmpty();
    await expect(row.getByRole('cell').nth(3)).toContainText(`${item.evaluation?.score ?? 0}/${item.evaluation?.maxScore ?? 27}`);
    await expect(row.getByRole('cell').nth(4)).not.toBeEmpty();
    await expect(row.getByRole('cell').nth(5)).toContainText(/\d{1,2}[./-]\d{1,2}[./-]\d{4}|—/);
  }

  await page.getByRole('combobox').first().click();
  const sortLabels = isEnglish
    ? ['Brand Fit: A–Z', 'Brand Fit: Z–A', 'Case Name: A–Z', 'Case Name: Z–A', 'Score: High to Low', 'Score: Low to High', 'Last activity: Nearest', 'Last activity: Latest']
    : ['Brand Fit: A–Z', 'Brand Fit: Z–A', 'Fallname: A–Z', 'Fallname: Z–A', 'Hoch-Niedrig', 'Niedrig-Hoch', 'Letzte Aktivität: Älteste', 'Letzte Aktivität: Späteste'];
  for (const label of sortLabels) await expect(page.getByRole('option', { name: label, exact: true })).toBeVisible();
  await page.keyboard.press('Escape');

  for (const tab of cam.copy.adminTabs.slice(1)) await cam.openAdminTab(tab);
  await cam.openAdminTab(cam.copy.adminTabs[0]);
  const perPage = page.getByRole('combobox', { name: isEnglish ? 'Items per page' : 'Einträge pro Seite' });
  if (await perPage.count()) {
    await perPage.click();
    for (const count of ['10', '20', '50', '100']) {
      await expect(page.getByRole('option', { name: new RegExp(`^${count} `) })).toBeVisible();
    }
    await page.keyboard.press('Escape');
  }

  await page.goto(localizedCamPath(page, CAM_ROUTES.main));
});
