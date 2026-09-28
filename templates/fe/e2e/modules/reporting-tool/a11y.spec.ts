import { expect, test } from '@playwright/test';

import { scanA11y } from '../../shared/a11y';
import { authenticateViaApi } from '../../shared/session';
import { permittedCredentials, TAB_PARAMS } from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';

async function eventIdFromSelection(tf: ReportingToolPage) {
  await expect(tf.eventDetailLinks.first()).toBeVisible();
  const href = await tf.eventDetailLinks.first().getAttribute('href');
  return href ? new URL(href, 'http://localhost').searchParams.get('eventId') : null;
}

test.describe('reporting-tool accessibility', () => {
  test('[TF-A-01] Has no non-exempt axe violations on event selection and every workspace tab.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    expect((await scanA11y(page)).violations).toEqual([]);
    const eventId = await eventIdFromSelection(tf);
    test.skip(!eventId, 'The permitted account has no event fixture.');

    await tf.gotoWorkspace(eventId!);
    for (const name of Object.keys(TAB_PARAMS) as Array<keyof typeof TAB_PARAMS>) {
      await tf.openTab(name);
      expect((await scanA11y(page)).violations).toEqual([]);
    }
  });

  test('[TF-A-03] Gives every form control and icon-only action an accessible name.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();
    await expect(tf.eventSearchInput).toHaveAccessibleName(/.+/);
    for (const button of await page.getByRole('button').all()) {
      await expect(button).toHaveAccessibleName(/.+/);
    }
  });
});
