
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "listener" | "creator" | "brand";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, accountType } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-audifyx flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  // Check role requirement if specified
  if (requiredRole && accountType !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{children}</>;
}
