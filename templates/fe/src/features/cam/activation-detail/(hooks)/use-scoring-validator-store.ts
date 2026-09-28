'use client';

import { create } from 'zustand';

type ValidateFn = () => Promise<boolean>;
type ApproveFn = () => Promise<void>;

type ScoringValidatorState = {
  validateFn: ValidateFn | null;
  approveFn: ApproveFn | null;
  isApproving: boolean;
  registerValidate: (fn: ValidateFn) => void;
  registerApprove: (fn: ApproveFn) => void;
  unregister: () => void;
};

/**
 * Bridges the Scoring tab (owns validation and the full approve submit flow —
 * build scores, submit evaluation, update status) with the shared detail footer
 * (triggers them before/while allowing Approve) — the two live in separate
 * subtrees of the tab layout, so a plain prop chain doesn't reach.
 */
export const useScoringValidatorStore = create<ScoringValidatorState>((set) => ({
  validateFn: null,
  approveFn: null,
  isApproving: false,
  registerValidate: (fn) => set({ validateFn: fn }),
  registerApprove: (fn) => set({ approveFn: fn }),
  unregister: () => set({ validateFn: null, approveFn: null }),
}));

/** Validates the mounted Scoring tab's form — false if invalid or not mounted. */
export async function triggerScoringValidation(): Promise<boolean> {
  const { validateFn } = useScoringValidatorStore.getState();
  if (!validateFn) return false;
  return validateFn();
}

/** Runs the mounted Scoring tab's registered approve flow (submit evaluation + update status). */
export async function callScoringApprove(): Promise<void> {
  const { approveFn } = useScoringValidatorStore.getState();
  if (!approveFn) return;

  useScoringValidatorStore.setState({ isApproving: true });
  try {
    await approveFn();
  } finally {
    useScoringValidatorStore.setState({ isApproving: false });
  }
}
