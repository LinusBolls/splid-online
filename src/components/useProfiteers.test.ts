import { act } from "react";
import { renderHook } from "@testing-library/react";
import { useProfiteers } from "./useProfiteers";

import { describe, it, expect } from "vitest";

describe("useProfiteers", () => {
  it("should initialize with an empty list of profiteers", () => {
    const { result } = renderHook(() => useProfiteers(1000));
    expect(result.current.profiteers).toEqual([]);
  });

  it("should add a profiteer and distribute shares correctly", () => {
    const { result } = renderHook(() => useProfiteers(1000));

    act(() => {
      result.current.addProfiteer("user1");
    });

    expect(result.current.profiteers).toEqual([{ id: "user1", share: 1 }]);

    act(() => {
      result.current.addProfiteer("user2");
    });

    expect(result.current.profiteers).toEqual([
      { id: "user1", share: 0.5 },
      { id: "user2", share: 0.5 },
    ]);
  });

  it("should remove a profiteer and redistribute shares correctly", () => {
    const { result } = renderHook(() => useProfiteers(1000));

    act(() => {
      result.current.addProfiteer("user1");
    });
    act(() => {
      result.current.addProfiteer("user2");
    });
    act(() => {
      result.current.addProfiteer("user3");
    });

    expect(result.current.profiteers).toEqual([
      { id: "user1", share: 0.33333333333333337 },
      { id: "user2", share: 0.33333333333333337 },
      { id: "user3", share: 0.3333333333333333 },
    ]);

    act(() => {
      result.current.removeProfiteer("user2");
    });

    expect(result.current.profiteers).toEqual([
      { id: "user1", share: 0.5 },
      { id: "user3", share: 0.5 },
    ]);
  });

  it("should set a profiteer percentage correctly", () => {
    const { result } = renderHook(() => useProfiteers(1000));

    act(() => {
      result.current.addProfiteer("user1");
    });
    act(() => {
      result.current.addProfiteer("user2");
    });

    act(() => {
      result.current.setProfiteerPercentage("user1", 75);
    });

    expect(result.current.profiteers).toEqual([
      { id: "user1", share: 0.75 },
      { id: "user2", share: 0.25 },
    ]);
  });

  it("should set a profiteer amount correctly", () => {
    const { result } = renderHook(() => useProfiteers(1000));

    act(() => {
      result.current.addProfiteer("user1");
    });
    act(() => {
      result.current.addProfiteer("user2");
    });

    act(() => {
      result.current.setProfiteerAmount("user1", 750);
    });

    expect(result.current.profiteers).toEqual([
      { id: "user1", share: 0.75 },
      { id: "user2", share: 0.25 },
    ]);
  });

  it("should not add more than 100% share when setting percentage", () => {
    const { result } = renderHook(() => useProfiteers(1000));

    act(() => {
      result.current.addProfiteer("user1");
    });

    act(() => {
      result.current.setProfiteerPercentage("user1", 150);
    });

    expect(result.current.profiteers).toEqual([{ id: "user1", share: 1 }]);
  });

  it("should not add more than total amount when setting amount", () => {
    const { result } = renderHook(() => useProfiteers(1000));

    act(() => {
      result.current.addProfiteer("user1");
    });

    act(() => {
      result.current.setProfiteerAmount("user1", 1500);
    });

    expect(result.current.profiteers).toEqual([{ id: "user1", share: 1 }]);
  });

  it("should distribute the shares of a removed profiteer among the remaining profiteers proportionally according to their current share", () => {
    const { result } = renderHook(() => useProfiteers(10));

    act(() => {
      result.current.addProfiteer("user1");
    });
    act(() => {
      result.current.addProfiteer("user2");
    });
    act(() => {
      result.current.addProfiteer("user3");
    });
    act(() => {
      result.current.setProfiteerAmount("user1", 0.4);
    });

    act(() => {
      result.current.removeProfiteer("user3");
    });

    expect(result.current.profiteers).toEqual([
      { id: "user1", share: 0.07692307692307689 },
      { id: "user2", share: 0.9230769230769232 },
    ]);
  });

  it("should reduce the shares of the existing profiteers proportionally according to their current share when adding a new profiteer", () => {
    const { result } = renderHook(() => useProfiteers(10));

    act(() => {
      result.current.addProfiteer("user1");
    });
    act(() => {
      result.current.addProfiteer("user2");
    });

    act(() => {
      result.current.setProfiteerAmount("user1", 0.4);
    });

    act(() => {
      result.current.addProfiteer("user3");
    });

    expect(result.current.profiteers).toEqual([
      { id: "user1", share: 0.026666666666666658 },
      { id: "user2", share: 0.64 },
      { id: "user3", share: 0.3333333333333333 },
    ]);
  });
});
