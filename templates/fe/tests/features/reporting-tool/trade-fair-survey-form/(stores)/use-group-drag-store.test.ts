import { beforeEach, describe, expect, it } from 'vitest';

import { useGroupDragStore } from '@/features/reporting-tool/trade-fair-survey-form/(stores)/use-group-drag-store';

beforeEach(() => useGroupDragStore.getState().setDraggedGroup(null));

describe('useGroupDragStore', () => {
  it('stores the source step and group positions while dragging', () => {
    useGroupDragStore.getState().setDraggedGroup({ stepPosition: 2, groupPosition: 3 });
    expect(useGroupDragStore.getState().draggedGroup).toEqual({ stepPosition: 2, groupPosition: 3 });
  });

  it('clears drag state after drop or cancellation', () => {
    useGroupDragStore.getState().setDraggedGroup({ stepPosition: 1, groupPosition: 1 });
    useGroupDragStore.getState().setDraggedGroup(null);
    expect(useGroupDragStore.getState().draggedGroup).toBeNull();
  });
});
