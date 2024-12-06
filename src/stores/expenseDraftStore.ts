import { create } from "zustand";

interface ExpenseDraftStore {
  existingExpenseId: string | null;
  actions: {
    setExistingExpenseId: (id: string | null) => void;
  };
}

export const useExpenseDraftStore = create<ExpenseDraftStore>((set) => ({
  existingExpenseId: null,
  actions: {
    setExistingExpenseId: (id) => set({ existingExpenseId: id }),
  },
}));

export const useExpenseDraft = () => {
  const {
    existingExpenseId,
    actions: { setExistingExpenseId },
  } = useExpenseDraftStore();

  return {
    expenseBeingEditedId: existingExpenseId,
    openEditExpenseModal: setExistingExpenseId,
    closeEditExpenseModal: () => setExistingExpenseId(null),
  };
};
