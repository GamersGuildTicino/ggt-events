import { useCallback, useRef, useState } from "react";

type TextareaSnapshot = {
  selectionEnd: number;
  selectionStart: number;
  value: string;
};

export default function useTextareaHistory(initialValue: string) {
  const [value, setValue] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const history = useRef<TextareaSnapshot[]>([
    { selectionEnd: 0, selectionStart: 0, value: initialValue },
  ]);
  const historyIndex = useRef(0);
  const lastInputAt = useRef(0);

  const commitValue = useCallback(
    (
      snapshot: TextareaSnapshot,
      groupWithPreviousInput: boolean,
      restoreSelection = true,
    ) => {
      const snapshots = history.current;
      const currentIndex = historyIndex.current;
      const now = Date.now();

      // Group rapid typing while keeping each toolbar action independently undoable.
      if (
        groupWithPreviousInput &&
        currentIndex === snapshots.length - 1 &&
        now - lastInputAt.current < 750
      ) {
        snapshots[currentIndex] = snapshot;
      } else {
        snapshots.splice(currentIndex + 1);
        snapshots.push(snapshot);
        if (snapshots.length > 100) snapshots.shift();
        historyIndex.current = snapshots.length - 1;
      }

      lastInputAt.current = groupWithPreviousInput ? now : 0;
      setValue(snapshot.value);
      if (restoreSelection) {
        requestAnimationFrame(() => {
          textareaRef.current?.setSelectionRange(
            snapshot.selectionStart,
            snapshot.selectionEnd,
          );
        });
      }
    },
    [],
  );

  const restoreHistory = useCallback((direction: -1 | 1) => {
    const nextIndex = historyIndex.current + direction;
    if (nextIndex < 0 || nextIndex >= history.current.length) return;

    const snapshot = history.current[nextIndex];
    if (!snapshot) return;

    historyIndex.current = nextIndex;
    lastInputAt.current = 0;
    setValue(snapshot.value);
    requestAnimationFrame(() => {
      textareaRef.current?.setSelectionRange(
        snapshot.selectionStart,
        snapshot.selectionEnd,
      );
    });
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const textarea = e.currentTarget;
      commitValue(
        {
          selectionEnd: textarea.selectionEnd,
          selectionStart: textarea.selectionStart,
          value: textarea.value,
        },
        true,
        false,
      );
    },
    [commitValue],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      restoreHistory(e.shiftKey ? 1 : -1);
    },
    [restoreHistory],
  );

  const wrapSelection = useCallback(
    (marker: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const { selectionEnd, selectionStart } = textarea;
      const selectedText = value.slice(selectionStart, selectionEnd);
      const nextValue =
        value.slice(0, selectionStart) +
        marker +
        selectedText +
        marker +
        value.slice(selectionEnd);
      const selectionStartAfterWrap = selectionStart + marker.length;

      commitValue(
        {
          selectionEnd: selectionStartAfterWrap + selectedText.length,
          selectionStart: selectionStartAfterWrap,
          value: nextValue,
        },
        false,
      );
    },
    [commitValue, value],
  );

  return { handleChange, handleKeyDown, textareaRef, value, wrapSelection };
}
