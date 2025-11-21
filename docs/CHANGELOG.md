# InterioApp Changelog

All notable changes to InterioApp will be documented in this file.

---

## Version 2.0.1 (November 21, 2025)

### 🎉 New Features

#### Enhanced Custom Permissions System
- **Granular Job Visibility**: New permissions for `view_own_jobs` vs `view_all_jobs`
- **Workroom & Materials Access**: Control access to workroom and material ordering features
- **Quote Template Inheritance**: Team members automatically inherit quote templates from account owner
- **Owner Notifications**: Automatic notifications when team members create projects
- **Permission Categories**: Organized into Jobs, Workroom, Materials, Inventory, Quote Templates, Navigation, and Dashboard sections

#### KPI Visibility Controls
- **Dashboard Protection**: Hide sensitive metrics from staff members
- **Three Permission Levels**:
  - Primary KPIs (projects, clients, quotes)
  - Revenue KPIs (revenue, profit margins, costs)
  - Email KPIs (email tracking and analytics)
- **Customizable Access**: Per-role or per-user permission settings
- **Secure Business Data**: Protect financial information from unauthorized viewing

#### Collections & Tagging System
- **Product Collections**: Group inventory items into logical collections
- **Tag-Based Organization**: Add multiple tags to inventory items
- **Advanced Filtering**: Filter and search by collections and tags
- **Better Categorization**: Organize products by season, style, vendor, or custom categories

#### System Owner Role
- **Super-Admin Capabilities**: New role for multi-account management
- **Account Hierarchy**: Enhanced support for managing multiple accounts
- **System Configuration**: System-wide settings and permissions
- **Cross-Account Access**: View and manage multiple business accounts

#### Hierarchical Treatment Option Pricing
- **Multi-Level Pricing**: Category → Subcategory → Sub-subcategory → Extras
- **Inventory Linking**: Connect options directly to inventory items
- **Hardware Options**: Add hardware components to curtain treatments
- **Visibility Controls**: Show/hide options based on context
- **Ordering System**: Custom sort order for better user experience

#### Navigation Permission Controls
- **Permission-Based Tabs**: Navigation items respect user permissions
- **Cleaner UI**: Hidden tabs for unauthorized access
- **Integration-Based Display**: Email section only shows when SendGrid configured
- **Role-Appropriate Interface**: Customized navigation per user role

#### Team Member Management
- **Improved Invitation Flow**: Streamlined team member onboarding
- **Automatic Account Linking**: New members automatically linked to parent account
- **Access Control**: Fine-grained permissions for team collaboration
- **Role Assignment**: Easy role management for team members

---

### 🔧 Improvements & Bug Fixes

#### Security Hardening
- **RLS Policy Overhaul**: Comprehensive review and update of Row Level Security
- **Account Isolation**: Fixed data leakage between accounts
- **Team Access Controls**: Proper permission enforcement for team members
- **Template Inheritance**: Secure quote template sharing within accounts

#### Permission System Fixes
- **Staff Project Visibility**: Fixed bug where staff couldn't see their own projects
- **Project Creation**: Fixed bug preventing staff from creating new jobs
- **Backward Compatibility**: Legacy permissions automatically migrated
- **Permission Sync**: Existing users automatically receive new default permissions

#### Notification System
- **Trigger Fix**: Removed references to non-existent database columns
- **Owner Notifications**: Proper notifications when team creates projects
- **Message Formatting**: Better notification content with creator information
- **Action Links**: Direct links to relevant projects in notifications

#### RLS Policy Updates
- **Projects Table**: Permission-based access control implemented
- **Quote Templates**: Inheritance model from account owner
- **Performance**: Optimized queries for faster permission checks
- **Consistency**: Standardized policy structure across all tables

#### Treatment Options Cleanup
- **Duplicate Removal**: Removed duplicate fullness and heading options
- **Option Deactivation**: Deactivated redundant options for cleaner UI
- **Curtain Streamlining**: Simplified curtain configuration workflow
- **Better Defaults**: Improved default option selection

#### Database Performance
- **Query Optimization**: Added indexes for frequently accessed data
- **Permission Checks**: Faster permission validation queries
- **Collection Lookups**: Improved performance for tag and collection filtering
- **Connection Pooling**: Better database connection management

#### User Experience
- **Conditional Navigation**: Dynamic navigation based on user capabilities
- **Role Defaults**: Appropriate default permissions per role
- **Error Handling**: Better feedback for access denied scenarios
- **Loading States**: Improved loading indicators during permission checks

#### Account Management
- **Invitation Acceptance**: Fixed team invitation workflow
- **Parent Assignment**: Proper account hierarchy establishment
- **System Owner Handling**: Correct permission handling for super-admin role
- **Account Switching**: Better multi-account support

#### Function Updates
- `get_default_permissions_for_role()`: Updated with new permission categories
- `get_user_role()`: Now handles System Owner role correctly
- `has_permission()`: Performance optimized with better caching
- `get_account_owner()`: Improved reliability for team member lookups

#### Migration Safety
- **Conflict Handling**: All migrations use `ON CONFLICT DO NOTHING`
- **Data Preservation**: Existing data protected during updates
- **Rollback Support**: Safe rollback procedures documented
- **Testing**: All migrations tested before deployment

---

### 🔮 Coming Soon

#### Next-Gen Online Store Builder
- Drag-and-drop store creation interface
- Multiple professional template options
- Advanced customization tools
- Built-in SEO optimization
- Mobile-responsive designs
- Custom domain support

#### Full Shopify Integration
- Two-way product synchronization
- Order management and fulfillment
- Real-time inventory updates
- Customer data integration
- Payment processing
- Analytics sync

#### Advanced Inventory Management
- Shopify ↔ InterioApp bidirectional sync
- Real-time stock level updates
- Multi-location inventory support
- Automated reorder alerts
- Supplier integration
- Batch operations

#### Enhanced Proposal System
- Image upload and gallery management
- Rich text content editing
- Custom branding and templates
- Interactive approval workflow
- Digital signatures
- PDF export with customization

#### Purchasing Module
- Vendor management system
- Purchase order generation
- Cost tracking and analysis
- Supplier communication portal
- Delivery tracking
- Budget management

#### Mobile Applications
- Native iOS app
- Native Android app
- Offline mode support
- Push notifications
- Mobile-optimized workflows
- Camera integration for measurements

#### Advanced Analytics
- Custom report builder
- Sales forecasting tools
- Team performance metrics
- Client behavior analysis
- Financial dashboards
- Export to Excel/PDF

#### Integration Expansions
- QuickBooks Online integration
- Xero accounting sync
- Zapier connectivity (1000+ apps)
- REST API for custom integrations
- Webhook support
- OAuth 2.0 authentication

---

## Version 0.1.1 (November 14, 2025)

### Initial Beta Release
- Core CRM functionality
- Project management
- Quote generation
- Inventory tracking
- Basic team collaboration
- Appointment scheduling

---

## Contributing

For feature requests or bug reports, please contact support or use the in-app feedback system.

## Support

- **Documentation**: [docs.interioapp.com](https://docs.interioapp.com)
- **Email**: support@interioapp.com
- **Community**: Join our user forum

---

*Last Updated: November 21, 2025*