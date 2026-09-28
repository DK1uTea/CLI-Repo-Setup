import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import { permittedCredentials, QA_EVENT_FIXTURE_ID, TAB_PARAMS } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

type LeadFixture = {
  id: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  email?: string;
  status: 'NEW' | 'EXISTED';
  createdAt: string;
  updatedAt?: string;
};

function leadPayload(body: any) {
  const payload = body?.data ?? body;
  return {
    items: Array.isArray(payload?.items) ? payload.items as LeadFixture[] : [],
    total: Number(payload?.pagination?.total ?? 0),
  };
}

async function waitForLeadRequest(page: import('@playwright/test').Page) {
  const response = await page.waitForResponse(
    (candidate) => candidate.url().includes('/api/tf/leads')
      && !candidate.url().includes('/export')
      && candidate.request().method() === 'GET',
  );
  return leadPayload(await response.json());
}

function leadName(lead: LeadFixture) {
  return lead.fullName ?? `${lead.firstName ?? ''} ${lead.lastName ?? ''}`.trim();
}

test('leads overview', async ({ page }) => {
  await authenticateViaApi(page, permittedCredentials());
  const tf = new ReportingToolPage(page);
  const initialRequest = waitForLeadRequest(page);
  await tf.gotoWorkspace(QA_EVENT_FIXTURE_ID, TAB_PARAMS.leads);
  await expect(tf.leadsSearchInput).toBeVisible();
  await expect(tf.exportButton).toBeVisible();
  const initial = await initialRequest;

  for (const label of Object.values(tf.copy.leads.table)) {
    await expect(page.getByRole('columnheader', { name: label })).toBeVisible();
  }

  if (!initial.items.length) {
    await expect(tf.leadsEmptyState).toBeVisible();
    await tf.leadsSearchInput.fill(`__missing_lead_${Date.now()}__`);
    await expect(tf.leadsEmptyState).toBeVisible();
    return;
  }

  const first = initial.items[0];
  const firstName = leadName(first);
  expect(firstName).toBeTruthy();
  await expect(tf.leadRows.first()).toContainText(firstName);
  await expect(tf.leadRows.first()).toContainText(first.company ?? '');
  await expect(tf.leadRows.first()).toContainText(tf.copy.leads.status[first.status]);
  await expect(tf.filterComboboxes.nth(0)).toContainText(tf.copy.leads.sort.newest);

  const searchRequest = waitForLeadRequest(page);
  await tf.leadsSearchInput.fill(firstName);
  const searched = await searchRequest;
  expect(searched.items.map((lead) => lead.id)).toContain(first.id);
  await expect(tf.leadRows.first()).toContainText(firstName);
  await tf.leadsSearchInput.fill('');
  await expect(page).not.toHaveURL(/keyword=.+/);

  const statuses = [...new Set(initial.items.map((lead) => lead.status))];
  for (const status of statuses) {
    const statusRequest = waitForLeadRequest(page);
    await tf.filterComboboxes.nth(1).click();
    for (const option of ['all', 'NEW', 'EXISTED'] as const) {
      await expect(page.getByRole('option', { name: tf.copy.leads.status[option], exact: true })).toBeVisible();
    }
    await page.getByRole('option', { name: tf.copy.leads.status[status], exact: true }).click();
    const filtered = await statusRequest;
    expect(filtered.items.every((lead) => lead.status === status)).toBeTruthy();
  }

  await tf.filterComboboxes.nth(1).click();
  await page.getByRole('option', { name: tf.copy.leads.status.all, exact: true }).click();
  await expect(tf.filterComboboxes.nth(1)).toContainText(tf.copy.leads.status.all);
  await expect(tf.leadRows.first()).toBeVisible();

  const sortOptions = [
    ['oldest', 'updatedAt:asc'],
    ['companyAsc', 'company:asc'],
    ['companyDesc', 'company:desc'],
    ['nameAsc', 'fullName:asc'],
    ['nameDesc', 'fullName:desc'],
  ] as const;
  for (const [labelKey, sortValue] of sortOptions) {
    const sortRequest = waitForLeadRequest(page);
    await tf.filterComboboxes.nth(0).click();
    await page.getByRole('option', { name: tf.copy.leads.sort[labelKey], exact: true }).click();
    const sorted = await sortRequest;
    await expect(tf.filterComboboxes.nth(0)).toContainText(tf.copy.leads.sort[labelKey]);
    if (sorted.items.length > 1 && !sortValue.startsWith('updatedAt')) {
      const firstSortedValue = sortValue.startsWith('company')
        ? sorted.items[0].company ?? ''
        : leadName(sorted.items[0]);
      await expect(tf.leadRows.first()).toContainText(firstSortedValue);
    } else if (sorted.items.length > 1) {
      const values = sorted.items.map((lead) => {
        if (sortValue.startsWith('updatedAt')) return Date.parse(lead.updatedAt ?? lead.createdAt);
        return leadName(lead).toLocaleLowerCase();
      });
      const expected = [...values].sort((left, right) => (
        sortValue.endsWith(':asc') ? (left < right ? -1 : left > right ? 1 : 0) : (left < right ? 1 : left > right ? -1 : 0)
      ));
      expect(values).toEqual(expected);
    }
  }

  if (initial.total > 5) {
    await expect(tf.pagination).toBeVisible();
    await tf.pagination.getByRole('button', { name: /next|weiter/i }).click();
    await expect(page).toHaveURL(/page=2/);
    await tf.pagination.getByRole('button', { name: /previous|zurück/i }).click();
    await expect(page).toHaveURL(/(?:page=1|tab=leads)/);
  }

  const download = await Promise.all([
    page.waitForEvent('download'),
    tf.exportButton.click(),
  ]);
  expect(download[0].suggestedFilename()).toMatch(/\.(xlsx|xls|csv)$/i);

  const detailLink = tf.leadDetailLinks.first();
  const detailId = new URL(await detailLink.getAttribute('href') ?? '', 'http://localhost').searchParams.get('id');
  expect(detailId).toBeTruthy();
  await detailLink.click();
  await expect(page).toHaveURL(new RegExp(`/reporting-tool/lead\\?id=${detailId}.*eventId=${QA_EVENT_FIXTURE_ID}`));
});
