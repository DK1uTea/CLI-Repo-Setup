import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { camCredentials, destructiveFixtureReason, mutationFixturesEnabled } from './customer-activation.data';
import { CustomerActivationPage } from './customer-activation.page';
import { counterCard, createCounterActivation, openCounterBoard } from './intake-board-counters.data';

function skipCounterMutation() {
  test.skip(!mutationFixturesEnabled(), destructiveFixtureReason);
  const credentials = camCredentials('sale');
  test.skip(!credentials, 'Missing Sale CAM credentials.');
  return credentials!;
}

test.describe('Intake Board counters', () => {
  test('refreshes the file counter without a page reload after adding detail media', async ({ page }) => {
    const credentials = skipCounterMutation();
    await authenticateViaApi(page, credentials);

    const cam = new CustomerActivationPage(page);
    const activation = await createCounterActivation(page);
    await openCounterBoard(page);

    const card = counterCard(page, activation.name);
    await expect(card).toBeVisible();
    const fileCount = Number(await card.getByTestId('cam-intake-file-count').textContent());

    await card.getByRole('button', { name: activation.name, exact: true }).click();
    await expect(cam.detailTab(cam.copy.detailTabs.overview)).toBeVisible();
    await page.getByRole('button', { name: /^Add$|^Hinzufügen$/i }).click();

    const attachmentDialog = page.getByRole('dialog').last();
    await attachmentDialog.locator('input[type="file"]').setInputFiles('public/images/logo.png');
    const fileMutation = page.waitForResponse(
      (response) => response.url().includes('/api/cam/activations/') && response.url().endsWith('/media') && response.request().method() === 'PATCH',
    );
    const groupedAfterFile = page.waitForResponse((response) => response.url().includes('/api/cam/activations/grouped'));
    await attachmentDialog.getByRole('button', { name: /^Save$|^Speichern$/i }).click();

    expect((await fileMutation).ok()).toBeTruthy();
    expect((await groupedAfterFile).ok()).toBeTruthy();
    await expect(card.getByTestId('cam-intake-file-count')).toHaveText(String(fileCount + 1));
  });

  test('refreshes the chat counter without a page reload after adding a detail comment', async ({ page }) => {
    const credentials = skipCounterMutation();
    await authenticateViaApi(page, credentials);

    const cam = new CustomerActivationPage(page);
    const activation = await createCounterActivation(page);
    await openCounterBoard(page);

    const card = counterCard(page, activation.name);
    await expect(card).toBeVisible();
    const chatCount = Number(await card.getByTestId('cam-intake-chat-count').textContent());

    await card.getByRole('button', { name: activation.name, exact: true }).click();
    const communicationTab = cam.detailTab(cam.copy.detailTabs.communication);
    await expect(communicationTab).toBeVisible();
    await communicationTab.click();
    await cam.chatComposerTrigger.click();
    const message = `E2E counter ${Date.now()}`;
    await page.locator('[contenteditable="true"]').first().fill(message);
    const groupedAfterChat = page.waitForResponse((response) => response.url().includes('/api/cam/activations/grouped'));
    await page.getByRole('button', { name: /^Save$|^Speichern$/i }).click();

    await expect(page.locator('[data-msg-id]').filter({ hasText: message })).toBeVisible();
    expect((await groupedAfterChat).ok()).toBeTruthy();
    await expect(card.getByTestId('cam-intake-chat-count')).toHaveText(String(chatCount + 1));
  });
});
