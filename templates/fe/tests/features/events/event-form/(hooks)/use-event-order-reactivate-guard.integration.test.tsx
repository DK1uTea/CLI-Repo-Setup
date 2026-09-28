import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useNavigationGuard } from '@/shared/hooks/common/use-navigation-guard';

/**
 * Guards against a regression where `confirmReactivate` in
 * use-event-order-reactivate-guard.ts flips the guard's `active` prop to
 * false and then synchronously replays the pending navigation
 * (`anchor.click()`). The unit test for that hook mocks useNavigationGuard
 * entirely, so it can't catch a timing bug here — this test uses the real
 * hook to prove the replayed anchor click is treated as real navigation
 * (not re-intercepted) once `active` has been flushed synchronously.
 */
function Harness({ onInterceptedCountChange }: { onInterceptedCountChange: (n: number) => void }) {
  const [active, setActive] = useState(true);
  const pendingRef = useRef<(() => void) | null>(null);
  const countRef = useRef(0);

  useNavigationGuard(active, (proceed) => {
    countRef.current += 1;
    onInterceptedCountChange(countRef.current);
    pendingRef.current = proceed;
  });

  const confirm = () => {
    // Mirrors the fixed confirmReactivate implementation: flush the state
    // update (and useNavigationGuard's cleanup effect) synchronously before
    // replaying the pending navigation.
    flushSync(() => {
      setActive(false);
    });
    pendingRef.current?.();
  };

  return (
    <div>
      <a href="/other-page" data-testid="link">link</a>
      <button data-testid="confirm" onClick={confirm}>confirm</button>
    </div>
  );
}

describe('useNavigationGuard + reactivate-confirm interaction (integration)', () => {
  it('does not re-intercept the replayed navigation after the guard is resolved', () => {
    let interceptedCount = 0;
    render(<Harness onInterceptedCountChange={(n) => { interceptedCount = n; }} />);

    fireEvent.click(screen.getByTestId('link'));
    expect(interceptedCount).toBe(1);

    act(() => {
      fireEvent.click(screen.getByTestId('confirm'));
    });

    // The replayed anchor.click() from `proceed()` must be treated as real
    // navigation, not intercepted again — otherwise the user stays stuck.
    expect(interceptedCount).toBe(1);
  });
});
