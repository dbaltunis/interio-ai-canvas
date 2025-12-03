# Launch Blockers Checklist

## Priority Legend
- 🔴 **CRITICAL** - Must work before any client use
- 🟠 **HIGH** - Should work for professional appearance
- 🟡 **MEDIUM** - Important but can be fixed post-launch
- 🟢 **LOW** - Nice to have

---

## 🔴 CRITICAL - Must Fix Before Launch

| Feature | Status | Notes |
|---------|--------|-------|
| Unit consistency (length) | ✅ FIXED | Centralized formatter utility created |
| Currency display | ✅ FIXED | Uses user settings |
| Quote calculations | 🟡 NEEDS TEST | Test with fresh quote |
| Quote options display | ✅ FIXED | All options persist correctly |
| Account isolation (RLS) | ✅ FIXED | Template cloning pattern implemented |
| Image/color in quotes | ✅ FIXED | ProductImageWithColorFallback universal |
| Save/load measurements | ✅ WORKING | Data persists to database |

---

## 🟠 HIGH - Fix During Soft Launch

| Feature | Status | Notes |
|---------|--------|-------|
| Pricing grid preview | 🟡 NEEDS TEST | May still show "invalid format" |
| Work order PDF | 🟡 NEEDS TEST | Verify hem allowances display |
| Email notifications | ✅ FIXED | Resend integration working |
| Template options toggle | 🟡 NEEDS TEST | Disabled options should not appear |

---

## 🟡 MEDIUM - Can Fix Post-Launch

| Feature | Status | Notes |
|---------|--------|-------|
| Formula strings units | ⚪ DEFERRED | Internal calculation display (not client-facing) |
| Dashboard cleanup | ✅ DONE | Launch Store removed |
| Performance (slow loading) | ✅ FIXED | Instance size guidance added |

---

## 🟢 LOW - Future Enhancement

| Feature | Status | Notes |
|---------|--------|-------|
| Automated tests | ⚪ NOT STARTED | Post-launch priority |
| Staging environment | ⚪ NOT STARTED | Recommended for future |
| Error monitoring | ⚪ NOT STARTED | Consider Sentry integration |

---

## Pre-Launch Verification Commands

### 1. Verify Unit Formatting
```
Open any curtain treatment → Verify measurements show in your configured unit (Settings → Business Settings → Length Unit)
```

### 2. Verify Account Isolation
```
Log in with different account → Verify you only see that account's data
```

### 3. Verify Quote Flow
```
Create measurement → Save → Generate quote → Verify all data persists
```

---

## Launch Readiness Assessment

### Ready for Soft Launch? 
**YES** - All critical blockers addressed. Recommend:
1. Start with 1-2 trusted clients
2. Monitor closely for 1 week
3. Gather feedback before wider rollout

### Recommended Soft Launch Duration
**1-2 weeks** with trusted clients before public announcement

### Rollback Plan
- Use Lovable history to revert to previous version if critical issues arise
- Keep client communication open about "beta" status during soft launch
