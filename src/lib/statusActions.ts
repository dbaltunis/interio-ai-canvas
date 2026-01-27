/**
 * Status Actions Documentation
 * 
 * This file documents the different action types available for job statuses
 * and their behavior throughout the application.
 * 
 * Action Types:
 * -------------
 * 
 * 1. editable (default)
 *    - Full edit access to the job/project
 *    - Status can be changed freely
 *    - All fields can be modified
 *    - Example: "Draft", "Planning", "In Progress"
 * 
 * 2. view_only
 *    - Status cannot be changed
 *    - Job/Project details can still be viewed but not edited
 *    - Usually represents a pending approval or external action state
 *    - Example: "Sent" (waiting for client response), "Under Review"
 * 
 * 3. locked
 *    - Status cannot be changed
 *    - Job/Project is in a final state that shouldn't be modified
 *    - Typically requires admin override to unlock
 *    - Example: "Rejected", "Cancelled", "Approved"
 * 
 * 4. completed
 *    - Status represents final completion
 *    - Cannot be changed (locked)
 *    - Auto-sets completion date if not already set
 *    - Example: "Completed", "Installed", "Delivered"
 * 
 * 5. requires_reason
 *    - Status can be set but requires a reason/note
 *    - Forces user to document why the status is being set
 *    - Example: "On Hold", "Delayed"
 * 
 * 
 * Category Types:
 * ---------------
 * 
 * 1. Quote
 *    - Statuses for quotes/estimates
 *    - Typically: Draft → Sent → Approved/Rejected
 * 
 * 2. Project
 *    - Statuses for active projects
 *    - Typically: Planning → In Progress → Review → Completed
 * 
 * 
 * Implementation Notes:
 * ---------------------
 * 
 * - JobStatusDropdown: Respects locked/view_only states, shows badge-only for read-only
 * - ProjectStatusManager: Disables status changes for locked/view_only statuses
 * - StatusOverviewWidget: Filters to show only Project category statuses
 * - Dashboard: Uses category filtering to separate Quote vs Project statuses
 * - Mutations: All room/surface/treatment mutations check status before executing
 * - UI Components: Buttons are disabled and show lock icon when project is locked
 * 
 */

export const STATUS_ACTIONS = {
  EDITABLE: 'editable',
  VIEW_ONLY: 'view_only',
  LOCKED: 'locked',
  COMPLETED: 'completed',
  REQUIRES_REASON: 'requires_reason',
} as const;

export const STATUS_CATEGORIES = {
  QUOTE: 'Quote',
  PROJECT: 'Project',
} as const;

export type StatusAction = typeof STATUS_ACTIONS[keyof typeof STATUS_ACTIONS];
export type StatusCategory = typeof STATUS_CATEGORIES[keyof typeof STATUS_CATEGORIES];
