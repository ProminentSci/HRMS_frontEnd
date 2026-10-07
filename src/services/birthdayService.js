import { apiFetch } from '../utils/apiClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Colleagues from the logged-in user's own company whose birthday is today.
export const getTodaysBirthdays = async () => {
  const response = await apiFetch(`${API_BASE_URL}/api/birthdays/today`);
  if (!response.ok) {
    throw new Error('Failed to load birthdays');
  }
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};
