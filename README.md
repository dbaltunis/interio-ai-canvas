# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a26f4d10-3397-4eb3-b434-f6455cad76b9

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a26f4d10-3397-4eb3-b434-f6455cad76b9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a26f4d10-3397-4eb3-b434-f6455cad76b9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## CRM Sheet View – Staging & Rollback

### Overview
The CRM Sheet View feature is currently in staging with a feature flag system. This allows safe testing without affecting the legacy CRM system.

### Feature Flag Control
- **Feature Flag**: `crm_sheet_view_enabled` (stored in `app_user_flags` table)
- **Default State**: Disabled for all users
- **Per-User Control**: Each user can have the flag enabled/disabled independently

### Quick Feature Flag Management

**Enable for a specific user:**
```sql
INSERT INTO app_user_flags (user_id, flag, enabled) 
VALUES ('[USER_ID]', 'crm_sheet_view_enabled', true)
ON CONFLICT (user_id, flag) DO UPDATE SET enabled = true, updated_at = now();
```

**Disable for a specific user:**
```sql
UPDATE app_user_flags 
SET enabled = false, updated_at = now() 
WHERE user_id = '[USER_ID]' AND flag = 'crm_sheet_view_enabled';
```

**Disable for all users (emergency rollback):**
```sql
UPDATE app_user_flags 
SET enabled = false, updated_at = now() 
WHERE flag = 'crm_sheet_view_enabled';
```

### New Tables Created
- `app_user_flags` - Feature flag management per user
- `crm_accounts_v2` - New CRM accounts with EUR revenue tracking
- `crm_sheet_links` - Google Sheets integration configuration

### Rollback Instructions

**EMERGENCY: Disable feature for all users immediately:**
```sql
UPDATE app_user_flags SET enabled = false WHERE flag = 'crm_sheet_view_enabled';
```

**FULL ROLLBACK: Remove all CRM v2 tables and data:**
```sql
-- WARNING: This will permanently delete all CRM v2 data!
DROP TABLE IF EXISTS public.crm_sheet_links;
DROP TABLE IF EXISTS public.crm_accounts_v2;
DROP FUNCTION IF EXISTS public.mirror_crm_v2_to_legacy(uuid);

-- Remove feature flag data (optional)
DELETE FROM public.app_user_flags WHERE flag = 'crm_sheet_view_enabled';
-- Or drop the entire flags table:
-- DROP TABLE IF EXISTS public.app_user_flags;
```

### Safety Notes
- Legacy CRM (`clients` table) remains completely unchanged
- Jobs system remains completely unchanged  
- All new tables have RLS enabled for security
- Feature flag system allows gradual rollout and instant disable
- The `mirror_crm_v2_to_legacy()` function is a stub and safe to call
