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

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
        <div style="background: #E85D2A; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🐒 Mad Monkey Staff Discount</h1>
          <p style="color: #ffffff; opacity: 0.9; margin: 8px 0 0;">New Pass Issued</p>
        </div>
        <div style="padding: 30px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 20px;">A new staff discount pass has been issued:</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Name</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; text-align: right;">${fullName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Email</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; text-align: right;">${email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee;">Pass Code</td>
              <td style="padding: 10px 0; color: #E85D2A; font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; text-align: right; font-family: monospace;">${code}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px;">Expires</td>
              <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right;">${expiryDate}</td>
            </tr>
          </table>
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
        to: ['theo@theorox.com'],
        subject: `New Staff Pass: ${fullName} (${code})`,
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
