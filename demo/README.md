# InterioApp Demo - Standalone Version

A complete demo version of the InterioApp interior design application that you can embed into any website to showcase the full application functionality without requiring user authentication or data persistence.

## Features

### 📊 **Dashboard**
- Revenue metrics and business analytics
- Recent projects and client activity
- Interactive charts with mock data
- Key performance indicators

### 🏠 **Projects & Jobs Management**
- Complete project lifecycle management
- Room-by-room measurements and treatments
- Project status tracking (planning, in-progress, completed)
- Client assignment and project details

### 👥 **Client Management (CRM)**
- Client profiles with contact information
- Project history and total value tracking
- Client status management
- Search and filtering capabilities

### 📧 **Email Management**
- Email template library
- Campaign performance metrics
- Automated follow-up sequences
- Client communication tracking

### 📅 **Calendar & Scheduling**
- Appointment scheduling interface
- Team calendar with availability
- Event types (consultations, installations, follow-ups)
- Quick action buttons for common tasks

### 📚 **Product Library**
- Comprehensive product catalog
- Category-based organization
- Pricing and inventory management
- Product search and filtering

### 🤝 **Team Collaboration Hub**
- Team member profiles and status
- Project assignments and progress tracking
- Activity feed with real-time updates
- Team performance metrics

## Installation

### Option 1: Copy and Paste (Recommended)

1. **Copy the demo folder** to your Lovable project:
   ```
   /demo/
   ├── DemoApp.tsx
   ├── DemoDataProvider.tsx
   ├── DemoRouter.tsx
   ├── DemoHeader.tsx
   ├── demo-styles.css
   ├── pages/
   │   ├── DemoDashboard.tsx
   │   ├── DemoJobs.tsx
   │   ├── DemoClients.tsx
   │   ├── DemoEmails.tsx
   │   ├── DemoCalendar.tsx
   │   ├── DemoLibrary.tsx
   │   └── DemoTeamHub.tsx
   └── README.md
   ```

2. **Add to your website page**:
   ```tsx
   import DemoApp from './demo/DemoApp';
   
   const DemoPage = () => {
     return (
       <div className="demo-page-container">
         <DemoApp />
       </div>
     );
   };
   
   export default DemoPage;
   ```

3. **Add route to your main App**:
   ```tsx
   import { BrowserRouter, Routes, Route } from 'react-router-dom';
   import DemoPage from './pages/DemoPage';
   
   function App() {
     return (
       <BrowserRouter>
         <Routes>
           <Route path="/demo" element={<DemoPage />} />
           {/* Your other routes */}
         </Routes>
       </BrowserRouter>
     );
   }
   ```

### Option 2: Embedded Component

For embedding in a specific section of your website:

```tsx
import { DemoApp } from './demo/DemoApp';

const YourLandingPage = () => {
  return (
    <div>
      {/* Your marketing content */}
      <section className="demo-section">
        <h2>Try InterioApp Demo</h2>
        <div style={{ height: '800px', border: '1px solid #e5e7eb' }}>
          <DemoApp />
        </div>
      </section>
      {/* More marketing content */}
    </div>
  );
};
```

## Customization

### 1. **Branding & Colors**

Edit `demo-styles.css` to match your brand:

```css
/* Update primary color */
.demo-btn-primary {
  background: #your-brand-color;
}

/* Update logo */
.demo-logo-text {
  font-family: 'Your-Brand-Font';
  color: #your-brand-color;
}
```

### 2. **Call-to-Action Buttons**

Update CTAs in `DemoHeader.tsx`:

```tsx
<button className="demo-btn demo-btn-primary">
  Start Your Free Trial  {/* Your CTA text */}
</button>
```

### 3. **Demo Data**

Customize mock data in `DemoDataProvider.tsx`:

```tsx
const clients: DemoClient[] = [
  {
    id: '1',
    name: 'Your Sample Client',
    // ... customize sample data
  }
];
```

### 4. **Contact Links**

Add your contact/signup links:

```tsx
// In DemoHeader.tsx
<button 
  className="demo-btn demo-btn-primary"
  onClick={() => window.open('https://your-signup-url.com', '_blank')}
>
  Get Started
</button>
```

## Features & Benefits

### ✅ **Fully Functional Demo**
- All features working with realistic data
- No backend required - purely frontend
- Responsive design for all devices

### ✅ **No Dependencies**
- Self-contained with embedded styles
- No external API calls or data persistence
- Works in any React/Lovable environment

### ✅ **Marketing Optimized**
- Strategic CTA placement throughout
- "Try Demo" badges and tooltips
- Professional demo branding

### ✅ **Easy Integration**
- Drop-in component for any website
- Customizable branding and colors
- Mobile-responsive design

## Demo Data Includes

- **8 Sample Projects** across different stages
- **25+ Client Profiles** with realistic data
- **50+ Products** in various categories
- **Email Templates** and campaign examples
- **Calendar Events** and scheduling demos
- **Team Activity** and collaboration features

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance

- Fast loading with embedded styles
- Optimized for demo interactions
- No external dependencies
- Lightweight bundle size

## Support & Customization

For additional customization or support integrating this demo:

1. **Basic Customization**: Edit colors, text, and CTAs in the provided files
2. **Advanced Features**: Contact for custom development
3. **Analytics**: Add your tracking codes to monitor demo usage

## Demo URL Structure

Once integrated, your demo will be available at:
- `/demo` - Full demo application
- `/demo/dashboard` - Dashboard view
- `/demo/jobs` - Projects view
- `/demo/clients` - CRM view
- etc.

---

**Ready to convert demo users to customers?** This demo showcases the full power of InterioApp while maintaining a professional, branded experience that drives conversions.