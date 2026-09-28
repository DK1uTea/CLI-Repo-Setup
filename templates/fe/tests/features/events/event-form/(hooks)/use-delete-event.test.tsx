import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useDeleteEvent } from '@/features/events/event-form/(hooks)/use-delete-event';

const push = vi.fn();
vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/lib/api', () => ({ apiProxy: { delete: vi.fn() } }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('next-intl', () => ({ useTranslations: () => (key: string) => key }));

function DeleteProbe({ callback }: { callback?: () => void }) {
  const { deleteEvent, isPending } = useDeleteEvent();
  const [result, setResult] = useState('idle');

  return (
    <div>
      <p>{isPending ? 'pending' : 'idle'}</p>
      <p>{result}</p>
      <button
        type="button"
        onClick={async () => setResult((await deleteEvent('event-1', callback)) ? 'ok' : 'failed')}
      >
        delete
      </button>
    </div>
  );
}

describe('useDeleteEvent', () => {
  it('deletes the event and redirects to the events list when no callback is given', async () => {
    vi.mocked(apiProxy.delete).mockResolvedValueOnce({ data: {} });
    const user = userEvent.setup();

    render(<DeleteProbe />);
    await user.click(screen.getByRole('button', { name: 'delete' }));

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(apiProxy.delete).toHaveBeenCalledWith('/etr/events/event-1');
    expect(push).toHaveBeenCalledWith('/events');
  });

  it('calls the provided callback instead of redirecting when one is given', async () => {
    vi.mocked(apiProxy.delete).mockResolvedValueOnce({ data: {} });
    const callback = vi.fn();
    const user = userEvent.setup();

    render(<DeleteProbe callback={callback} />);
    await user.click(screen.getByRole('button', { name: 'delete' }));

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(callback).toHaveBeenCalledTimes(1);
    expect(push).not.toHaveBeenCalled();
  });

  it('reports failure and does not navigate when the delete request rejects', async () => {
    vi.mocked(apiProxy.delete).mockRejectedValueOnce(new Error('network error'));
    const user = userEvent.setup();

    render(<DeleteProbe />);
    await user.click(screen.getByRole('button', { name: 'delete' }));

    expect(await screen.findByText('failed')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
