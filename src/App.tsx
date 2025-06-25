
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { LibraryPage } from '@/components/library/LibraryPage';

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
      <Router>
        <AuthWrapper>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<LibraryPage />} />
            </Routes>
          </div>
        </AuthWrapper>
        <Toaster />
      </Router>
    </QueryClientProvider>
  );
}

export default App;
