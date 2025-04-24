
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { MediaUploader } from '@/components/ui/media-uploader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export default function PayoutRequest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('all');

  useEffect(() => {
    checkAdmin();
    fetchUserPoints();
    if (isAdmin) {
      fetchPayoutRequests();
    }
  }, [user]);

  const checkAdmin = async () => {
    const { data: { role } } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user?.id)
      .single();
    setIsAdmin(role === 'admin');
  };

  const fetchUserPoints = async () => {
    const { data } = await supabase
      .from('user_points')
      .select('points')
      .eq('user_id', user?.id)
      .single();
    setUserPoints(data?.points || 0);
  };

  const fetchPayoutRequests = async () => {
    const query = supabase
      .from('payout_requests')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (status !== 'all') {
      query.eq('status', status);
    }

    const { data } = await query;
    setRequests(data || []);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const pointsToRedeem = Math.floor(parseFloat(payoutAmount) * 100); // $1 = 100 points
      if (pointsToRedeem > userPoints) {
        throw new Error('Insufficient points');
      }

      const { error } = await supabase.from('payout_requests').insert({
        user_id: user.id,
        points_amount: pointsToRedeem,
        usd_amount: parseFloat(payoutAmount),
        wallet_address: walletAddress,
        status: 'pending'
      });

      if (error) throw error;

      // Send email notification
      await fetch('https://formsubmit.co/ajax/loops4aiden@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          name: user.user_metadata.username,
          message: `New payout request:\nPoints: ${pointsToRedeem}\nUSD: $${payoutAmount}\nWallet: ${walletAddress}`
        })
      });

      toast({
        title: 'Success',
        description: 'Your payout request has been submitted.'
      });

      setPayoutAmount('');
      setWalletAddress('');
      fetchUserPoints();

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    const { error } = await supabase
      .from('payout_requests')
      .update({ status: newStatus })
      .eq('id', requestId);

    if (!error) {
      fetchPayoutRequests();
      toast({
        title: 'Status Updated',
        description: `Request ${requestId} is now ${newStatus}`
      });
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-8">
        {/* User Payout Request Form */}
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">Request Payout</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Available Points</p>
                <p className="text-xl font-semibold">{userPoints} ({(userPoints / 100).toFixed(2)} USD)</p>
              </div>
              
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <Input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    placeholder="Amount in USD"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                
                <div>
                  <Input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Solana Wallet Address"
                    required
                  />
                </div>

                <Button type="submit" disabled={loading}>
                  {loading ? 'Submitting...' : 'Request Payout'}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Admin Dashboard */}
        {isAdmin && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Admin Dashboard</h2>
                <Select 
                  value={status}
                  onValueChange={(value) => {
                    setStatus(value);
                    fetchPayoutRequests();
                  }}
                >
                  <option value="all">All Requests</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                </Select>
              </div>

              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <span>Request #{request.id}</span>
                      <span className={`capitalize ${
                        request.status === 'approved' ? 'text-green-500' :
                        request.status === 'denied' ? 'text-red-500' :
                        'text-yellow-500'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p>Points: {request.points_amount}</p>
                      <p>USD: ${request.usd_amount}</p>
                      <p className="break-all">Wallet: {request.wallet_address}</p>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => handleUpdateStatus(request.id, 'approved')}
                          variant="default"
                        >
                          Approve
                        </Button>
                        <Button 
                          onClick={() => handleUpdateStatus(request.id, 'denied')}
                          variant="destructive"
                        >
                          Deny
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
