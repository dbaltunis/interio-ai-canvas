// JobsFocusHandler disabled - React Query handles refetchOnWindowFocus via staleTime
// This was causing 3+ redundant query refetches on every tab switch
export const JobsFocusHandler = () => null;