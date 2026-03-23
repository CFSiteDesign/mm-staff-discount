import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }

    const { fullName, email, code, expiresAt } = await req.json();

    if (!fullName || !email || !code) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const expiryDate = new Date(expiresAt).toLocaleDateString('en-AU', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const firstName = fullName.split(' ')[0];

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: #E85D2A; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🐒 Mad Monkey Staff Discount</h1>
          <p style="color: #ffffff; opacity: 0.9; margin: 8px 0 0;">Your Digital Pass</p>
        </div>
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hey ${firstName}! 👋 Your staff discount pass is ready.</p>
          <div style="background: #FFF5F0; border: 2px solid #E85D2A; border-radius: 10px; padding: 20px; text-align: center; margin: 0 0 20px;">
            <p style="color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Your Pass Code</p>
            <p style="color: #E85D2A; font-size: 24px; font-weight: bold; font-family: monospace; margin: 0;">${code}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Name</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; text-align: right;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Valid Until</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; text-align: right;">${expiryDate}</td>
            </tr>
          </table>
          <p style="color: #999; font-size: 13px; margin: 20px 0 0; line-height: 1.5;">Show this email or your digital pass at any Mad Monkey location to receive your staff discount.</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">Powered by TheoroX</p>
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mad Monkey <madmonkey@theorox.com>',
        to: [email],
        subject: `Your Mad Monkey Staff Discount Pass 🐒`,
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(data)}`);
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error sending email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
