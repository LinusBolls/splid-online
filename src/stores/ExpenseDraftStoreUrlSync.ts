"use client";

import { useEffect } from "react";
import { useExpenseDraftStore } from "./expenseDraftStore";
import { useRouter, useSearchParams } from "next/navigation";

const PARAM_NAME = "expense";

export const ExpenseDraftSync = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    existingExpenseId,
    actions: { setExistingExpenseId },
  } = useExpenseDraftStore();

  // useEffect(() => {
  //   const idFromUrl = searchParams.get("expenseId");
  //   if (idFromUrl !== existingExpenseId) {
  //     setExistingExpenseId(idFromUrl);
  //   }
  // }, [searchParams, setExistingExpenseId, existingExpenseId]);

  useEffect(() => {
    if (existingExpenseId) {
      router.replace(`?${PARAM_NAME}=${existingExpenseId}`);
    } else {
      const params = new URLSearchParams(searchParams);
      params.delete(PARAM_NAME);
      router.replace(`?${params.toString()}`);
    }
  }, [existingExpenseId, router, searchParams]);

  return null;
};
