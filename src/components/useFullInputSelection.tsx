import { useRef } from "react";

export function useFullInputSelection<El extends HTMLInputElement>(
  onSubmit?: () => void
) {
  const inputRef = useRef<El>(null);

  const onKeyDown = (e: React.KeyboardEvent<El>) => {
    if (e.key === "Enter") onSubmit?.();

    if (!inputRef.current) return;

    const isRangeSelected =
      inputRef.current &&
      inputRef.current.selectionStart == 0 &&
      inputRef.current.selectionEnd === inputRef.current.value.length;

    if ((e.key === "ArrowLeft" || e.key === "ArrowRight") && !isRangeSelected) {
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && isRangeSelected)
      setTimeout(() => {
        if (inputRef.current)
          inputRef.current.setSelectionRange(
            inputRef.current.value.length,
            inputRef.current.value.length
          );
      }, 0);
  };

  const onMouseDown = (e: React.MouseEvent<El, MouseEvent>) => {
    if (!inputRef.current) return;

    if (document.activeElement === inputRef.current) e.preventDefault();
    else {
      setTimeout(() => {
        if (inputRef.current)
          inputRef.current.setSelectionRange(0, inputRef.current.value.length);
      }, 0);
    }
  };

  return {
    ref: inputRef,
    onBlur: () => onSubmit?.(),
    onKeyDown,
    onMouseDown,
  };
}
