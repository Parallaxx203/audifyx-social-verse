
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Discover from "./pages/Discover";
import LiveStream from "./pages/LiveStream";
import AllUsers from "./pages/AllUsers";
import Messages from "./pages/Messages";
import Call from "./pages/Call";
import Settings from "./pages/Settings";
import CreatorHub from "./pages/CreatorHub";
import BrandHub from "./pages/BrandHub";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/live-stream" element={<LiveStream />} />
          <Route path="/users" element={<AllUsers />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/call" element={<Call />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/creator-hub" element={<CreatorHub />} />
          <Route path="/brand-hub" element={<BrandHub />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
