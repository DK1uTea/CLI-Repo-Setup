import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { apiProxy } from '@/lib/api';
import { useDuplicateEvent } from '@/features/events/event-form/(hooks)/use-duplicate-event';

const push = vi.fn();
vi.mock('@/i18n/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/lib/api', () => ({ apiProxy: { post: vi.fn() } }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

function DuplicateProbe({ buildRedirectHref }: { buildRedirectHref: (id: string) => string }) {
  const { duplicate, isPending } = useDuplicateEvent(buildRedirectHref);
  const [result, setResult] = useState('idle');

  return (
    <div>
      <p>{isPending ? 'pending' : 'idle'}</p>
      <p>{result}</p>
      <button type="button" onClick={async () => setResult((await duplicate('event-1')) ? 'ok' : 'failed')}>
        duplicate
      </button>
    </div>
  );
}

describe('useDuplicateEvent', () => {
  it('duplicates the event and redirects to the new event via buildRedirectHref', async () => {
    vi.mocked(apiProxy.post).mockResolvedValueOnce({ data: { data: { id: 'event-2' } } });
    const buildRedirectHref = vi.fn((id: string) => `/events/update-event?eventId=${id}&state=update`);
    const user = userEvent.setup();

    render(<DuplicateProbe buildRedirectHref={buildRedirectHref} />);
    await user.click(screen.getByRole('button', { name: 'duplicate' }));

    expect(await screen.findByText('ok')).toBeInTheDocument();
    expect(apiProxy.post).toHaveBeenCalledWith('/etr/events/event-1/duplicate');
    expect(buildRedirectHref).toHaveBeenCalledWith('event-2');
    expect(push).toHaveBeenCalledWith('/events/update-event?eventId=event-2&state=update');
  });

  it('reports failure and does not navigate when the duplicate request rejects', async () => {
    vi.mocked(apiProxy.post).mockRejectedValueOnce(new Error('network error'));
    const user = userEvent.setup();

    render(<DuplicateProbe buildRedirectHref={(id) => `/events/${id}`} />);
    await user.click(screen.getByRole('button', { name: 'duplicate' }));

    expect(await screen.findByText('failed')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});
