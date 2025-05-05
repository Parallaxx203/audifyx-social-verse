
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Loader2, DollarSign, Wallet } from "lucide-react";
import { usePointsSystem } from "@/hooks/usePointsSystem";

export default function PayoutRequest() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { points, earnings, isLoading } = usePointsSystem();
  
  const [requestAmount, setRequestAmount] = useState("");
  const [solanaWallet, setSolanaWallet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userImage, setUserImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUserImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const calculateUsdValue = (pointsValue: number) => {
    return (pointsValue / 6000) * 3;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to request a payout",
        variant: "destructive"
      });
      return;
    }
    
    if (!userImage) {
      toast({
        title: "Profile image required",
        description: "Please upload a profile image for verification",
        variant: "destructive"
      });
      return;
    }
    
    if (!solanaWallet) {
      toast({
        title: "Wallet address required",
        description: "Please provide your Solana wallet address",
        variant: "destructive"
      });
      return;
    }
    
    const amountValue = parseFloat(requestAmount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    if (amountValue > points) {
      toast({
        title: "Insufficient points",
        description: "You don't have enough points for this withdrawal",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload verification image
      const filename = `${Date.now()}_${user.id}_verification.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("verification")
        .upload(filename, userImage);
      
      if (uploadError) throw uploadError;
      
      const imageUrl = supabase.storage.from("verification").getPublicUrl(filename).data.publicUrl;
      
      // Create withdrawal request
      const { error: withdrawalError } = await supabase
        .from("withdrawals")
        .insert({
          user_id: user.id,
          amount: amountValue,
          status: "pending",
          wallet_address: solanaWallet,
          verification_image: imageUrl
        });
      
      if (withdrawalError) throw withdrawalError;
      
      // Send email notification
      await fetch('/api/send-payment-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.user_metadata?.username || user.email,
          pointsRedeemed: amountValue,
          walletAddress: solanaWallet,
          usdEquivalent: calculateUsdValue(amountValue).toFixed(2)
        }),
      });
      
      toast({
        title: "Request submitted!",
        description: "Your payout request has been submitted successfully. We'll process it soon!"
      });
      
      // Reset form
      setRequestAmount("");
      setSolanaWallet("");
      setUserImage(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error("Error submitting withdrawal request:", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-audifyx text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? "ml-0" : "ml-64"} p-6`}>
          <div className="max-w-lg mx-auto space-y-8">
            <div>
              <h1 className="text-3xl font-bold">Request Payout</h1>
              <p className="text-gray-400">Convert your points to real money</p>
            </div>
            
            <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
              <CardHeader>
                <CardTitle>Your Current Balance</CardTitle>
                <CardDescription>Conversion rate: 6000 points = $3.00</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-8 w-8 animate-spin text-audifyx-purple" />
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-4 bg-audifyx-purple/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-400">Total Points</p>
                      <p className="text-2xl font-bold">{points.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Estimated Value</p>
                      <p className="text-2xl font-bold text-green-500">${earnings.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-audifyx-purple-dark/50 border-audifyx-purple/30">
              <CardHeader>
                <CardTitle>Request Withdrawal</CardTitle>
                <CardDescription>
                  Complete this form to request a payout to your Solana wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="verification-image">Upload Profile Image (for verification)</Label>
                    <Input 
                      id="verification-image" 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageChange}
                      required
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img 
                          src={imagePreview} 
                          alt="Profile verification" 
                          className="w-24 h-24 object-cover rounded-full mx-auto border-2 border-audifyx-purple" 
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="points-amount">Points to Redeem</Label>
                    <div className="relative">
                      <Input 
                        id="points-amount" 
                        type="number" 
                        placeholder="Enter amount" 
                        value={requestAmount} 
                        onChange={(e) => setRequestAmount(e.target.value)}
                        className="pl-8"
                        min="1"
                        max={points.toString()}
                        required
                      />
                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                    {requestAmount && !isNaN(parseFloat(requestAmount)) && (
                      <p className="text-sm text-green-400">
                        ${calculateUsdValue(parseFloat(requestAmount)).toFixed(2)} USD
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="solana-wallet">Solana Wallet Address</Label>
                    <div className="relative">
                      <Input 
                        id="solana-wallet" 
                        type="text" 
                        placeholder="Your Solana wallet address" 
                        value={solanaWallet} 
                        onChange={(e) => setSolanaWallet(e.target.value)}
                        className="pl-8"
                        required
                      />
                      <Wallet className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <CardFooter className="px-0">
                    <Button 
                      type="submit" 
                      className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid" 
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Submit Payout Request"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
