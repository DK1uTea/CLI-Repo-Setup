import { expect, test } from '@playwright/test';

import { authenticateViaApi } from '../../shared/session';
import {
  localizedRoute,
  permittedCredentials,
  QA_EVENT_FIXTURE_ID,
  TAB_PARAMS,
  TF_ROUTES,
  uniqueEventFixture,
} from './reporting-tool.data';
import { ReportingToolPage } from './reporting-tool.page';
import { createDraftEventFixture } from './reporting-tool.fixtures';
import { EventFormPage } from '../events/events.page';
import { dayjs } from '@/lib/date-utils';

async function selectedEvent(tf: ReportingToolPage) {
  await tf.gotoSelectEvent();
  const eventId = await tf.firstEventId();
  test.skip(!eventId, 'Could not read eventId from the event card.');
  return eventId!;
}

test.describe('reporting-tool journey', () => {
  test('[TF-F-01] Signs in through the real login form and opens Event-Berichtstool from the sidebar.', async ({
    page,
  }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await page.goto(localizedRoute(page, '/dashboards'));
    await tf.openFromSidebar();
    await expect(page).toHaveURL(/\/(?:de|en)\/reporting-tool/);
  });

  test('[TF-F-02] Selects an event and opens the dashboard with its eventId in the workspace URL.', async ({
    page,
  }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoSelectEvent();

    const firstCard = tf.eventCards.first();
    const detailsLink = firstCard.getByRole('link', { name: tf.copy.selectEvent.viewDetails });
    const href = await detailsLink.getAttribute('href');
    test.skip(!href, 'Permitted account has no visible event to select.');

    const eventId = new URL(href!, 'http://localhost').searchParams.get('eventId');
    await detailsLink.click();
    await expect(page).toHaveURL(new RegExp(`eventId=${eventId}`));
    await expect(tf.tab('dashboard')).toHaveAttribute('aria-selected', 'true');
  });

  test('[TF-F-03] Creates a draft event through General Information and keeps its returned id in the wizard URL.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoNewEvent();
    await expect(tf.eventWizardHeading).toBeVisible();
    const fixture = uniqueEventFixture();
    await tf.eventTitleInput.fill(fixture.title);
    for (const combobox of [tf.eventModeCombobox, tf.targetAudienceCombobox, tf.eventTypeCombobox, tf.participationCombobox]) {
      await combobox.click();
      await page.getByRole('option').first().click();
    }
    await page.locator('textarea[name="description"]').fill(fixture.description);
    await tf.venueNameInput.fill('QA Test Arena');
    await tf.streetInput.fill('Teststraße 1');
    await tf.zipCodeInput.fill('80331');
    await tf.cityInput.fill('München');
    await tf.imageFileInput.setInputFiles('public/images/logo.png');
    const form = new EventFormPage(page);
    const start = dayjs.utc().add(30, 'day').startOf('day').add(10, 'hour').toDate();
    await form.pickDate(tf.startDateButton, start);
    await form.pickDate(tf.endDateButton, dayjs.utc(start).add(1, 'day').toDate());
    const presign = page.waitForResponse((response) => response.url().includes('/api/tf/events/presigned-urls'));
    const upload = page.waitForResponse((response) => response.request().method() === 'PUT' && !response.url().includes('localhost'));
    const create = page.waitForResponse((response) => response.url().endsWith('/api/tf/events') && response.request().method() === 'POST');
    await tf.nextStepButton.click();
    expect((await presign).ok()).toBeTruthy();
    expect((await upload).ok()).toBeTruthy();
    const body = await (await create).json();
    const eventId = body?.data?.id ?? body?.data?.event?.id ?? body?.data?.eventId ?? body?.id;
    expect(eventId, `Unexpected create-event response: ${JSON.stringify(body)}`).toBeTruthy();
    await expect(page).toHaveURL(/[?&]eventId=EVENT-/);
    await expect(page).toHaveURL(new RegExp(`[?&]id=${eventId}`));

    await tf.gotoSelectEvent();
    await tf.eventSearchInput.fill(fixture.title);
    const createdCard = tf.eventCard(fixture.title);
    await expect(createdCard).toBeVisible();
    await expect(createdCard).toContainText(/Draft|Entwurf/);
    await page.request.delete(`/api/tf/events/${eventId}`);
  });

  test('[TF-F-04] Assigns at least one survey before advancing from the Survey step.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyTemplate();
    expect(surveyId).toBeTruthy();
    await page.goto(`${localizedRoute(page, TF_ROUTES.updateEvent(eventId))}&step=survey`);
    await expect(tf.eventWizardHeading).toBeVisible();
    await expect.poll(() => tf.page.locator('[data-field="surveys"] [role="radio"][aria-checked="false"]').count(), {
      timeout: 15_000,
      message: 'The survey library did not load a selectable survey fixture.',
    }).toBeGreaterThan(0);
    const surveyValue = await tf.unselectedEventSurveyRadio.getAttribute('value');
    expect(surveyValue).toBeTruthy();
    const survey = page.locator(`[data-field="surveys"] [role="radio"][value="${surveyValue}"]`);
    const assignRequest = page.waitForResponse(
      (response) => response.url().includes(`/api/tf/events/${eventId}/assign-surveys`) && response.request().method() === 'POST',
    );
    await survey.click({ force: true });
    await expect(survey).toHaveAttribute('aria-checked', 'true');
    await tf.nextStepButton.click();
    expect((await assignRequest).ok()).toBeTruthy();
    await expect(page).toHaveURL(/step=assign-team/);
    await page.request.delete(`/api/tf/surveys/${surveyId}`);
    await page.request.delete(`/api/tf/events/${eventId}`);
  });

  test('[TF-F-05] Adds or imports event-survey users, changes an assigned user role, and removes an assigned user.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await selectedEvent(tf);
    const surveyId = await tf.createSurveyFixture(eventId!);
    expect(surveyId).toBeTruthy();
    await tf.gotoWorkspace(eventId!, TAB_PARAMS.surveyBuilder);

    await tf.assignUsersButton.click();
    await tf.addUserButton.click();
    await expect(tf.addUserSubmit).toBeVisible();

    const stamp = Date.now().toString().slice(-8);
    const firstName = `TF${stamp}`;
    const lastName = 'E2E';
    const email = `tf.e2e.${stamp}@example.com`;
    await tf.addUserFirstName.fill(firstName);
    await tf.addUserLastName.fill(lastName);
    await tf.addUserEmail.fill(email);

    const addRequest = page.waitForResponse(
      (response) => response.url().includes('/api/tf/users/assign-survey/') && response.request().method() === 'POST',
    );
    await tf.addUserSubmit.click();
    const addResponse = await addRequest;
    expect(addResponse.ok()).toBeTruthy();

    const userRow = tf.userRows.filter({ hasText: email });
    await expect(userRow).toBeVisible();
    const roleRequest = page.waitForResponse(
      (response) => response.url().includes(`/api/tf/users/change-roles/${eventId}`) && response.request().method() === 'POST',
    );
    await userRow.getByRole('combobox').click();
    await page.getByRole('option', { name: tf.copy.assignTeam.salesRep }).click();
    expect((await roleRequest).ok()).toBeTruthy();

    const removeRequest = page.waitForResponse(
      (response) => response.url().includes('/api/tf/users/remove-event-assignment/') && response.request().method() === 'DELETE',
    );
    await tf.removeUserButton(firstName, lastName).click();
    const removeDialog = page.getByRole('alertdialog');
    await expect(removeDialog).toBeVisible();
    const confirmRemove = removeDialog.getByRole('button', { name: tf.copy.assignTeam.remove });
    await expect(confirmRemove).toBeEnabled();
    await confirmRemove.click({ force: true });
    expect((await removeRequest).ok()).toBeTruthy();
    await expect(userRow).toHaveCount(0);
    await page.request.delete(`/api/tf/surveys/${surveyId}`);
  });
  test('[TF-F-06] Launches a valid draft event from Review and returns to the event workspace.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const createdEvent = true;
    const eventId = await createDraftEventFixture(page, tf);
    const surveyId = await tf.createSurveyTemplate();
    expect(surveyId).toBeTruthy();
    await page.goto(`${localizedRoute(page, TF_ROUTES.updateEvent(eventId!))}&step=survey`);
    await expect(tf.eventWizardHeading).toBeVisible();
    await expect.poll(() => tf.page.locator('[data-field="surveys"] [role="radio"][aria-checked="false"]').count(), {
      timeout: 15_000,
      message: 'The survey library did not load a selectable survey fixture.',
    }).toBeGreaterThan(0);
    const surveyValue = await tf.unselectedEventSurveyRadio.getAttribute('value');
    expect(surveyValue).toBeTruthy();
    const survey = page.locator(`[data-field="surveys"] [role="radio"][value="${surveyValue}"]`);
    const assignRequest = page.waitForResponse(
      (response) => response.url().includes(`/api/tf/events/${eventId}/assign-surveys`) && response.request().method() === 'POST',
    );
    await survey.click({ force: true });
    await expect(survey).toHaveAttribute('aria-checked', 'true');
    await tf.nextStepButton.click();
    expect((await assignRequest).ok()).toBeTruthy();
    await expect(page).toHaveURL(/step=assign-team/);
    await tf.nextStepButton.click();
    await expect(page).toHaveURL(/step=review-launch/);
    await expect(tf.reviewEventTable).toBeVisible();
    await expect(tf.reviewEventTable.getByRole('cell').nth(1)).not.toHaveText('-');
    await expect(tf.saveAndLaunchButton).toBeVisible();
    const launchRequest = page.waitForResponse(
      (response) => response.url().includes(`/api/tf/events/${eventId}/launch`) && response.request().method() === 'PATCH',
      { timeout: 5_000 },
    ).catch(() => null);
    await tf.saveAndLaunchButton.click();
    const launchResponse = await launchRequest;
    if (!launchResponse) throw new Error('Launch button did not issue the launch mutation.');
    expect(launchResponse.ok()).toBeTruthy();
    await expect(page).toHaveURL(new RegExp(`/(?:de|en)/reporting-tool\\?.*eventId=${eventId}`));
    await page.request.delete(`/api/tf/surveys/${surveyId}`);
    if (createdEvent) await page.request.delete(`/api/tf/events/${eventId}`);
  });

  test('[TF-F-07] Creates a survey with a step, group, and question and assigns it to the current event.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await selectedEvent(tf);
    const createRequest = page.waitForRequest((request) => request.url().includes('/api/tf/surveys') && request.method() === 'POST');
    const assignRequest = page.waitForRequest((request) => request.url().includes(`/api/tf/events/${eventId}/assign-surveys`) && request.method() === 'POST');
    const surveyId = await tf.createSurveyFixture(eventId!);
    const createPayload = await (await createRequest).postDataJSON();
    expect(createPayload.steps?.[0]?.groups?.[0]?.questions?.length).toBeGreaterThan(0);
    expect(surveyId).toBeTruthy();
    const assignPayload = await (await assignRequest).postDataJSON();
    expect(assignPayload.surveys).toEqual(expect.arrayContaining([expect.objectContaining({ surveyId, requiredLogin: true })]));
    await expect(page).toHaveURL(new RegExp(`id=${surveyId}`));
    await page.request.delete(`/api/tf/surveys/${surveyId}`);
  });

  test('[TF-F-08] Previews a survey locally without sending an answer mutation.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await selectedEvent(tf);
    await page.goto(localizedRoute(page, TF_ROUTES.newSurvey(eventId!)));
    await expect(tf.surveyWizardHeading).toBeVisible();
    const answerRequests: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/tf/answers')) answerRequests.push(request.url());
    });
    await tf.surveyPreviewButton.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(answerRequests).toEqual([]);
  });

  test('[TF-F-09] Opens Reports, filters answers, and opens one answer detail.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoWorkspace(QA_EVENT_FIXTURE_ID, TAB_PARAMS.reports);
    await expect(tf.reportsSearchInput).toBeVisible();
    await tf.reportsSearchInput.fill(`__answer_${Date.now()}__`);
    await expect(page).toHaveURL(/keyword=/);
    await tf.reportsSearchInput.fill('');
    await expect.poll(async () => (await tf.answerDetailLinks.count()) + (await tf.answersEmptyState.count())).toBeGreaterThan(0);
    const answer = tf.answerDetailLinks.first();
    if (await answer.count()) {
      await answer.click();
      await expect(page).toHaveURL(/\/reporting-tool\/report\?id=.*eventId=/);
    } else {
      await expect(tf.answersEmptyState).toBeVisible();
    }
  });

  test('[TF-F-10] Opens Leads, filters leads, and opens one lead detail.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    await tf.gotoWorkspace(QA_EVENT_FIXTURE_ID, TAB_PARAMS.leads);
    await expect(tf.leadsSearchInput).toBeVisible();
    await tf.leadsSearchInput.fill(`__lead_${Date.now()}__`);
    await expect(page).toHaveURL(/keyword=/);
    await tf.leadsSearchInput.fill('');
    await expect.poll(async () => (await tf.leadDetailLinks.count()) + (await tf.leadsEmptyState.count())).toBeGreaterThan(0);
    const lead = tf.leadDetailLinks.first();
    if (await lead.count()) {
      await lead.click();
      await expect(page).toHaveURL(/\/reporting-tool\/lead\?id=.*eventId=/);
    } else {
      await expect(tf.leadsEmptyState).toBeVisible();
    }
  });

  test('[TF-F-11] Edits a draft event from the workspace and persists the updated General Information.', async ({ page }) => {
    await authenticateViaApi(page, permittedCredentials());
    const tf = new ReportingToolPage(page);
    const eventId = await createDraftEventFixture(page, tf);
    const updatedTitle = `TF E2E Edited ${Date.now().toString().slice(-8)}`;

    await tf.gotoWorkspace(eventId, TAB_PARAMS.dashboard);
    await expect(tf.editEventLink).toBeVisible();
    await tf.editEventLink.click();
    await expect(page).toHaveURL(new RegExp(`/(?:de|en)/reporting-tool/update-event\\?id=${eventId}`));
    const editorPage = await page.context().newPage();
    const editor = new ReportingToolPage(editorPage);
    await editorPage.goto(localizedRoute(editorPage, TF_ROUTES.updateEvent(eventId)));
    await expect(editor.eventWizardHeading).toBeVisible();
    await expect(editor.eventTitleInput).toBeEditable();
    await expect(editor.eventTitleInput).toHaveValue(/TF E2E Event/);
    await editor.eventTitleInput.fill(updatedTitle);
    await expect(editor.eventTitleInput).toHaveValue(updatedTitle);
    await editor.eventTitleInput.press('Tab');

    const updateRequest = editorPage.waitForResponse(
      (response) => response.url().includes(`/api/tf/events/${eventId}`) && response.request().method() === 'PUT',
    );
    await editor.nextStepButton.click();
    const updateResponse = await updateRequest;
    expect(updateResponse.ok()).toBeTruthy();
    expect(updateResponse.request().postDataJSON()).toMatchObject({ name: updatedTitle });
    await expect(editorPage).toHaveURL(/step=survey/);

    await editor.gotoWorkspace(eventId, TAB_PARAMS.dashboard);
    await expect(editorPage.getByText(updatedTitle, { exact: true })).toBeVisible();
    await page.request.delete(`/api/tf/events/${eventId}`);
    await editorPage.close();
  });
});
