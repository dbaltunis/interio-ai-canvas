// This hook is now a simple consumer of the PresenceContext
// All presence logic has been moved to PresenceProvider to run once at app root
// This prevents duplicate API calls and event listeners

export { useUserPresence, type UserPresence } from '@/contexts/PresenceContext';
