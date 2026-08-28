import { create } from 'zustand';

export const useQueueStore = create((set) => ({
  queueList: [],
  myQueueEntry: null,
  activeDepartmentId: null,
  
  setQueueList: (queueList) => set({ queueList }),
  setMyQueueEntry: (myQueueEntry) => set({ myQueueEntry }),
  setActiveDepartmentId: (departmentId) => set({ activeDepartmentId: departmentId }),

  updateQueueEntry: (updatedEntry) =>
    set((state) => ({
      queueList: state.queueList.map((entry) =>
        entry.id === updatedEntry.id ? { ...entry, ...updatedEntry } : entry
      ),
      myQueueEntry:
        state.myQueueEntry?.id === updatedEntry.id
          ? { ...state.myQueueEntry, ...updatedEntry }
          : state.myQueueEntry,
    })),
}));
