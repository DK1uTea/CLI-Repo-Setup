import { expect, test } from '@playwright/test';

import { LoginPage } from '../login/login.page';
import { authenticateViaApi } from '../../shared/session';
import { deniedCredentials, localizedRoute, permittedCredentials, QA_EVENT_FIXTURE_ID, TF_ROUTES, TAB_PARAMS } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

const PRIVATE_ROUTES = [
  '/reporting-tool',
  '/reporting-tool/select-event',
  '/reporting-tool/new-event',
  '/reporting-tool/update-event?id=probe',
  '/reporting-tool/new-survey',
  '/reporting-tool/update-survey?id=probe',
  '/reporting-tool/event-detail',
  '/reporting-tool/report',
  '/reporting-tool/lead',
  '/reporting-tool/recent-activity',
] as const;

test.describe('reporting-tool routing', () => {
  test('[TF-R-01] Redirects an unauthenticated visitor from every reporting-tool route to login.', async ({
    page,
  }) => {
    const login = new LoginPage(page);

    for (const route of PRIVATE_ROUTES) {
      await page.goto(localizedRoute(page, route));

      await expect(page).toHaveURL(/\/(?:de|en)\/login/);
      await expect(login.submit).toBeVisible();
    }
  });

  test('[TF-R-02] Redirects the workspace to select-event when eventId is absent.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoRoot();

    await expect(page).toHaveURL(/\/(?:de|en)\/reporting-tool\/select-event/);
    await expect(tf.selectEventHeading).toBeVisible();
  });

  test('[TF-R-03] Denies the module without ReportingTool Management and Manager permissions.', async ({
    page,
  }) => {
    const credentials = deniedCredentials();
    test.skip(!credentials, 'Missing a non-ReportingTool CAM account to test denial with.');
    await authenticateViaApi(page, credentials!);
    const tf = new ReportingToolPage(page);
    await tf.gotoRoot();

    await expect(tf.forbiddenHeading).toBeVisible();
  });

  test('[TF-R-04] Preserves eventId and the active tab in a deep-linked workspace URL.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    const firstEventHref = await tf.eventDetailLinks.first().getAttribute('href');
    test.skip(!firstEventHref, 'Permitted account has no visible event to deep-link into.');

    const eventId = new URL(firstEventHref!, 'http://localhost').searchParams.get('eventId');
    test.skip(!eventId, 'Could not read eventId from the first event card link.');

    await tf.gotoWorkspace(eventId!, TAB_PARAMS.leads);
    await expect(page).toHaveURL(new RegExp(`eventId=${eventId}.*tab=leads|tab=leads.*eventId=${eventId}`));
    await expect(tf.tab('leads')).toHaveAttribute('aria-selected', 'true');
  });

  test('[TF-R-05] Uses the first valid wizard step when the requested step is missing or invalid.', async ({
    page,
  }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await page.goto(`${localizedRoute(page, TF_ROUTES.newEvent)}?step=999`);

    await expect(tf.eventTitleInput).toBeVisible();
    await expect(tf.eventIdInput).toBeVisible();
    await expect(page).toHaveURL(/[?&]step=999/);
  });

  test('[TF-R-06] Blocks a direct event dashboard URL and does not request event stats for a denied user.', async ({ page }) => {
    const credentials = deniedCredentials();
    test.skip(!credentials, 'Missing a non-ReportingTool CAM account to test denial with.');
    const statsRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/tf/dashboard/stats')) statsRequests.push(request.url());
    });

    await authenticateViaApi(page, credentials!);
    const tf = new ReportingToolPage(page);
    await tf.gotoWorkspace(QA_EVENT_FIXTURE_ID);

    await expect(tf.forbiddenHeading).toBeVisible();
    await expect(tf.editEventLink).not.toBeVisible();
    await expect(tf.workspaceCreateEventLink).not.toBeVisible();
    expect(statsRequests).toHaveLength(0);
  });
});
