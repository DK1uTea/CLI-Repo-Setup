import { create } from "zustand";

export type DraggedGroup = {
  stepPosition: number;
  groupPosition: number;
};

type GroupDragStore = {
  draggedGroup: DraggedGroup | null;
  setDraggedGroup: (draggedGroup: DraggedGroup | null) => void;
};

export const useGroupDragStore = create<GroupDragStore>((set) => ({
  draggedGroup: null,
  setDraggedGroup: (draggedGroup) => set({ draggedGroup }),
}));
