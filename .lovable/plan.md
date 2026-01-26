
# Fix Documentation: Markdown Rendering, API Keys, and Screenshots

## Issues Identified

### Issue 1: Markdown Not Rendering
The documentation content uses markdown syntax (`**bold**`, backticks for code) but the rendering code at line 444 uses a plain `CardDescription` component with `whitespace-pre-line` - this preserves line breaks but does NOT render markdown formatting.

**Current (broken):**
```jsx
<CardDescription className="text-white/80 whitespace-pre-line">
  {subsection.content}  // Shows raw ** characters
</CardDescription>
```

**Solution:** Create a `MarkdownContent` component that parses and renders markdown as HTML.

### Issue 2: API Credentials Missing
You're looking for the Supabase URL and Anon Key for integration. The documentation mentions the Base URL but **does NOT include the anon key**.

**Missing information for developers:**
- **Supabase URL:** `https://ldgrcodffsalkevafbkb.supabase.co`
- **Anon Key:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (the publishable key)

**Solution:** Add a complete "Developer Credentials" subsection with both values clearly displayed.

### Issue 3: Screenshots Not Uploaded
The screenshot system works (ScreenshotUploader and ScreenshotDisplay are integrated), but no actual screenshots have been uploaded to the `documentation-screenshots` Supabase bucket.

**Solution:** To upload screenshots, enable "Edit Mode" toggle in the Documentation page header and use the upload button for each section.

---

## Implementation Plan

### Step 1: Create MarkdownContent Component
Create a new component that converts markdown to HTML:

**File:** `src/components/documentation/MarkdownContent.tsx`

Handles:
- `**bold**` → `<strong>`
- `*italic*` → `<em>`
- `` `code` `` → `<code>`
- Lists with `•` bullets
- Newlines preserved

### Step 2: Update Documentation.tsx Rendering
Replace the plain text rendering with the new MarkdownContent component:

**File:** `src/pages/Documentation.tsx`

```text
Line 444-446: Replace CardDescription usage with MarkdownContent
```

### Step 3: Add API Credentials Section
Update the "API Overview" subsection to include complete credentials:

**File:** `src/pages/Documentation.tsx` (line 224-227)

Add clear credentials block:
```text
**InterioApp API Credentials:**

Supabase URL: https://ldgrcodffsalkevafbkb.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkZ3Jjb2RmZnNhbGtldmFmYmtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2OTAyMDEsImV4cCI6MjA2NjI2NjIwMX0.d9jbWQB2byOUGPkBp7lLjqE1tKkR4KtDcgaTiU42r_I

Base URL for Edge Functions:
https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/
```

### Step 4: Screenshots (Manual Step)
After code changes, you can upload screenshots:
1. Go to Documentation page
2. Toggle "Edit Mode" in header
3. Click upload icon next to each section title
4. Select screenshot image

---

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `src/components/documentation/MarkdownContent.tsx` | Create | Parse and render markdown as HTML |
| `src/pages/Documentation.tsx` | Modify | Use MarkdownContent + add API credentials |

---

## Technical Details

### MarkdownContent Component Logic
```text
function MarkdownContent({ content }) {
  // Convert markdown to HTML:
  // 1. **text** → <strong>text</strong>
  // 2. *text* → <em>text</em>
  // 3. `code` → <code>code</code>
  // 4. \n → <br /> (line breaks)
  // 5. • lists preserved
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
}
```

### API Overview Content Update
The current content at line 226 will be expanded to include:

```text
**InterioApp API Credentials:**

Use these credentials for API integration:

• Supabase URL: https://ldgrcodffsalkevafbkb.supabase.co
• Anon Key (publishable): [full key displayed]
• Edge Functions Base: [URL]/functions/v1/

Example request:
fetch('[URL]/functions/v1/receive-external-lead', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'apikey': '[ANON_KEY]'
  },
  body: JSON.stringify({ ... })
})
```

---

## Expected Outcome

After implementation:
- **Bold text** renders as bold (not `**text**`)
- `Code` renders in monospace (not backticks)
- API credentials clearly visible in documentation
- Developers can copy URL and key for integration
- Screenshots can be uploaded via Edit Mode
