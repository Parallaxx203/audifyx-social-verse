
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PayoutRequestForm } from "@/components/payout/PayoutRequestForm";
import { AdminPayoutDashboard } from "@/components/payout/AdminPayoutDashboard";

export default function PayoutRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPoints, setUserPoints] = useState(0);
  const [requests, setRequests] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    checkAdmin();
    fetchUserPoints();
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);

  const checkAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      setIsAdmin(data?.account_type === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchUserPoints = async () => {
    try {
      const { data, error } = await supabase
        .from('points')
        .select('points')
        .eq('user_id', user?.id)
        .single();
        
      if (error) throw error;
      setUserPoints(data?.points || 0);
    } catch (error) {
      console.error('Error fetching user points:', error);
      toast({
        title: "Error",
        description: "Failed to load points balance",
        variant: "destructive"
      });
    }
  };

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .order('requested_at', { ascending: false });
      
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load payout requests",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4`}>
          <div className="container max-w-4xl mx-auto py-8">
            <div className="space-y-8">
              <PayoutRequestForm 
                userPoints={userPoints}
                onSuccess={() => {
                  fetchUserPoints();
                  if (isAdmin) fetchRequests();
                }}
              />

              {isAdmin && (
                <AdminPayoutDashboard 
                  requests={requests}
                  onStatusUpdate={fetchRequests}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
