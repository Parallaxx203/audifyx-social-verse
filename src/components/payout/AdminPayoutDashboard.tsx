
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  wallet_address: string;
  verification_image: string;
  profiles?: {
    username: string;
  };
}

interface AdminPayoutDashboardProps {
  requests: WithdrawalRequest[];
  onStatusUpdate: () => void;
}

export function AdminPayoutDashboard({ requests, onStatusUpdate }: AdminPayoutDashboardProps) {
  const { toast } = useToast();
  const [status, setStatus] = useState("all");

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      
      onStatusUpdate();
      toast({
        title: 'Status Updated',
        description: `Request ${requestId.substring(0, 8)} is now ${newStatus}`
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Update failed',
        description: 'Failed to update request status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded-full">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded-full">Approved</span>;
      case 'denied':
        return <span className="px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded-full">Denied</span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-500 rounded-full">{status}</span>;
    }
  };

  const filteredRequests = status === 'all' 
    ? requests 
    : requests.filter(req => req.status === status);

  const totalUSD = filteredRequests.reduce((sum, req) => sum + req.amount, 0);

  return (
    <Card className="border-audifyx-purple/20 bg-gradient-card">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
          <Select 
            value={status}
            onValueChange={setStatus}
          >
            <SelectTrigger className="w-[180px] bg-audifyx-charcoal/50 border-audifyx-purple/30">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-audifyx-charcoal border-audifyx-purple/30">
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="denied">Denied</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-end">
            <p className="font-semibold">Total USD: ${totalUSD.toFixed(2)}</p>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="text-center p-8 text-gray-400">
              No payout requests found
            </div>
          ) : (
            filteredRequests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 border-audifyx-purple/20 bg-audifyx-charcoal/30">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Request #{request.id.substring(0, 8)}</span>
                  {getStatusBadge(request.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <p><span className="text-gray-400">User:</span> {request.profiles?.username || 'Unknown'}</p>
                    <p><span className="text-gray-400">USD:</span> ${request.amount}</p>
                    <p className="break-all"><span className="text-gray-400">Wallet:</span> {request.wallet_address}</p>
                  </div>
                  {request.verification_image && (
                    <div className="flex justify-center">
                      <img 
                        src={request.verification_image} 
                        alt="Verification" 
                        className="h-32 w-auto object-contain rounded-lg border border-audifyx-purple/30" 
                      />
                    </div>
                  )}
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button 
                      onClick={() => handleUpdateStatus(request.id, 'approved')}
                      variant="default"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" /> Approve
                    </Button>
                    <Button 
                      onClick={() => handleUpdateStatus(request.id, 'denied')}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" /> Deny
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
