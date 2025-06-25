
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import { MainNav } from "@/components/layout/MainNav";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { JobsPage } from "@/components/jobs/JobsPage";
import { NewJobPage } from "@/components/job-creation/NewJobPage";
import { JobEditPage } from "@/components/job-editor/JobEditPage";
import { ProjectPage } from "@/components/projects/ProjectPage";
import { EnhancedClientManagement } from "@/components/clients/EnhancedClientManagement";
import { QuoteManagement } from "@/components/quotes/QuoteManagement";
import { InventoryManagement } from "@/components/inventory/InventoryManagement";
import { WorkshopManagement } from "@/components/workshop/WorkshopManagement";
import { CalendarView } from "@/components/calendar/CalendarView";
import { CalculatorView } from "@/components/calculator/CalculatorView";
import { LibraryPage } from "@/components/library/LibraryPage";
import { SettingsView } from "@/components/settings/SettingsView";
import NotFound from "@/pages/NotFound";
import { useNavigate } from "react-router-dom";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-50">
              <MainNav />
              <main className="flex-1 pb-safe">
                <div className="container mx-auto px-4 py-6 max-w-7xl">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/jobs/new" element={<NewJobPageWrapper />} />
                    <Route path="/jobs/:id/edit" element={<JobEditPageWrapper />} />
                    <Route path="/projects/:id" element={<ProjectPage />} />
                    <Route path="/clients" element={<EnhancedClientManagement />} />
                    <Route path="/quotes" element={<QuoteManagement />} />
                    <Route path="/inventory" element={<InventoryManagement />} />
                    <Route path="/workshop" element={<WorkshopManagement />} />
                    <Route path="/calendar" element={<CalendarView />} />
                    <Route path="/calculator" element={<CalculatorView />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/settings" element={<SettingsView />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </main>
            </div>
          </ProtectedRoute>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Wrapper components to handle navigation
const NewJobPageWrapper = () => {
  const navigate = useNavigate();
  return <NewJobPage onBack={() => navigate("/jobs")} />;
};

const JobEditPageWrapper = () => {
  const navigate = useNavigate();
  const jobId = window.location.pathname.split('/')[2]; // Extract ID from URL
  return <JobEditPage jobId={jobId} onBack={() => navigate("/jobs")} />;
};

export default App;
