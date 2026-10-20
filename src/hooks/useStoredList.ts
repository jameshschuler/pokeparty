import { useCallback, useEffect, useState } from "react";
import { useToastContext } from "../contexts/toast-context";

type StoredList<T> = {
  key: string;
  load: () => T[];
  save: (items: T[]) => void;
  saveErrorMessage: string;
};

export function useStoredList<T>({
  key,
  load,
  save,
  saveErrorMessage,
}: StoredList<T>): [T[], (items: T[]) => void] {
  const { showToast } = useToastContext();
  const [items, setItems] = useState<T[]>(load);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === key || event.key === null) {
        setItems(load());
      }
    }
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, [key, load]);

  const commit = useCallback(
    (nextItems: T[]) => {
      setItems(nextItems);
      try {
        save(nextItems);
      } catch {
        showToast(saveErrorMessage);
      }
    },
    [save, saveErrorMessage, showToast],
  );

  return [items, commit];
}
