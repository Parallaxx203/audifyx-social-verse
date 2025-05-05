
import { supabase } from '@/integrations/supabase/client';

export async function sendPaymentRequestEmail(payload: {
  username: string;
  pointsRedeemed: number;
  walletAddress: string;
  usdEquivalent: string;
}) {
  try {
    // In a real implementation, this would send an actual email
    // For now, we'll just log the request and simulate success
    console.log("Payment request received:", payload);
    
    // Create a record in the database for tracking
    const { error } = await supabase.from("withdrawals").insert({
      user_id: (await supabase.auth.getUser()).data.user?.id,
      amount: parseFloat(payload.usdEquivalent),
      status: "pending"
    });
    
    if (error) {
      console.error("Error logging withdrawal request:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
