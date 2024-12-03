import { useState } from "react";

export function useProfiteers(totalAmount: number) {
  const [profiteers, setProfiteers] = useState<{ id: string; share: number }[]>(
    []
  );

  function removeProfiteer(id: string) {
    const profiteer = profiteers.find((j) => j.id === id);

    if (!profiteer) return;

    const shareToRedistribute = profiteer.share;
    const remainingProfiteers = profiteers.filter((j) => j.id !== id);

    setProfiteers(
      remainingProfiteers.map((i) => ({
        ...i,
        share:
          i.share +
          (i.share / remainingProfiteers.reduce((sum, p) => sum + p.share, 0)) *
            shareToRedistribute,
      }))
    );
  }
  function addProfiteer(id: string) {
    const shareForNewProfiteer = 1 / (profiteers.length + 1);
    const remainingShare = 1 - shareForNewProfiteer;

    setProfiteers([
      ...profiteers.map((i) => ({
        ...i,
        share:
          (i.share / profiteers.reduce((sum, p) => sum + p.share, 0)) *
          remainingShare,
      })),
      { id, share: shareForNewProfiteer },
    ]);
  }

  function setProfiteerPercentage(id: string, value: number) {
    const profiteer = profiteers.find((j) => j.id === id);

    if (value > 100) return;
    if (!profiteer) return;

    const shareToAdd = value / 100 - profiteer.share;

    setProfiteers(
      profiteers.map((j) => ({
        ...j,
        share:
          j.id === id
            ? j.share + shareToAdd
            : j.share - shareToAdd / (profiteers.length - 1),
      }))
    );
  }
  function setProfiteerAmount(id: string, value: number) {
    const profiteer = profiteers.find((j) => j.id === id);

    if (value > totalAmount) return;
    if (!profiteer) return;

    const shareToAdd = value / totalAmount - profiteer.share;

    setProfiteers(
      profiteers.map((j) => ({
        ...j,
        share:
          j.id === id
            ? j.share + shareToAdd
            : j.share - shareToAdd / (profiteers.length - 1),
      }))
    );
  }

  return {
    profiteers,
    removeProfiteer,
    addProfiteer,
    setProfiteerPercentage,
    setProfiteerAmount,
  };
}
