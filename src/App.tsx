import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Dashboard from "@/pages/Dashboard";
import Messages from "@/pages/Messages";
import Call from "@/pages/Call";
import CreatorHub from "@/pages/CreatorHub";
import BrandHub from "@/pages/BrandHub";
import SocialRoom from "@/pages/SocialRoom";
import Discover from "@/pages/Discover";
import Profile from "@/pages/Profile";
import ViewProfile from "@/pages/ViewProfile";
import Settings from "@/pages/Settings";
import AllUsers from "@/pages/AllUsers";
import PayoutRequest from "@/pages/PayoutRequest";
import LeaderboardPage from "@/components/leaderboard/LeaderboardPage";
import LiveStreaming from "@/pages/LiveStreaming";

// Create a client
const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event, session) => {
          setIsAuthenticated(!!session);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace />
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="audifyx-theme">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Routes>
                      {/* Keep existing routes */}
                      <Route path="" element={<Dashboard />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/call" element={<Call />} />
                      <Route path="/creator-hub" element={<CreatorHub />} />
                      <Route path="/brand-hub" element={<BrandHub />} />
                      <Route path="/social-room" element={<SocialRoom />} />
                      <Route path="/discover" element={<Discover />} />

                      {/* Replace MyTracks with Leaderboard */}
                      <Route path="/leaderboard" element={<LeaderboardPage />} />
                      
                      {/* Live Stream page */}
                      <Route path="/live-stream" element={<LiveStreaming />} />

                      {/* Other existing routes */}
                      <Route path="/payout-request" element={<PayoutRequest />} />
                      <Route path="/profile/:username" element={<ViewProfile />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/all-users" element={<AllUsers />} />
                    </Routes>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
