
import { useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Wallet, DollarSign } from "lucide-react";
import { usePointsSystem } from "@/hooks/usePointsSystem";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { sendPaymentRequestEmail } from "@/api/send-payment-request";
import { supabase } from "@/integrations/supabase/client";

export default function PayoutRequest() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { points, earnings, isLoading } = usePointsSystem();
  const { toast } = useToast();
  const [walletAddress, setWalletAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Minimum points required for payout (equivalent to $3)
  const MIN_POINTS_FOR_PAYOUT = 6000;
  const canWithdraw = points >= MIN_POINTS_FOR_PAYOUT;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !walletAddress.trim() || isSubmitting || !canWithdraw) return;
    
    setIsSubmitting(true);
    
    try {
      // Create withdrawal request in database
      const { error } = await supabase.from("withdrawals").insert({
        user_id: user.id,
        amount: earnings,
        status: "pending"
      });
      
      if (error) throw error;
      
      // Send email notification
      const success = await sendPaymentRequestEmail({
        username: user?.user_metadata?.username || "User",
        pointsRedeemed: points,
        walletAddress: walletAddress,
        usdEquivalent: earnings.toFixed(2)
      });
      
      if (!success) throw new Error("Failed to send email notification");
      
      toast({
        title: "Request submitted",
        description: `Your payout request for $${earnings.toFixed(2)} has been submitted and is being processed.`,
      });
      
      // Reset wallet address
      setWalletAddress("");
      
    } catch (error) {
      console.error("Error submitting payout request:", error);
      toast({
        title: "Error",
        description: "Failed to submit payout request. Please try again.",
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
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} p-6`}>
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Withdraw Earnings</h1>
            <p className="text-gray-300 mb-6">Request a payout for your earned points.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm font-medium">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Available Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? "..." : points.toFixed(1)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm font-medium">
                    <Wallet className="mr-2 h-4 w-4" />
                    Earnings (USD)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${isLoading ? "..." : earnings.toFixed(2)}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-sm font-medium">
                    <InfoIcon className="mr-2 h-4 w-4" />
                    Minimum Withdrawal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$3.00</div>
                  <div className="text-xs text-gray-400 mt-1">{MIN_POINTS_FOR_PAYOUT} points</div>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-audifyx-purple-dark/30 border-audifyx-purple/20">
              <CardHeader>
                <CardTitle>Request Payout</CardTitle>
              </CardHeader>
              <CardContent>
                {!canWithdraw && (
                  <Alert className="mb-6 bg-yellow-900/30 border-yellow-600/50">
                    <AlertDescription>
                      You need at least {MIN_POINTS_FOR_PAYOUT} points (${(MIN_POINTS_FOR_PAYOUT / 6000 * 3).toFixed(2)}) to request a payout.
                      You currently have {points.toFixed(1)} points (${earnings.toFixed(2)}).
                    </AlertDescription>
                  </Alert>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <label htmlFor="wallet" className="text-sm font-medium">
                        Phantom Wallet Address
                      </label>
                      <Input
                        id="wallet"
                        placeholder="Enter your Solana wallet address"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        required
                        className="bg-background/10 border-border"
                        disabled={!canWithdraw || isSubmitting}
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                      disabled={!canWithdraw || !walletAddress.trim() || isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : `Request Payout ($${earnings.toFixed(2)})`}
                    </Button>
                  </div>
                </form>
                
                <div className="mt-8 space-y-4 text-sm text-gray-400">
                  <div className="flex items-start gap-2">
                    <InfoIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white mb-1">How payouts work</p>
                      <p>Once you've earned enough points, you can request a payout to your Phantom wallet. Payouts are processed within 5-7 business days.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <InfoIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white mb-1">Points to USD conversion</p>
                      <p>6,000 points = $3.00 USD. Points are paid out in USDC to your connected Phantom wallet.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="mt-6">
              <Button variant="link" className="text-audifyx-purple p-0">
                Learn more about our creator earnings program
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
