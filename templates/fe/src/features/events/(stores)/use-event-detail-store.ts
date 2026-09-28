import { create } from 'zustand';

type EventDetailStore = {
  canEdit: boolean;
  setCanEdit: (value: boolean) => void;
  status: string | null;
  setStatus: (value: string | null) => void;
  isFormLoading: boolean;
  setIsFormLoading: (value: boolean) => void;
  isOverviewLocked: boolean;
  setIsOverviewLocked: (value: boolean) => void;
};

export const useEventDetailStore = create<EventDetailStore>((set) => ({
  canEdit: true,
  setCanEdit: (value) => set({ canEdit: value }),
  status: null,
  setStatus: (value) => set({ status: value }),
  isFormLoading: false,
  setIsFormLoading: (value) => set({ isFormLoading: value }),
  isOverviewLocked: false,
  setIsOverviewLocked: (value) => set({ isOverviewLocked: value }),
}));
