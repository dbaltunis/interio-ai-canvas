# Dashboard KPIs & Analytics

Complete guide to dashboard metrics and visibility controls in InterioApp.

---

## Overview

The InterioApp dashboard provides real-time business intelligence with customizable metrics and role-based visibility controls.

---

## KPI Categories

### Primary KPIs
**Available to**: All roles by default

Core business metrics everyone should see:

#### Total Projects
- Count of all active projects
- Includes: Draft, In Progress, Awaiting Approval
- Excludes: Completed, Cancelled
- Updates in real-time
- Click to view project list

#### Total Clients  
- Count of all clients in system
- Includes: Active and inactive clients
- Lead and customer breakdown
- Updates in real-time
- Click to view client list

#### Total Quotes
- Count of all quotes
- Includes: Draft, Sent, Approved, Rejected
- Conversion rate shown
- Updates in real-time
- Click to view quote list

#### Appointments This Month
- Calendar appointments for current month
- Includes: Scheduled, Completed, Cancelled
- Color-coded by status
- Updates in real-time

**Permission**: `view_dashboard_primary_kpis`

---

### Revenue KPIs
**Available to**: Manager, Admin, Owner by default

Financial metrics for business performance:

#### Total Revenue
- Sum of all approved quotes
- Current month and YTD
- Comparison to previous period
- Trend indicator (↑ ↓)
- Growth percentage

#### Gross Profit
- Revenue minus direct costs
- Profit margin percentage
- Cost breakdown available
- Margin trends over time

#### Average Deal Value
- Mean value of won quotes
- By product category
- Comparison to target
- Historical trends

#### Revenue by Product Category
- Breakdown by treatment type
- Top-performing categories
- Growth comparisons
- Visual charts

#### Outstanding Invoices
- Total unpaid amounts
- Aging breakdown (30/60/90 days)
- Critical alerts for overdue
- Payment trend analysis

**Permission**: `view_dashboard_revenue_kpis`

**Why Restrict?**
- Sensitive financial information
- Competitive intelligence protection
- Prevents salary/pricing discussions
- Reduces pressure on sales staff

---

### Email KPIs
**Available to**: Manager, Admin, Owner by default

Email marketing and communication metrics:

#### Emails Sent
- Total emails sent this month
- By campaign type
- Delivery success rate
- Comparison to previous period

#### Open Rate
- Percentage of opened emails
- By campaign and template
- Industry benchmark comparison
- Trend over time

#### Click-Through Rate
- Email link engagement
- Top-performing links
- By campaign analysis
- Conversion tracking

#### Bounce Rate
- Hard and soft bounces
- Email list health score
- Deliverability trends
- Cleanup suggestions

#### Unsubscribe Rate
- Monthly unsubscribe percentage
- Reason analysis (if collected)
- Trend monitoring
- List quality indicator

**Permission**: `view_dashboard_email_kpis`

**Requirements**:
- SendGrid integration configured
- Email campaigns active
- Tracking enabled

**Why Restrict?**
- Marketing strategy confidentiality
- Campaign performance sensitivity
- Prevents email list discussions
- Focuses staff on their metrics

---

## Permission Configuration

### Default Settings by Role

#### Owner
✅ Primary KPIs  
✅ Revenue KPIs  
✅ Email KPIs

#### Admin
✅ Primary KPIs  
✅ Revenue KPIs  
✅ Email KPIs

#### Manager
✅ Primary KPIs  
✅ Revenue KPIs  
✅ Email KPIs

#### Staff
✅ Primary KPIs  
❌ Revenue KPIs  
❌ Email KPIs

#### User (Client)
❌ Primary KPIs  
❌ Revenue KPIs  
❌ Email KPIs

### Customizing KPI Visibility

**For Entire Role**:
1. Go to Settings → Team → Roles
2. Select role to modify
3. Toggle KPI permissions
4. Save changes

**For Individual User**:
1. Go to Settings → Team
2. Select team member
3. Enable "Custom Permissions"
4. Configure KPI access
5. Changes apply immediately

---

## Dashboard Customization

### Widget Arrangement
- Drag and drop widgets to reorder
- Hide/show widgets based on preferences
- Save custom layouts per user
- Reset to default anytime

### Date Range Selection
- Today, This Week, This Month, This Year
- Custom date ranges
- Comparison periods
- Fiscal year support

### Filtering Options
- By team member (for managers)
- By product category
- By client segment
- By project status

### Export Options
- Export to PDF report
- Export to Excel
- Scheduled email reports
- API access for custom integrations

---

## Best Practices

### 1. Appropriate Access
**Do**:
- Give managers full KPI access
- Limit staff to primary KPIs
- Review permissions quarterly

**Don't**:
- Share financial metrics with all staff
- Grant access without business need
- Forget to revoke access when roles change

### 2. Using Metrics Effectively
**For Staff (Primary KPIs)**:
- Track personal project count
- Monitor client engagement
- Set appointment goals
- Focus on activity metrics

**For Managers (All KPIs)**:
- Monitor team performance
- Track financial health
- Optimize pricing strategies
- Identify trends early

**For Owners (All KPIs)**:
- Strategic planning
- Investment decisions
- Growth tracking
- Competitive positioning

### 3. Data-Driven Decisions
- Review metrics daily
- Set monthly targets
- Compare to industry benchmarks
- Act on trends quickly

### 4. Team Communication
**What to Share**:
- Overall company goals
- Team achievements
- Non-sensitive milestones
- Motivational metrics

**What to Keep Private**:
- Individual profit margins
- Pricing strategies
- Competitive advantages
- Sensitive financial data

---

## Metric Definitions

### Revenue Recognition
- Counted when quote is approved
- Excludes draft and pending quotes
- Includes deposits and full payments
- Net of refunds and credits

### Profit Calculation
```
Gross Profit = Revenue - (Materials + Labor + Direct Costs)
Profit Margin = (Gross Profit / Revenue) × 100
```

### Conversion Rate
```
Conversion Rate = (Approved Quotes / Total Quotes) × 100
```

### Average Deal Value
```
Avg Deal = Total Revenue / Number of Approved Quotes
```

### Email Metrics
- **Open Rate**: (Unique Opens / Delivered) × 100
- **Click Rate**: (Unique Clicks / Delivered) × 100  
- **Bounce Rate**: (Bounced / Sent) × 100

---

## Troubleshooting

### Metrics Not Showing
**Issue**: Dashboard appears empty or shows zeros

**Solutions**:
1. Check date range selection
2. Verify you have permission to view metrics
3. Ensure data exists for selected period
4. Refresh browser cache
5. Check if integration is configured (for email metrics)

### Wrong Numbers
**Issue**: Metrics seem incorrect

**Solutions**:
1. Verify date range and filters
2. Check for duplicate records
3. Ensure quotes are properly approved
4. Review data entry for accuracy
5. Contact support if issues persist

### Permission Denied
**Issue**: Cannot see certain KPIs

**Solutions**:
1. Check your role assignment
2. Review custom permissions
3. Ask admin to grant access
4. Understand why restriction exists

### Email KPIs Missing
**Issue**: Email metrics not displaying

**Solutions**:
1. Verify SendGrid is configured
2. Check that email campaigns have been sent
3. Allow 24 hours for data sync
4. Ensure tracking is enabled on emails

---

## Target Tracking (December 2025)

### Setting KPI Targets
Admins can set performance targets for team members:

1. Go to **Settings → Team → [User] → Dashboard**
2. Enable target for specific KPIs
3. Set target value and period

### Target Periods
- **Daily**: Resets every day
- **Weekly**: Resets every Monday
- **Monthly**: Resets first of month
- **Quarterly**: Resets first of quarter
- **Yearly**: Resets January 1st

### Progress Visualization
- Progress bar on each KPI card
- Percentage to goal displayed
- Color-coded status:
  - 🔴 Red: <50% of target
  - 🟡 Yellow: 50-80% of target
  - 🟢 Green: >80% of target

---

## Dashboard Preferences (December 2025)

Dashboard settings now save to database, persisting across devices.

---

## Dealer Performance Widget (December 2025)

Shows team leaderboard with quote count, revenue, and conversion rates per dealer.
Requires `view_team_performance` permission.

---

## Future Enhancements

### Coming Soon
- **Custom KPI Builder**: Create your own metrics
- **Forecasting**: AI-powered projections
- **Benchmarking**: Compare to industry averages
- **Mobile Dashboard**: Access metrics on the go
- **Real-time Alerts**: Notifications for threshold breaches
- **Advanced Analytics**: Deeper business intelligence
- **Custom Reports**: Build complex reports with filters

---

## Integration Notes

### Email Metrics Requirements
- SendGrid account connected
- Email tracking enabled
- Webhooks configured (automatic)
- Minimum 10 emails sent (for meaningful data)

### Accounting Integration (Coming Soon)
When QuickBooks/Xero integration launches:
- Revenue sync from invoices
- Automatic profit calculations
- Real-time financial data
- Audit trail maintenance

### CRM Integration (Coming Soon)
- Lead source tracking
- Conversion funnel analysis
- Customer lifetime value
- Churn prediction

---

*Last Updated: November 21, 2025*