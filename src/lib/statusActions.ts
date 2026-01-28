/**
 * Status Actions Documentation
 * 
 * SIMPLIFIED STATUS SYSTEM (v2)
 * =============================
 * 
 * The status system has been simplified to 3 action types:
 * 
 * 1. editable
 *    - Full edit access to the job/project
 *    - Status can be changed freely
 *    - All fields can be modified
 *    - Use for: "Lead", "Draft" - early stages where changes are expected
 * 
 * 2. locked
 *    - Project CANNOT be edited
 *    - Status CAN be changed (to move forward/backward in workflow)
 *    - Typically requires moving back to "Draft" to make changes
 *    - Use for: "Quote Sent", "Approved", "Planning", "In Progress", 
 *               "Manufacturing", "Completed" - most workflow stages
 * 
 * 3. requires_reason
 *    - Prompts user for mandatory reason before status change
 *    - Reason is logged in status_change_history table
 *    - Use for: "Rejected", "Cancelled", "On Hold" - actions that need documentation
 * 
 * 
 * KEY PRINCIPLE:
 * ==============
 * By default, most statuses should LOCK the project. 
 * If changes are needed, user moves status BACK to an editable stage (like "Draft"),
 * makes changes, then progresses forward again.
 * 
 * This creates an audit trail and prevents accidental modifications
 * to quoted/approved/in-progress work.
 * 
 * 
 * Category Types:
 * ---------------
 * 
 * 1. Quote - Statuses for quotes/estimates
 * 2. Project - Statuses for active projects
 * 
 * 
 * Status Change History:
 * ----------------------
 * All status changes are logged to the status_change_history table with:
 * - Who made the change
 * - When it was made
 * - Previous and new status
 * - Reason (required for requires_reason actions)
 * 
 */

export const STATUS_ACTIONS = {
  EDITABLE: 'editable',
  LOCKED: 'locked',
  REQUIRES_REASON: 'requires_reason',
} as const;

export const STATUS_CATEGORIES = {
  QUOTE: 'Quote',
  PROJECT: 'Project',
} as const;

export type StatusAction = typeof STATUS_ACTIONS[keyof typeof STATUS_ACTIONS];
export type StatusCategory = typeof STATUS_CATEGORIES[keyof typeof STATUS_CATEGORIES];
