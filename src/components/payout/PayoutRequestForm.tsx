
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { MediaUploader } from "@/components/ui/media-uploader";
import { supabase } from "@/integrations/supabase/client";
import { Upload, XCircle } from "lucide-react";

interface PayoutRequestFormProps {
  userPoints: number;
  onSuccess: () => void;
}

export function PayoutRequestForm({ userPoints, onSuccess }: PayoutRequestFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [verificationImage, setVerificationImage] = useState<File | null>(null);

  const handleImageUpload = async (file: File) => {
    setVerificationImage(file);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `verification/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('payout-images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('payout-images')
        .getPublicUrl(filePath);
        
      if (data && data.publicUrl) {
        setImageUrl(data.publicUrl);
        toast({
          title: "Success",
          description: "Verification image uploaded successfully"
        });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload verification image",
        variant: "destructive"
      });
    }
  };

  const handleUploadComplete = (url: string) => {
    setImageUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

      const { error } = await supabase.from('withdrawals').insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        amount: parseFloat(payoutAmount),
        status: 'pending',
        wallet_address: walletAddress,
        verification_image: imageUrl
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your payout request has been submitted.'
      });

      setPayoutAmount('');
      setWalletAddress('');
      setImageUrl('');
      setVerificationImage(null);
      onSuccess();

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                Verification Image
              </label>
              {!imageUrl ? (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-audifyx-purple/30 rounded-lg p-6 bg-audifyx-charcoal/30">
                  <Upload className="h-10 w-10 text-audifyx-purple/50 mb-2" />
                  <p className="text-center text-gray-400 mb-4">Upload a verification image</p>
                  <MediaUploader
                    onUploadComplete={handleUploadComplete}
                    allowedTypes="both"
                    userId={(async () => (await supabase.auth.getUser()).data.user?.id || "")()}
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
  );
}
