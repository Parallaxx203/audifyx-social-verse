
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "@/pages/Profile";
import NotFound from "./pages/NotFound";
import Discover from "./pages/Discover";
import LiveStream from "./pages/LiveStream";
import AllUsers from "./pages/AllUsers";
import Messages from "./pages/Messages";
import Call from "./pages/Call";
import Settings from "@/pages/Settings";
import CreatorHub from "./pages/CreatorHub";
import BrandHub from "./pages/BrandHub";
import MyTracks from "@/pages/MyTracks";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ViewProfile from "@/pages/ViewProfile";
import TestDB from "@/pages/TestDB";
import PayoutRequest from "@/pages/PayoutRequest";
import SocialRoom from "@/pages/SocialRoom";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/creator-hub" element={<CreatorHub />} />
              <Route path="/live-stream" element={<LiveStream />} />
              <Route path="/social-room" element={<SocialRoom />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/my-tracks" element={
                <ProtectedRoute>
                  <MyTracks />
                </ProtectedRoute>
              } />
              <Route path="/profile/:username" element={<ViewProfile />} />
              <Route path="/discover" element={
                <ProtectedRoute>
                  <Discover />
                </ProtectedRoute>
              } />
              <Route path="/users" element={
                <ProtectedRoute>
                  <AllUsers />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } />
              <Route path="/call" element={
                <ProtectedRoute>
                  <Call />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/brand-hub" element={
                <ProtectedRoute requiredRole="brand">
                  <BrandHub />
                </ProtectedRoute>
              } />
              <Route path="/test-db" element={<TestDB />} />
              <Route path="/payouts" element={<PayoutRequest />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
