// Tracks the last status an employee saw for each item (ticket, leave request, ...) so the sidebar
// can badge items whose status changed since. The backend has no per-item read flag, so this lives
// in the browser. Item ids are globally unique, so one map per module serves every employee who
// logs in on this browser.
export const createSeenStatusTracker = ({ storageKey, initialStatus, changedEvent }) => {
  const normalize = (status) => String(status || '').toLowerCase();

  const read = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  const write = (map) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(map));
    } catch {
      // localStorage unavailable - the badge just won't remember what was seen
    }
  };

  // Ids of items whose status changed since the employee last viewed them. Items start in
  // `initialStatus`, so an unseen item still in that status is never an "update".
  const getUpdatedIds = (items) => {
    const seen = read();
    if (!seen) {
      // First run on this browser - treat everything as seen rather than flagging old history.
      // Written directly (no change event) so a blocked localStorage can't cause a refresh loop.
      write(Object.fromEntries(items.map((item) => [item.id, normalize(item.status)])));
      return [];
    }
    return items
      .filter((item) => {
        const status = normalize(item.status);
        return seen[item.id] ? seen[item.id] !== status : status !== normalize(initialStatus);
      })
      .map((item) => item.id);
  };

  const markSeen = (items) => {
    const seen = read() || {};
    items.forEach((item) => {
      seen[item.id] = normalize(item.status);
    });
    write(seen);
    window.dispatchEvent(new Event(changedEvent));
  };

  return { getUpdatedIds, markSeen };
};
