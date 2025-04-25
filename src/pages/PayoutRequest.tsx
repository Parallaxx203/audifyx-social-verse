
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MediaUploader } from '@/components/ui/media-uploader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Shield, AlertTriangle, CheckCircle, XCircle, Upload } from 'lucide-react';

export default function PayoutRequest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [status, setStatus] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [verificationImage, setVerificationImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

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
      fetchPayoutRequests();
    }
  }, [isAdmin, status]);

  const checkAdmin = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user?.id)
        .single();
        
      if (error) throw error;
      setIsAdmin(data?.role === 'admin');
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
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const query = supabase
        .from('payout_requests')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false });

      if (status !== 'all') {
        query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching payout requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payout requests',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = async (file) => {
    setVerificationImage(file);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `verification/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      setImageUrl(data.publicUrl);
      
      toast({
        title: 'Image uploaded',
        description: 'Verification image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload verification image',
        variant: 'destructive'
      });
    }
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!imageUrl) {
        throw new Error('Please upload a verification image');
      }

      const pointsToRedeem = Math.floor(parseFloat(payoutAmount) * 100); // $1 = 100 points
      if (pointsToRedeem > userPoints) {
        throw new Error('Insufficient points');
      }

      const { data: currentPoints, error: pointsError } = await supabase
        .from('points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (pointsError || !currentPoints || currentPoints.points < pointsToRedeem) {
        throw new Error('Insufficient points');
      }

      // Start transaction
      const { error: pointsUpdateError } = await supabase
        .from('points')
        .update({ points: currentPoints.points - pointsToRedeem })
        .eq('user_id', user.id);

      if (pointsUpdateError) throw pointsUpdateError;

      const { error: requestError } = await supabase.from('payout_requests').insert({
        user_id: user.id,
        points_amount: pointsToRedeem,
        usd_amount: parseFloat(payoutAmount),
        wallet_address: walletAddress,
        verification_image: imageUrl,
        status: 'pending'
      });

      if (requestError) throw requestError;

      try {
        // Send email notification
        const emailResponse = await fetch("https://formsubmit.co/ajax/loops4aiden@gmail.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: "loops4aiden@gmail.com",
            subject: "New Payout Request",
            name: user?.user_metadata?.username || "User",
            message: `New payout request:\nPoints: ${pointsToRedeem}\nUSD: $${payoutAmount}\nWallet: ${walletAddress}`,
          }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(errorData.message || 'Failed to send email notification');
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        toast({
          title: "Warning",
          description: "Request submitted but notification failed to send",
          variant: "destructive"
        });
      }

      toast({
        title: 'Success',
        description: 'Your payout request has been submitted.'
      });

      setPayoutAmount('');
      setWalletAddress('');
      setImageUrl('');
      setVerificationImage(null);
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
    try {
      const { error } = await supabase
        .from('payout_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;
      
      fetchPayoutRequests();
      toast({
        title: 'Status Updated',
        description: `Request ${requestId} is now ${newStatus}`
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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-500 rounded-full flex items-center gap-1">
          <AlertTriangle size={12} /> Pending
        </span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-500 rounded-full flex items-center gap-1">
          <CheckCircle size={12} /> Approved
        </span>;
      case 'denied':
        return <span className="px-2 py-1 text-xs bg-red-500/20 text-red-500 rounded-full flex items-center gap-1">
          <XCircle size={12} /> Denied
        </span>;
      default:
        return <span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-500 rounded-full">
          {status}
        </span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-4`}>
          <div className="container max-w-4xl mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
              <Shield className="text-audifyx-purple" /> Points to USDC Conversion
            </h1>
            
            <div className="space-y-8">
              {/* User Payout Request Form */}
              <Card className="border-audifyx-purple/20 bg-gradient-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Request Payout</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-audifyx-purple/10 p-4 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Available Points</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{userPoints}</p>
                      <p className="text-lg text-audifyx-purple">≈ ${(userPoints / 100).toFixed(2)} USD</p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Minimum withdrawal: 4,000 points ($40)</p>
                  </div>

                  <form onSubmit={handleSubmitRequest} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">
                          Amount in USD
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <Input
                            type="number"
                            value={payoutAmount}
                            onChange={(e) => setPayoutAmount(e.target.value)}
                            placeholder="0.00"
                            min="40"
                            step="0.01"
                            required
                            className="pl-8 bg-audifyx-charcoal/50"
                          />
                        </div>
                        {payoutAmount && (
                          <p className="text-sm text-gray-400 mt-1">
                            Will use {Math.floor(parseFloat(payoutAmount) * 100)} points
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-sm text-gray-400 block mb-1">
                          Solana Wallet Address
                        </label>
                        <Input
                          type="text"
                          value={walletAddress}
                          onChange={(e) => setWalletAddress(e.target.value)}
                          placeholder="Solana address"
                          required
                          className="bg-audifyx-charcoal/50"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm text-gray-400 block mb-1">
                          Verification Image (Profile Photo)
                        </label>
                        {!imageUrl ? (
                          <div className="flex flex-col items-center justify-center border-2 border-dashed border-audifyx-purple/30 rounded-lg p-6 bg-audifyx-charcoal/30">
                            <Upload className="h-10 w-10 text-audifyx-purple/50 mb-2" />
                            <p className="text-center text-gray-400 mb-4">Upload a verification image</p>
                            <MediaUploader
                              onUpload={handleImageUpload}
                              accept="image/*"
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <div className="relative">
                            <img 
                              src={imageUrl} 
                              alt="Verification" 
                              className="h-40 w-auto object-contain rounded-lg border border-audifyx-purple/30" 
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                setImageUrl('');
                                setVerificationImage(null);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={loading || !imageUrl || userPoints < 4000} 
                      className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                    >
                      {loading ? 'Submitting...' : 'Request Payout'}
                    </Button>
                    
                    {userPoints < 4000 && (
                      <p className="text-sm text-red-400 text-center">
                        You need at least 4,000 points to request a payout
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>

              {/* Admin Dashboard */}
              {isAdmin && (
                <Card className="border-audifyx-purple/20 bg-gradient-card">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                      <Select 
                        value={status}
                        onValueChange={(value) => {
                          setStatus(value);
                        }}
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
                      {requests.length === 0 ? (
                        <div className="text-center p-8 text-gray-400">
                          No payout requests found
                        </div>
                      ) : (
                        requests.map((request) => (
                          <div key={request.id} className="border rounded-lg p-4 border-audifyx-purple/20 bg-audifyx-charcoal/30">
                            <div className="flex justify-between mb-2">
                              <span className="font-semibold">Request #{request.id.substring(0, 8)}</span>
                              {getStatusBadge(request.status)}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div className="space-y-2">
                                <p><span className="text-gray-400">User:</span> {request.profiles?.username || 'Unknown'}</p>
                                <p><span className="text-gray-400">Points:</span> {request.points_amount}</p>
                                <p><span className="text-gray-400">USD:</span> ${request.usd_amount}</p>
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
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
