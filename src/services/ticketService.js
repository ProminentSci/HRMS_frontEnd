import { apiFetch } from '../utils/apiClient';
import { createSeenStatusTracker } from '../utils/seenStatusTracker';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const parseErrorMessage = async (response, fallback) => {
  try {
    const errorData = await response.json();
    return errorData.message || errorData.error || fallback;
  } catch (e) {
    return fallback;
  }
};

// Employee's own tickets.
export const getMyTickets = async () => {
  const response = await apiFetch(`${API_BASE_URL}/api/tickets/my`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to load tickets'));
  }
  return response.json();
};

// Fired after a ticket changes (admin update, or employee viewing updates) so sidebar badges
// refresh without waiting for their poll.
export const TICKETS_CHANGED_EVENT = 'tickets:changed';

const ticketSeenTracker = createSeenStatusTracker({
  storageKey: 'employee-ticket-seen',
  initialStatus: 'Open',
  changedEvent: TICKETS_CHANGED_EVENT,
});

export const getUpdatedTicketIds = ticketSeenTracker.getUpdatedIds;
export const markTicketsSeen = ticketSeenTracker.markSeen;

export const createTicket = async ({ subject, description }) => {
  const response = await apiFetch(`${API_BASE_URL}/api/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subject, description }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to raise ticket'));
  }
  return response.json();
};

// Client admin's view - scoped server-side to the admin's own client, filtered and paginated
// server-side too. Returns Spring Data's Page shape: { content, totalElements, totalPages, ... }.
export const getClientTickets = async ({ page = 0, size = 15, status } = {}) => {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const normalizedStatus = status && status.toLowerCase() !== 'all' ? status : '';
  if (normalizedStatus) {
    params.append('status', normalizedStatus);
  }
  const response = await apiFetch(`${API_BASE_URL}/api/tickets?${params.toString()}`);
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to load tickets'));
  }
  return response.json();
};

// Count of tickets not yet closed (Open + In Progress) - drives the sidebar notification badge.
// The API filters by one status at a time, so each status is counted separately and summed.
const ACTIVE_TICKET_STATUSES = ['Open', 'In Progress'];

export const getOpenTicketCount = async () => {
  const pages = await Promise.all(
    ACTIVE_TICKET_STATUSES.map((status) => getClientTickets({ page: 0, size: 1, status }))
  );
  return pages.reduce((sum, data) => sum + (data.totalElements ?? 0), 0);
};

export const updateTicketStatus = async (ticketId, { status, adminResponse }) => {
  const response = await apiFetch(`${API_BASE_URL}/api/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, adminResponse }),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to update ticket'));
  }
  return response.json();
};
