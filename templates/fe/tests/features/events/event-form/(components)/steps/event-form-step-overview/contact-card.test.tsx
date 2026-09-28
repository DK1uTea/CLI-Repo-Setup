import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import { ContactCard } from '@/features/events/event-form/(components)/steps/event-form-step-overview/contact-card';
import type { EventFormDto } from '@/features/events/event-form/(helpers)/event-form-schema';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const labels: Record<string, string> = {
      'overview.contactName': 'Kontaktname',
      'overview.contactRole': 'Rolle',
      'overview.email': 'E-Mail',
      'overview.phone': 'Telefon',
      'overview.addMoreContacts': 'Weitere Kontakte hinzufügen',
      'overview.contactRoleOptions.ADMIN': 'Admin',
      'overview.contactRoleOptions.ORGANIZER': 'Organisator',
      'overview.contactRoleOptions.CATERING': 'Catering',
      'overview.contactRoleOptions.MANAGEMENT': 'Management',
      'overview.contactRoleOptions.ELECTRICIAN': 'Elektriker',
      'overview.contactRoleOptions.TECHNICIAN': 'Techniker',
      'overview.contactRoleOptions.SERVICE_LEAD': 'Serviceleitung',
    };
    return labels[key] ?? key;
  },
}));

vi.mock('nuqs', () => ({
  parseAsString: {},
  useQueryState: () => [null, vi.fn()],
}));

vi.mock('@/features/events/(stores)/use-event-detail-store', () => ({
  useEventDetailStore: (selector: (state: { canEdit: boolean; isOverviewLocked: boolean }) => unknown) =>
    selector({ canEdit: true, isOverviewLocked: false }),
}));

function ContactCardHarness() {
  const methods = useForm<EventFormDto>({
    defaultValues: { contactPhone: '+49', contacts: [] } as Partial<EventFormDto>,
  });

  return (
    <FormProvider {...methods}>
      <ContactCard />
    </FormProvider>
  );
}

describe('ContactCard', () => {
  it('defaults the admin contact phone to +49', () => {
    render(<ContactCardHarness />);

    expect(screen.getByLabelText('Telefon')).toHaveValue('+49');
  });

  it('renders additional contact fields in Name, Phone, Role, Email order', async () => {
    render(<ContactCardHarness />);

    const addButton = screen.getByRole('button', { name: /Weitere Kontakte hinzufügen/ });
    const { default: userEvent } = await import('@testing-library/user-event');
    await userEvent.setup().click(addButton);

    const labels = screen
      .getAllByText(/^(Kontaktname|Rolle|E-Mail|Telefon)$/)
      .map((el) => el.textContent);

    // The admin contact block above also renders "E-Mail"/"Telefon" labels, so scope to
    // the last 4 (the newly appended contact row).
    expect(labels.slice(-4)).toEqual(['Kontaktname', 'Telefon', 'Rolle', 'E-Mail']);
  });

  it('defaults a newly added contact phone to +49', async () => {
    render(<ContactCardHarness />);
    const { default: userEvent } = await import('@testing-library/user-event');
    await userEvent.setup().click(screen.getByRole('button', { name: /Weitere Kontakte hinzufügen/ }));

    const phoneInputs = screen.getAllByLabelText('Telefon');
    expect(phoneInputs[phoneInputs.length - 1]).toHaveValue('+49');
  });

  it('renders the additional contact role as a select with the EVENT_CONTACT_ROLES options', async () => {
    render(<ContactCardHarness />);
    const { default: userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Weitere Kontakte hinzufügen/ }));

    const roleCombobox = screen.getByRole('combobox', { name: 'Rolle' });
    await user.click(roleCombobox);

    for (const label of ['Admin', 'Organisator', 'Catering', 'Management', 'Elektriker', 'Techniker', 'Serviceleitung']) {
      expect(screen.getByRole('option', { name: label })).toBeVisible();
    }
  });
});
