# Online Store Testing Guide

## Manual Testing Checklist

### ✅ Phase 1 Features to Test

#### 1. Store Creation Flow

**Test Case 1.1: Create store with Modern Minimalist template**
- [ ] Navigate to Library tab
- [ ] Click "Online Store" tab
- [ ] Verify "Launch Online Store" card is displayed
- [ ] Click "Launch Online Store" button
- [ ] Dialog opens with store name input
- [ ] Enter store name: "Test Store 1"
- [ ] Click "Continue"
- [ ] Verify template selector shows 5 templates
- [ ] Select "Modern Minimalist"
- [ ] Verify loading state appears
- [ ] Verify success toast appears
- [ ] Verify dialog closes
- [ ] Verify store dashboard loads

**Test Case 1.2: Create store with each template**
- [ ] Repeat above for "Classic Elegance"
- [ ] Repeat for "Bold Showcase"
- [ ] Repeat for "Professional Business"
- [ ] Repeat for "Portfolio Style"

**Test Case 1.3: Cancel store creation**
- [ ] Click "Launch Online Store"
- [ ] Enter store name
- [ ] Click "Cancel" or close dialog
- [ ] Verify no store is created
- [ ] Verify still on empty state

#### 2. Store Dashboard

**Test Case 2.1: View dashboard stats**
- [ ] Create a store (if not exists)
- [ ] Verify store status card shows store name
- [ ] Verify shows "Draft" badge
- [ ] Verify shows store URL
- [ ] Verify "Edit Pages" button exists
- [ ] Verify "Manage Products" button exists
- [ ] Verify "Store Settings" button exists

**Test Case 2.2: Quick stats display**
- [ ] Verify "New Inquiries" card shows 0
- [ ] Verify "Quote Requests" card shows 0
- [ ] Verify "Products Online" card shows correct count
- [ ] Verify counts match actual data

**Test Case 2.3: Recent activity**
- [ ] With no inquiries: verify shows "No inquiries yet" message
- [ ] Create test inquiry (directly in DB)
- [ ] Verify inquiry appears in recent activity
- [ ] Verify shows customer name and email
- [ ] Verify shows status badge
- [ ] Verify shows time ago

#### 3. Product Management

**Test Case 3.1: Navigate to product manager**
- [ ] From dashboard click "Manage Products"
- [ ] Verify shows "Store Products" card
- [ ] Verify shows list of inventory items
- [ ] Verify each item shows visibility toggle
- [ ] Verify each item shows star icon for featuring

**Test Case 3.2: Toggle product visibility**
- [ ] Find a visible product (switch ON)
- [ ] Click the switch to turn OFF
- [ ] Verify success toast appears
- [ ] Verify switch state updates
- [ ] Verify eye icon changes to eye-off
- [ ] Refresh page and verify state persists

**Test Case 3.3: Feature products**
- [ ] Find a non-featured product
- [ ] Click the star icon
- [ ] Verify star fills with yellow color
- [ ] Verify "Featured" badge appears
- [ ] Verify state persists on refresh

**Test Case 3.4: With no products**
- [ ] Create store with empty inventory
- [ ] Navigate to product manager
- [ ] Verify shows "No products available" message
- [ ] Verify shows helpful text

#### 4. Template Selection

**Test Case 4.1: Template preview display**
- [ ] During creation, verify each template shows:
  - [ ] Template name
  - [ ] Description text
  - [ ] Preview gradient with colors
  - [ ] Icon representing category
  - [ ] Color swatches (4 colors)
  - [ ] "Popular" badge on Modern Minimalist

**Test Case 4.2: Template selection**
- [ ] Click template card
- [ ] Verify checkmark appears
- [ ] Verify ring border appears
- [ ] Click another template
- [ ] Verify selection moves to new template
- [ ] Verify only one can be selected

**Test Case 4.3: Color scheme preview**
- [ ] Verify each template shows different color swatches
- [ ] Verify colors match template design
- [ ] Hover over swatches shows color names

#### 5. Integration with Library

**Test Case 5.1: Shopify and Online Store options**
- [ ] Navigate to Library → Overview
- [ ] Scroll to ecommerce section
- [ ] Verify shows two side-by-side cards
- [ ] Verify Shopify option on left
- [ ] Verify Online Store option on right
- [ ] Verify both show features list
- [ ] Verify checkmarks on all features

**Test Case 5.2: Navigation between tabs**
- [ ] Click "Online Store" tab
- [ ] Verify tab is active/highlighted
- [ ] Click other tabs (Fabrics, Hardware, etc.)
- [ ] Return to Online Store tab
- [ ] Verify state is preserved

#### 6. Error Handling

**Test Case 6.1: Empty store name**
- [ ] Open creation dialog
- [ ] Leave name field empty
- [ ] Verify "Continue" button is disabled
- [ ] Enter name with only spaces
- [ ] Verify button remains disabled

**Test Case 6.2: Duplicate store slug**
- [ ] Create store "Test Store"
- [ ] Try to create another "Test Store"
- [ ] Verify error is handled gracefully
- [ ] Verify helpful error message

**Test Case 6.3: Network errors**
- [ ] Open DevTools → Network
- [ ] Throttle to "Offline"
- [ ] Try to create store
- [ ] Verify error toast appears
- [ ] Verify user-friendly error message

#### 7. Responsive Design

**Test Case 7.1: Mobile view**
- [ ] Resize browser to mobile width (375px)
- [ ] Verify cards stack vertically
- [ ] Verify buttons are full width
- [ ] Verify text remains readable
- [ ] Verify no horizontal scrolling

**Test Case 7.2: Tablet view**
- [ ] Resize to tablet width (768px)
- [ ] Verify 2-column grid on ecommerce cards
- [ ] Verify template selector shows 2 columns
- [ ] Verify navigation is responsive

**Test Case 7.3: Desktop view**
- [ ] Full desktop width (1440px)
- [ ] Verify 3-column template grid
- [ ] Verify all elements properly aligned
- [ ] Verify optimal spacing

#### 8. Performance

**Test Case 8.1: Initial load**
- [ ] Refresh page
- [ ] Verify loads in < 2 seconds
- [ ] Verify no layout shifts
- [ ] Verify skeleton loaders appear

**Test Case 8.2: Product list with 100+ items**
- [ ] Add 100+ inventory items
- [ ] Navigate to product manager
- [ ] Verify list loads smoothly
- [ ] Verify scrolling is smooth
- [ ] Verify toggles respond quickly

**Test Case 8.3: Template selection**
- [ ] Open template selector
- [ ] Verify templates load immediately
- [ ] Verify images render quickly
- [ ] No delay in template selection

#### 9. Database & RLS

**Test Case 9.1: User isolation**
- [ ] Create store as User A
- [ ] Sign in as User B
- [ ] Verify User B cannot see User A's store
- [ ] Verify User B can create their own store

**Test Case 9.2: Public access (future)**
- [ ] Publish a store
- [ ] Open store URL in incognito
- [ ] Verify can view store without login
- [ ] Verify cannot edit/delete

#### 10. Data Integrity

**Test Case 10.1: Store creation data**
- [ ] Create store with business settings configured
- [ ] Check database for store record
- [ ] Verify all fields populated correctly:
  - [ ] store_name matches input
  - [ ] store_slug is generated correctly
  - [ ] logo_url from business settings
  - [ ] colors from template
  - [ ] template_id correct

**Test Case 10.2: Default pages created**
- [ ] After store creation
- [ ] Check `store_pages` table
- [ ] Verify 4 pages created:
  - [ ] home (type: home)
  - [ ] products (type: products)
  - [ ] about (type: about)
  - [ ] contact (type: contact)

**Test Case 10.3: Product mappings**
- [ ] Verify `store_product_visibility` records
- [ ] Verify first 20 inventory items added
- [ ] Verify first 3 marked as featured
- [ ] Verify all set to visible by default

## Automated Test Ideas (Future)

### Unit Tests
```typescript
// useCreateStore.test.ts
describe('useCreateStore', () => {
  it('generates unique slug from store name')
  it('handles duplicate slugs')
  it('populates from business settings')
  it('creates default pages')
  it('adds product mappings')
})

// useStoreStats.test.ts
describe('useStoreStats', () => {
  it('calculates new inquiries correctly')
  it('counts visible products')
  it('returns null when no store')
})
```

### Integration Tests
```typescript
// store-creation.test.ts
describe('Store Creation Flow', () => {
  it('completes full creation flow')
  it('persists data to database')
  it('applies RLS policies correctly')
})
```

### E2E Tests
```typescript
// e2e/online-store.spec.ts
describe('Online Store', () => {
  it('user can create store end-to-end')
  it('user can manage products')
  it('dashboard displays correctly')
})
```

## Bug Report Template

```markdown
**Bug Description**: 
Brief description of the issue

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**:
What should happen

**Actual Behavior**:
What actually happens

**Environment**:
- Browser: 
- OS: 
- User Role: 
- Store Template: 

**Screenshots**:
[Attach if applicable]

**Console Errors**:
[Copy any errors from browser console]

**Database State**:
[Any relevant DB data]
```

## Performance Benchmarks

### Target Metrics
- Store creation: < 3 seconds
- Template selector load: < 500ms
- Product list (50 items): < 1 second
- Dashboard stats calculation: < 500ms
- Product toggle response: < 200ms

### Monitoring
- Use React Query DevTools to monitor queries
- Check Network tab for slow requests
- Monitor Supabase dashboard for DB performance
- Track error rates

## Known Limitations (Phase 1)

1. **No public storefront yet** - stores created but not viewable by customers
2. **No page editing** - template structure is fixed
3. **No custom domain setup** - only slug-based URLs
4. **No payment processing** - inquiries only
5. **Limited analytics** - basic counts only
6. **No SEO optimization** - meta tags not editable
7. **No image uploads** - uses business settings logo only
8. **No email notifications** - manual inquiry checking

## Next Phase Testing

When Phase 2 (Page Editor) is complete:
- [ ] Test drag-and-drop section reordering
- [ ] Test content editing (text, images)
- [ ] Test section add/remove
- [ ] Test undo/redo functionality
- [ ] Test auto-save
- [ ] Test preview mode

---

**Testing Completed By**: _____________
**Date**: _____________
**Issues Found**: _____________
**Status**: ☐ Pass ☐ Fail ☐ Pass with Issues
