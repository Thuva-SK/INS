import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/components/AdminLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/admin/Dashboard";
import InstructorManagement from "@/pages/admin/InstructorManagement";
import CourseManagement from "@/pages/admin/CourseManagement";
import GalleryManagement from "@/pages/admin/GalleryManagement";
import StaffManagement from "@/pages/admin/StaffManagement";
import Settings from "@/pages/admin/Settings";
import ClassManagement from "@/pages/admin/ClassManagement";
import AnnouncementManagement from "@/pages/admin/AnnouncementManagement";
import NotFound from "./pages/NotFound";
import FunctionManagement from "@/pages/admin/FunctionManagement";
import TestTables from "@/pages/admin/TestTables";
import SocialService from "@/pages/admin/SocialService";
import KidsCamp from "@/pages/admin/KidsCamp";

const queryClient = new QueryClient();

const App = () => (
  <div>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Redirect root to admin */}
                <Route path="/" element={<Navigate to="/admin" replace />} />
                
                {/* Login Route */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="instructors" element={<InstructorManagement />} />
                  <Route path="courses" element={<CourseManagement />} />
                  <Route path="gallery" element={<GalleryManagement />} />
                  <Route path="staffs" element={<StaffManagement />} />
                  <Route path="classes" element={<ClassManagement />} />
                  <Route path="announcements" element={<AnnouncementManagement />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="functions-management" element={<FunctionManagement />} />
                  <Route path="test-tables" element={<TestTables />} />
                  <Route path="social-service" element={<SocialService />} />
                  <Route path="kids-camp" element={<KidsCamp />} />
                </Route>

                {/* Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </div>
);

export default App;
