# Security Documentation

Comprehensive security features, policies, and best practices for InterioApp.

---

## Security Overview

InterioApp is built with security as a foundational priority, implementing multiple layers of protection to safeguard your business data.

### Key Security Features
- Row Level Security (RLS) enforcement
- Role-based access control (RBAC)
- Data encryption at rest and in transit
- Account isolation
- Audit logging
- Regular security updates

---

## Row Level Security (RLS)

### What is RLS?
Row Level Security is a database-level security feature that automatically filters data based on user permissions. This means:

**Benefits**:
- Cannot be bypassed by application bugs
- Works across all API endpoints
- No client-side security risks
- Automatic enforcement
- Zero-trust architecture

**Implementation**:
Every database table has RLS policies that:
1. Check user authentication
2. Verify account ownership
3. Validate permissions
4. Filter results automatically

### RLS Policies by Table

#### Projects Table
```sql
-- Users see only their account's projects
-- Staff with view_own_jobs see only their projects
-- Managers/Admins/Owners see all account projects
```

**Policy Rules**:
- Account owner sees all projects
- Team members see based on `view_own_jobs` or `view_all_jobs` permission
- Cannot access other accounts' projects
- Project creators always see their own projects

#### Clients Table
```sql
-- Users see only clients in their account
-- Complete account isolation
```

**Policy Rules**:
- All clients must belong to an account
- Team members see account's clients
- No cross-account visibility
- Search/filter respects boundaries

#### Quotes Table  
```sql
-- Access based on project visibility
-- Quote template inheritance from owner
```

**Policy Rules**:
- If you can see the project, you can see the quote
- Template usage follows permission rules
- Financial data respects revenue KPI permissions

#### Inventory Table
```sql
-- Account-scoped inventory
-- Shared within organization
```

**Policy Rules**:
- Inventory belongs to account
- All team members can view (with permission)
- Edit rights based on `manage_inventory` permission
- No cross-account inventory access

---

## Account Isolation

### Multi-Tenancy Architecture
Each account is completely isolated:

**Data Separation**:
- ✅ Projects isolated by account
- ✅ Clients isolated by account  
- ✅ Inventory isolated by account
- ✅ Templates isolated by account
- ✅ Team members linked to single account
- ✅ Audit logs per account

**Technical Implementation**:
- `user_id` or `account_owner_id` on all records
- RLS policies enforce boundaries
- Database indexes for performance
- Regular isolation audits

### Parent-Child Account Structure

**Account Owner (Parent)**:
- Creates main account
- Owns all company data
- Invites team members
- Sets company-wide policies

**Team Members (Children)**:
- Linked via `parent_account_id`
- Inherit account ownership
- Access based on permissions
- Cannot see other accounts

**Verification**:
```sql
-- Every team member query verifies:
1. User is authenticated
2. User belongs to account
3. User has required permissions
4. Data belongs to user's account
```

---

## Permission Security

### Permission Enforcement

**Three-Layer Security**:

1. **Database Level (RLS)**
   - Automatic filtering
   - Cannot be bypassed
   - Handles all queries

2. **Application Level**
   - UI hides unauthorized features
   - API validates permissions
   - Better user experience

3. **Frontend Level**  
   - Conditional rendering
   - Navigation controls
   - Graceful degradation

### Permission Validation

**On Every Request**:
```sql
has_permission(user_id, 'permission_name')
  ↓
1. Get user's role
2. Get default role permissions
3. Check custom permissions override
4. Return true/false
```

**Caching**:
- Permissions cached for 5 minutes
- Cache invalidates on permission change
- Fresh validation on login
- Periodic background refresh

### Security Considerations

**Do**:
- ✅ Always check permissions server-side
- ✅ Use `has_permission()` function
- ✅ Validate on every database operation
- ✅ Handle permission denied gracefully

**Don't**:
- ❌ Rely only on frontend checks
- ❌ Cache permissions for > 5 minutes
- ❌ Bypass permission checks for "speed"
- ❌ Hard-code permission logic

---

## Data Encryption

### Encryption at Rest
- All database data encrypted with AES-256
- Managed by Supabase infrastructure
- Regular key rotation
- Compliant with SOC 2, GDPR

### Encryption in Transit
- All API calls use HTTPS/TLS 1.3
- Certificate pinning
- No mixed content
- HSTS enabled

### Sensitive Data Handling

**Never Store in Plain Text**:
- Credit card numbers
- Bank account details
- Social security numbers
- Passwords (always hashed)

**Use Secure Storage**:
- Environment variables for secrets
- Supabase vault for API keys
- Encrypted fields for PII
- Tokenization for payments

---

## Authentication & Authorization

### Authentication Methods

**Email/Password**:
- Bcrypt password hashing
- Minimum 8 characters required
- Password complexity rules
- Account lockout after failed attempts

**Google OAuth** (Coming Soon):
- Secure OAuth 2.0 flow
- No password storage required
- Automatic account linking
- Revocable access

**Magic Links** (Coming Soon):
- Passwordless authentication
- Time-limited tokens
- Email verification required
- One-time use links

### Session Management

**Session Security**:
- JWT tokens for authentication
- 1-hour token expiration
- Automatic refresh
- Secure httpOnly cookies

**Multi-Device Support**:
- Separate sessions per device
- Revoke individual sessions
- Activity tracking
- Suspicious login detection

---

## Audit Logging

### What We Log

**User Actions**:
- Login/logout events
- Permission changes
- Data modifications
- Failed access attempts

**System Events**:
- Configuration changes
- Integration connections
- Backup operations
- Security alerts

**Data Changes**:
- Before/after values
- Timestamp and user
- IP address
- User agent

### Audit Trail Access

**Who Can View**:
- Account owners: Full access
- Admins: Account-level logs
- Managers: Team activity logs
- Staff: Their own activity only

**Retention**:
- Logs retained for 90 days (standard)
- 1 year retention (enterprise)
- Export available anytime
- Compliant with regulations

---

## Security Best Practices

### For Account Owners

**Setup**:
1. Use strong, unique password
2. Enable 2FA (when available)
3. Review team permissions regularly
4. Audit access logs monthly

**Operations**:
1. Limit admin access to trusted users
2. Remove inactive team members promptly
3. Review suspicious activity
4. Keep recovery methods updated

**Data Protection**:
1. Regular data exports
2. Backup critical information
3. Review third-party integrations
4. Monitor unusual activity

### For Team Members

**Account Security**:
1. Strong unique password
2. Don't share credentials
3. Log out on shared devices
4. Report suspicious activity

**Data Handling**:
1. Don't screenshot financial data
2. Don't share client information externally
3. Use secure connections only
4. Follow company data policies

**Access Management**:
1. Only request needed permissions
2. Understand your access limits
3. Don't attempt to bypass restrictions
4. Report access issues to admin

### For Developers/Integrators

**API Security**:
1. Use HTTPS for all requests
2. Store API keys in environment variables
3. Rotate keys regularly
4. Monitor API usage

**Code Security**:
1. Never commit secrets to git
2. Validate all user input
3. Use parameterized queries
4. Follow OWASP guidelines

---

## Compliance

### GDPR Compliance
✅ Right to access data  
✅ Right to deletion  
✅ Data portability  
✅ Privacy by design  
✅ Data processing agreements

### SOC 2 Compliance (Infrastructure)
✅ Security controls  
✅ Availability measures  
✅ Processing integrity  
✅ Confidentiality protection  
✅ Privacy safeguards

### Data Retention
- Active data: Indefinite
- Deleted data: 30-day soft delete
- Audit logs: 90 days (standard), 1 year (enterprise)
- Backups: 30 days rolling

---

## Incident Response

### Reporting Security Issues

**How to Report**:
1. Email: security@interioapp.com
2. In-app: Settings → Help → Report Security Issue
3. Response time: < 24 hours for critical issues

**What to Include**:
- Detailed description
- Steps to reproduce
- Affected accounts/data
- Screenshots (if applicable)

### Security Incident Process

**Detection**:
- Automated monitoring
- User reports
- Audit log analysis
- Penetration testing

**Response**:
1. Acknowledge within 1 hour
2. Assess severity and impact
3. Contain the issue
4. Investigate root cause
5. Implement fix
6. Notify affected users

**Post-Incident**:
1. Document findings
2. Update security measures
3. Conduct team training
4. Improve detection systems

---

## Security Updates

### Regular Maintenance
- Weekly dependency updates
- Monthly security patches
- Quarterly penetration testing
- Annual security audits

### Vulnerability Management
- CVE monitoring
- Automated scanning
- Rapid patching process
- Transparent disclosure

---

## Future Security Enhancements

### Planned Features
- Two-factor authentication (2FA)
- Single Sign-On (SSO) for Enterprise
- Advanced threat detection
- IP allowlisting
- Device management
- Session analytics
- Automated security reports
- Security API for integrations

---

## Security Checklist

### Initial Setup
- [ ] Create strong password
- [ ] Review default permissions
- [ ] Set up team member roles
- [ ] Configure integrations securely
- [ ] Review privacy settings

### Monthly
- [ ] Review audit logs
- [ ] Check team member access
- [ ] Update passwords
- [ ] Export data backup
- [ ] Review integration permissions

### Quarterly
- [ ] Full permissions audit
- [ ] Remove inactive users
- [ ] Update security policies
- [ ] Review compliance status
- [ ] Test recovery procedures

### Annually
- [ ] Comprehensive security review
- [ ] Update business continuity plan
- [ ] Vendor security assessment
- [ ] Penetration testing
- [ ] Team security training

---

## Getting Help

### Support Channels
- **Email**: security@interioapp.com
- **Documentation**: docs.interioapp.com/security
- **Community**: forum.interioapp.com
- **Emergency**: 24/7 support for critical issues (Enterprise)

### Resources
- [Security Best Practices Guide](./SECURITY_BEST_PRACTICES.md)
- [Compliance Documentation](./COMPLIANCE.md)
- [API Security Guide](./API_SECURITY.md)
- [Data Protection Policy](./DATA_PROTECTION.md)

---

*Last Updated: November 21, 2025*