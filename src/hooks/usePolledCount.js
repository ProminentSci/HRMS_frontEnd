import { useEffect, useState } from 'react';

const DEFAULT_POLL_INTERVAL_MS = 60000;

// Keeps a sidebar badge count fresh: loads on mount, polls on an interval, and re-loads
// immediately whenever `changedEvent` is dispatched on window. `fetchCount` should be stable
// (module-level or memoized) or the poll restarts every render. Pass a null `fetchCount` to
// skip polling (e.g. before the user id is known).
export default function usePolledCount(fetchCount, changedEvent, intervalMs = DEFAULT_POLL_INTERVAL_MS) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!fetchCount) return undefined;
    let cancelled = false;
    const refresh = async () => {
      try {
        const next = await fetchCount();
        if (!cancelled) setCount(next);
      } catch (err) {
        // Badge is best-effort - keep the last known count on failure.
      }
    };
    refresh();
    const intervalId = setInterval(refresh, intervalMs);
    window.addEventListener(changedEvent, refresh);
    return () => {
      cancelled = true;
      clearInterval(intervalId);
      window.removeEventListener(changedEvent, refresh);
    };
  }, [fetchCount, changedEvent, intervalMs]);

  return count;
}
