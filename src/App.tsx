
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Page imports
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import BibleStudy from '@/pages/BibleStudy';
import Study from '@/pages/Study';
import Progress from '@/pages/Progress';
import MobileAR from '@/pages/MobileAR';
import CustomQuiz from '@/pages/CustomQuiz';
import GoalsAndRewards from '@/pages/GoalsAndRewards';
import NotFound from '@/pages/NotFound';
import AuthCallback from '@/pages/AuthCallback';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/study" element={<Study />} />
              <Route path="/biblestudy/:book?/:chapter?" element={<BibleStudy />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/ar" element={<MobileAR />} />
              <Route path="/custom-quiz" element={<CustomQuiz />} />
              <Route path="/goals" element={<GoalsAndRewards />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
