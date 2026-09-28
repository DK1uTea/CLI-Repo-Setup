import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { localizedRoute, permittedCredentials, QA_EVENT_FIXTURE_ID, TAB_PARAMS, TF_ROUTES } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

type AnswerFixture = {
  id: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  updatedAt?: string;
  lead?: { fullName?: string; firstName?: string; lastName?: string };
  survey?: { name?: string };
};

function answerPayload(body: any) {
  const payload = body?.data ?? body;
  return {
    items: Array.isArray(payload?.items) ? payload.items as AnswerFixture[] : [],
    total: Number(payload?.pagination?.total ?? 0),
  };
}

async function waitForAnswerRequest(page: import('@playwright/test').Page) {
  const response = await page.waitForResponse(
    (candidate) => candidate.url().includes('/api/tf/answers')
      && !candidate.url().includes('/export')
      && candidate.request().method() === 'GET',
  );
  return answerPayload(await response.json());
}

test('answers overview', async ({ page }) => {
  await authenticateViaApi(page, permittedCredentials());
  const tf = new ReportingToolPage(page);
  const initialRequest = waitForAnswerRequest(page);
  await tf.gotoWorkspace(QA_EVENT_FIXTURE_ID, TAB_PARAMS.reports);
  await expect(tf.reportsSearchInput).toBeVisible();
  await expect(tf.exportButton).toBeVisible();
  const initial = await initialRequest;

  for (const label of Object.values(tf.copy.reports.table)) {
    await expect(page.getByRole('columnheader', { name: label })).toBeVisible();
  }

  if (!initial.items.length) {
    await expect(tf.answersEmptyState).toBeVisible();
    await tf.reportsSearchInput.fill(`__missing_answer_${Date.now()}__`);
    await expect(tf.answersEmptyState).toBeVisible();
    return;
  }

  const first = initial.items[0];
  const firstLead = first.lead?.fullName
    ?? `${first.lead?.firstName ?? ''} ${first.lead?.lastName ?? ''}`.trim();
  expect(firstLead).toBeTruthy();
  await expect(tf.answerRows.first()).toContainText(firstLead);
  await expect(tf.answerRows.first()).toContainText(tf.copy.reports.status[first.status]);
  await expect(tf.filterComboboxes.nth(0)).toContainText(tf.copy.reports.sort.newest);

  if (initial.total > 5) {
    await expect(tf.pagination).toBeVisible();
    await tf.pagination.getByRole('button', { name: /next|weiter/i }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(tf.pagination.getByRole('button', { name: /previous|zurück/i })).toBeEnabled();
    await tf.pagination.getByRole('button', { name: /previous|zurück/i }).click();
    await expect(page).toHaveURL(/(?:page=1|tab=reports)/);
  }

  const exactSearch = waitForAnswerRequest(page);
  await tf.reportsSearchInput.fill(firstLead);
  const searched = await exactSearch;
  expect(searched.items.map((answer) => answer.id)).toContain(first.id);
  await expect(tf.answerRows.first()).toContainText(firstLead);

  await tf.reportsSearchInput.fill('');
  await expect(page).not.toHaveURL(/keyword=.+/);

  const statuses = [...new Set(initial.items.map((answer) => answer.status))];
  for (const status of statuses) {
    const statusRequest = waitForAnswerRequest(page);
    await tf.filterComboboxes.nth(1).click();
    for (const option of ['all', 'DRAFT', 'IN_PROGRESS', 'COMPLETED'] as const) {
      await expect(page.getByRole('option', { name: tf.copy.reports.status[option], exact: true })).toBeVisible();
    }
    await page.getByRole('option', { name: tf.copy.reports.status[status], exact: true }).click();
    const filtered = await statusRequest;
    expect(filtered.items.every((answer) => answer.status === status)).toBeTruthy();
    await expect(tf.filterComboboxes.nth(1)).toContainText(tf.copy.reports.status[status]);
  }

  await tf.filterComboboxes.nth(1).click();
  await page.getByRole('option', { name: tf.copy.reports.status.all, exact: true }).click();
  await expect(tf.filterComboboxes.nth(1)).toContainText(tf.copy.reports.status.all);
  await expect(tf.answerRows.first()).toBeVisible();

  const sortRequest = waitForAnswerRequest(page);
  await tf.filterComboboxes.nth(0).click();
  await page.getByRole('option', { name: tf.copy.reports.sort.oldest, exact: true }).click();
  const sorted = await sortRequest;
  expect(sorted.items.length).toBeGreaterThan(0);
  const sortedDates = sorted.items.map((answer) => Date.parse(answer.updatedAt ?? answer.createdAt));
  expect(sortedDates).toEqual([...sortedDates].sort((left, right) => left - right));
  await expect(tf.filterComboboxes.nth(0)).toContainText(tf.copy.reports.sort.oldest);

  const download = await Promise.all([
    page.waitForEvent('download'),
    tf.exportButton.click(),
  ]);
  expect(download[0].suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/i);

  await expect(tf.answerEditLinks.first()).toBeVisible();
  const detailLink = tf.answerDetailLinks.first();
  const detailId = new URL(await detailLink.getAttribute('href') ?? '', 'http://localhost').searchParams.get('id');
  expect(detailId).toBeTruthy();
  await detailLink.click();
  await expect(page).toHaveURL(new RegExp(`/reporting-tool/report\\?id=${detailId}.*eventId=${QA_EVENT_FIXTURE_ID}`));
  await page.goto(localizedRoute(page, TF_ROUTES.workspace(QA_EVENT_FIXTURE_ID, TAB_PARAMS.reports)));
});
