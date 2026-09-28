import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { useAddUserForm } from '@/features/reporting-tool/(hooks)/(assign-team-hooks)/use-add-user-form';

const FormHarness = () => {
  const {
    form: { register, formState: { isValid } },
  } = useAddUserForm();

  return (
    <form>
      <input aria-label="first name" {...register('firstName')} />
      <input aria-label="last name" {...register('lastName')} />
      <input aria-label="email" {...register('email')} />
      <button type="submit" disabled={!isValid}>Add user</button>
    </form>
  );
};

describe('useAddUserForm', () => {
  it('keeps submission disabled until all required fields are valid', async () => {
    const user = userEvent.setup();
    render(<FormHarness />);

    const submit = screen.getByRole('button', { name: 'Add user' });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText('first name'), 'Ada');
    await user.type(screen.getByLabelText('last name'), 'Lovelace');
    await user.type(screen.getByLabelText('email'), 'ada@example.com');

    expect(submit).toBeEnabled();
  });
});
