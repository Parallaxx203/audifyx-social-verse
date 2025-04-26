
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploader } from "@/components/ui/media-uploader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function CreatorHub() {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const [points, setPoints] = useState("");
  const [amount, setAmount] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [paymentRequests, setPaymentRequests] = useState([]);

  const fetchPaymentRequests = async () => {
    try {
      // Since we can't use payment_requests directly, we'll use withdrawals
      // but adapt the query to work with our UI
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
      setPaymentRequests(data || []);
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast({
        title: "Error",
        description: "Failed to load payment requests",
        variant: "destructive"
      });
    }
  };

  const handlePaymentRequest = async () => {
    if (!points || !amount || !screenshotUrl) {
      toast({ 
        title: "Validation Error",
        description: "Please fill all fields and upload screenshot"
      });
      return;
    }

    const pointsNum = parseInt(points);
    const amountNum = parseFloat(amount);

    if (isNaN(pointsNum) || isNaN(amountNum) || pointsNum <= 0 || amountNum <= 0) {
      toast({ 
        title: "Invalid Input",
        description: "Please enter valid numbers for points and amount"
      });
      return;
    }

    try {
      // Use withdrawals table instead of payment_requests
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user?.id,
          amount: parseFloat(amount),
          status: 'pending',
          // Store screenshot URL in verification_image field
          verification_image: screenshotUrl
        });

      if (error) throw error;

      await fetch('/api/send-payment-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'loops4aiden@gmail.com',
          points,
          amount,
          screenshotUrl,
          userId: user?.id
        })
      });

      toast({ title: "Payment request submitted successfully!" });
      setPoints("");
      setAmount("");
      setScreenshotUrl("");
    } catch (error) {
      toast({ title: "Error submitting payment request", variant: "destructive" });
    }
  };

  const handleScreenshotUpload = (url: string) => {
    setScreenshotUrl(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-audifyx-blue/90 to-audifyx-purple text-white">
      <div className="flex">
        <Sidebar />
        <main className={`flex-1 ${isMobile ? 'ml-0' : 'ml-64'} px-4 py-8`}>
          <div className="max-w-5xl mx-auto">
            <Card className="bg-audifyx-purple-dark/70 p-6">
              <CardContent className="space-y-4">
                <h2 className="text-xl font-bold">Request Payment</h2>
                <Input
                  type="number"
                  placeholder="Points Earned"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Amount in USD"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="space-y-2">
                  <label className="text-sm">Upload Earnings Screenshot</label>
                  <MediaUploader
                    onUploadComplete={handleScreenshotUpload}
                    allowedTypes="both"
                    userId={user?.id || ""}
                  />
                </div>
                <Button
                  onClick={handlePaymentRequest}
                  className="w-full bg-audifyx-purple hover:bg-audifyx-purple-vivid"
                >
                  Submit Payment Request
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
