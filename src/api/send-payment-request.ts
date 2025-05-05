
import { supabase } from '@/integrations/supabase/client';

export async function sendPaymentRequestEmail(payload: {
  username: string;
  pointsRedeemed: number;
  walletAddress: string;
  usdEquivalent: string;
}) {
  try {
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        service_id: 'your_service_id', // Replace with your EmailJS service ID
        template_id: 'payout_request_template', // Replace with your template ID
        user_id: 'your_user_id', // Replace with your EmailJS user ID
        template_params: {
          to_email: 'loops4aiden@gmail.com',
          from_name: 'Audifyx Platform',
          subject: `Payout Request from ${payload.username}`,
          username: payload.username,
          points_redeemed: payload.pointsRedeemed,
          wallet_address: payload.walletAddress,
          usd_equivalent: payload.usdEquivalent,
          message: `User ${payload.username} has requested a payout of ${payload.pointsRedeemed} points (${payload.usdEquivalent} USD) to Solana wallet: ${payload.walletAddress}`
        }
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
