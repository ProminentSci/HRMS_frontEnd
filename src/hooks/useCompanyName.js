import { useEffect, useState } from 'react';
import { getEmployeeCompanyName } from '../services/employeeService';

const CACHE_KEY = 'company-name';

const getLoggedInUserId = () => {
  try {
    return JSON.parse(localStorage.getItem('user'))?.id ?? null;
  } catch {
    return null;
  }
};

// Cached per user id for the browser session, so switching pages doesn't refetch it and a
// different user logging in on the same tab never sees the previous user's company.
const readCache = (userId) => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY));
    return cached && cached.userId === userId ? cached.name : null;
  } catch {
    return null;
  }
};

const writeCache = (userId, name) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ userId, name }));
  } catch {
    // Storage unavailable - just refetch next time.
  }
};

// Company name of the logged-in user's tenant, shown in the dashboard headers.
export default function useCompanyName() {
  const userId = getLoggedInUserId();
  const [companyName, setCompanyName] = useState(() => (userId ? readCache(userId) : null));

  useEffect(() => {
    if (!userId || readCache(userId)) return undefined;
    let cancelled = false;
    getEmployeeCompanyName(userId)
      .then((name) => {
        if (cancelled || !name) return;
        writeCache(userId, name);
        setCompanyName(name);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return companyName;
}
