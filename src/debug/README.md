# Navigation Debugging Tools

This directory contains temporary debugging tools to track and prevent unwanted redirects.

## Files

### navLogger.ts
- Instruments all navigation methods (history.pushState, history.replaceState, window.location.href)
- Logs stack traces for every navigation event
- Temporary tool - remove after debugging is complete

### useLoggedNavigate.ts  
- Wrapper for React Router's useNavigate that logs all navigation calls
- Use this instead of useNavigate during debugging
- Temporary tool - remove after debugging is complete

## Usage

The navigation logger is automatically installed in App.tsx and will log all navigation events to the console with stack traces.

## What We Fixed

1. **Global Navigation Instrumentation**: Added logging for all navigation sources
2. **Jobs Route Hardening**: 
   - Prevented redirects on transient data gaps
   - Added local 404/No Access components instead of root redirects
   - Added loading skeletons for better UX
3. **Replaced Hard Redirects**: Converted window.location.href redirects to safer URL construction
4. **Focus Event Handling**: Added query invalidation on focus instead of navigation
5. **Permission Loading States**: Preserved navigation state during permission refetches

## Expected Result

- No more redirects to "/" when switching browser tabs from Jobs pages
- Better error handling with local 404s instead of root redirects
- Console logs showing exactly where any remaining navigation originates