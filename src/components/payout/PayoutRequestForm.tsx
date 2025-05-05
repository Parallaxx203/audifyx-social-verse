
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertTriangle, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { usePointsSystem } from '@/hooks/usePointsSystem';
import { MediaUploader } from '@/components/ui/media-uploader';
import { sendPaymentRequestEmail } from '@/api/send-payment-request';

export function PayoutRequestForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { points, earnings } = usePointsSystem();
  
  const [walletAddress, setWalletAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'verified' | 'failed'>('idle');
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [identityUrl, setIdentityUrl] = useState<string | null>(null);
  
  const minPointsRequired = 4000;
  const isEligible = points >= minPointsRequired;
  
  // Check for existing pending requests
  useEffect(() => {
    if (user) {
      fetchPendingRequests();
      checkVerificationStatus();
    }
  }, [user]);
  
  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };
  
  const checkVerificationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified, verification_document')
        .eq('id', user!.id)
        .single();
      
      if (error) throw error;
      
      if (data.is_verified) {
        setVerificationStatus('verified');
      } else if (data.verification_document) {
        setVerificationStatus('pending');
        setIdentityUrl(data.verification_document);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    }
  };
  
  const handleVerificationUpload = async (url: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          verification_document: url,
          verification_submitted_at: new Date().toISOString()
        })
        .eq('id', user!.id);
      
      if (error) throw error;
      
      setVerificationStatus('pending');
      setIdentityUrl(url);
      
      toast({
        title: 'Verification submitted',
        description: 'Your identity verification is being reviewed.',
      });
    } catch (error) {
      console.error('Error uploading verification:', error);
      toast({
        title: 'Verification failed',
        description: 'There was a problem submitting your verification.',
        variant: 'destructive',
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEligible) {
      toast({
        title: 'Not eligible',
        description: `You need at least ${minPointsRequired} points to request a payout.`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!walletAddress) {
      toast({
        title: 'Missing information',
        description: 'Please provide a wallet address.',
        variant: 'destructive',
      });
      return;
    }
    
    if (verificationStatus !== 'verified') {
      toast({
        title: 'Verification required',
        description: 'You need to complete identity verification first.',
        variant: 'destructive',
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Convert points to USD (example rate: 1000 points = $0.50)
      const usdEquivalent = (points / 2000).toFixed(2);
      
      const success = await sendPaymentRequestEmail({
        username: user?.user_metadata?.username || '',
        pointsRedeemed: points,
        walletAddress,
        usdEquivalent
      });
      
      if (!success) throw new Error('Failed to submit request');
      
      toast({
        title: 'Request submitted',
        description: 'Your payout request has been submitted successfully.',
      });
      
      // Fetch updated pending requests
      await fetchPendingRequests();
      
    } catch (error) {
      console.error('Error submitting payout request:', error);
      toast({
        title: 'Request failed',
        description: 'There was a problem submitting your request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  // For demonstrating file upload
  const handleFileUpload = (file: File) => {
    // This is handled by onUploadComplete
    console.log('File selected:', file.name);
  };
  
  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20">
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>
            Convert your points to cryptocurrency and withdraw to your wallet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-audifyx-purple/10 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Your Points</p>
                <p className="text-2xl font-bold">{points.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Value</p>
                <p className="text-2xl font-bold">${earnings.toFixed(2)}</p>
              </div>
            </div>
            
            {/* Eligibility Status */}
            <div className="flex items-center gap-2">
              {isEligible ? (
                <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                  Eligible for payout
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                  {minPointsRequired - points} more points needed
                </Badge>
              )}
            </div>
            
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <p className="text-sm font-medium text-amber-400">
                    You have {pendingRequests.length} pending payout request{pendingRequests.length > 1 ? 's' : ''}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Your request is being processed. This typically takes 3-5 business days.
                </p>
              </div>
            )}
            
            {/* Verification Status */}
            <div className="border border-audifyx-purple/20 rounded-lg p-4">
              <h3 className="font-medium mb-3">Identity Verification</h3>
              
              {verificationStatus === 'verified' ? (
                <div className="flex items-center text-green-400 gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <p className="text-sm">Verified</p>
                </div>
              ) : verificationStatus === 'pending' ? (
                <div className="space-y-3">
                  <div className="flex items-center text-amber-400 gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p className="text-sm">Verification in progress</p>
                  </div>
                  {identityUrl && (
                    <div className="bg-audifyx-purple/10 rounded p-2 text-xs text-center">
                      Document submitted
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Please upload a valid ID document to verify your identity.
                  </p>
                  <MediaUploader 
                    accept="image/*,.pdf" 
                    onUpload={handleFileUpload}
                    userId={user?.id || ''} 
                    onUploadComplete={handleVerificationUpload}
                    allowedTypes="image"
                    buttonText="Upload ID Document"
                  />
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wallet">Crypto Wallet Address</Label>
                <Input
                  id="wallet"
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-audifyx-charcoal/50"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                disabled={!isEligible || submitting || pendingRequests.length > 0 || verificationStatus !== 'verified' || !walletAddress}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Request Payout'
                )}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-audifyx-purple/20 pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Payouts are processed within 3-5 business days after approval.
            <br />
            A valid ID verification is required for all payouts.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
