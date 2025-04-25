
// Type definitions for the email request
export interface PaymentRequestEmail {
  to: string;
  points: number;
  amount: number;
  screenshotUrl: string;
  userId: string;
}

// This would be implemented as a Supabase edge function
// Since we've installed nodemailer, this file just contains the interface
// The actual email sending would be handled by a Supabase edge function
export async function sendPaymentRequestEmail(data: PaymentRequestEmail): Promise<boolean> {
  try {
    // In a real implementation, we would call a Supabase edge function here
    console.log('Would send email with data:', data);
    return true;
  } catch (error) {
    console.error('Error sending payment request email:', error);
    return false;
  }
}
