import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthPage } from "./components/auth/AuthPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { CalendarView } from "./components/calendar/CalendarView";
import { EnhancedClientManagement } from "./components/clients/EnhancedClientManagement";
import { EnhancedProjectManagement } from "./components/projects/EnhancedProjectManagement";
import { NewJobPage } from "./components/job-creation/NewJobPage";
import { ProjectPage } from "./components/projects/ProjectPage";
import { JobEditPage } from "./components/job-editor/JobEditPage";
import { EnhancedJobsManagement } from "./components/jobs/EnhancedJobsManagement";
import { QuoteManagement } from "./components/quotes/QuoteManagement";
import { WorkshopManagement } from "./components/workshop/WorkshopManagement";
import { InventoryManagement } from "./components/inventory/InventoryManagement";
import { LibraryPage } from "./components/library/LibraryPage";
import { DocumentManagement } from "./components/files/DocumentManagement";
import { AIAssistant } from "./components/ai/AIAssistant";
import { SettingsView } from "./components/settings/SettingsView";
import { NotFound } from "./pages/NotFound";
import { Index } from "./pages/Index";
import { PublicBookingPage } from "./components/calendar/PublicBookingPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public booking route - no authentication required */}
            <Route path="/book/:schedulerSlug" element={<PublicBookingPage />} />
            
            {/* Authentication route */}
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/calendar" element={
              <ProtectedRoute>
                <CalendarView />
              </ProtectedRoute>
            } />
            
            <Route path="/clients" element={
              <ProtectedRoute>
                <EnhancedClientManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/projects" element={
              <ProtectedRoute>
                <EnhancedProjectManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/projects/:id" element={
              <ProtectedRoute>
                <ProjectPage />
              </ProtectedRoute>
            } />
            
            <Route path="/jobs/new" element={
              <ProtectedRoute>
                <NewJobPage />
              </ProtectedRoute>
            } />
            
            <Route path="/jobs/:id/edit" element={
              <ProtectedRoute>
                <JobEditPage />
              </ProtectedRoute>
            } />
            
            <Route path="/jobs" element={
              <ProtectedRoute>
                <EnhancedJobsManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/quotes" element={
              <ProtectedRoute>
                <QuoteManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/workshop" element={
              <ProtectedRoute>
                <WorkshopManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/inventory" element={
              <ProtectedRoute>
                <InventoryManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/library" element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            } />
            
            <Route path="/files" element={
              <ProtectedRoute>
                <DocumentManagement />
              </ProtectedRoute>
            } />
            
            <Route path="/ai" element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            } />
            
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsView />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
