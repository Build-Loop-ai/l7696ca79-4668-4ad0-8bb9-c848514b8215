import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  onSync?: (data: T) => Promise<void>;
  debounceMs?: number;
  syncDebounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave<T>({
  data,
  onSave,
  onSync,
  debounceMs = 1500,
  syncDebounceMs = 3000,
  enabled = true,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [syncStatus, setSyncStatus] = useState<SaveStatus>("idle");
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const savedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);
  const lastSavedData = useRef<string>("");

  const clearTimeouts = useCallback(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
  }, []);

  useEffect(() => {
    // Skip the first render to avoid saving on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedData.current = JSON.stringify(data);
      return;
    }

    if (!enabled) return;

    // Check if data actually changed
    const currentDataStr = JSON.stringify(data);
    if (currentDataStr === lastSavedData.current) return;

    // Clear existing timeouts
    clearTimeouts();

    // Set up debounced save
    saveTimeoutRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        await onSave(data);
        lastSavedData.current = currentDataStr;
        setStatus("saved");

        // Clear "saved" status after 2 seconds
        savedTimeoutRef.current = setTimeout(() => {
          setStatus("idle");
        }, 2000);

        // Set up debounced sync (if provided)
        if (onSync) {
          syncTimeoutRef.current = setTimeout(async () => {
            setSyncStatus("saving");
            try {
              await onSync(data);
              setSyncStatus("saved");
              setTimeout(() => setSyncStatus("idle"), 2000);
            } catch (error) {
              console.error("Sync error:", error);
              setSyncStatus("error");
              setTimeout(() => setSyncStatus("idle"), 3000);
            }
          }, syncDebounceMs - debounceMs);
        }
      } catch (error) {
        console.error("Save error:", error);
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    }, debounceMs);

    return () => clearTimeouts();
  }, [data, onSave, onSync, debounceMs, syncDebounceMs, enabled, clearTimeouts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, [clearTimeouts]);

  return { status, syncStatus };
}
