// import { Toaster as Sonner } from "@/components/ui/sonner";
import { Suspense, lazy } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load all route components
const Index = lazy(() => import("./pages/Index"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard/TeacherDashboard"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const TeacherLogin = lazy(() => import("./pages/TeacherLogin"));
const ActiveSession = lazy(() => import("./pages/ActiveSession/ActiveSession"));
const AttendanceList = lazy(() => import("./pages/AttendanceList"));
const AttendanceForm = lazy(() => import("./pages/AttendanceForm"));
const AttendanceConfirmation = lazy(() => import("./pages/AttendanceConfirmation"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex min-h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<StudentDashboard />} />
            <Route path="/teacher/login" element={<TeacherLogin />} />
            <Route path="/teacher/dashboard" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/teacher/session/:sessionId" element={<ProtectedRoute><ActiveSession /></ProtectedRoute>} />
            <Route path="/teacher/attendance/:sessionId" element={<ProtectedRoute><AttendanceList /></ProtectedRoute>} />
            <Route path="/student/attendance/:sessionId" element={<AttendanceForm />} />
            <Route path="/student/confirmation" element={<AttendanceConfirmation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;