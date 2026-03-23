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

    const { fullName, email, code, expiresAt, type, reason, photo } = await req.json();

    if (!fullName || !email || !code) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const firstName = fullName.split(' ')[0];
    const photoHtml = photo ? `<img src="${photo}" alt="${fullName}" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid #E8432E; object-fit: cover; display: block; margin: 0 auto 16px;" />` : '';
    let subject: string;
    let htmlContent: string;

    if (type === 'revoked') {
      subject = `Your Mad Monkey Staff Discount Pass Has Been Revoked`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: #E8432E; padding: 30px; text-align: center;">
            <img src="https://mm-staff-discount.lovable.app/images/mad-monkey-email-logo.png" alt="Mad Monkey" style="height: 50px; margin-bottom: 12px;" />
            <p style="color: #ffffff; opacity: 0.9; margin: 0; font-size: 14px;">Staff Discount Pass</p>
          </div>
          <div style="padding: 30px; text-align: center;">
            ${photoHtml}
            <p style="color: #333; font-size: 16px; margin: 0 0 20px;">Hi ${firstName},</p>
            <p style="color: #333; font-size: 15px; margin: 0 0 20px;">Your staff discount pass <strong style="font-family: monospace;">${code}</strong> has been <span style="color: #E8432E; font-weight: bold;">revoked</span>.</p>
            ${reason ? `<div style="background: #FFF5F0; border-left: 4px solid #E8432E; padding: 15px; margin: 0 0 20px; border-radius: 4px; text-align: left;"><p style="color: #666; font-size: 13px; margin: 0;"><strong>Reason:</strong> ${reason}</p></div>` : ''}
            <p style="color: #666; font-size: 14px; margin: 0 0 20px; line-height: 1.5;">This pass is no longer valid. If you believe this is an error, please contact your manager.</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">Powered by TheoroX</p>
          </div>
        </div>
      `;
    } else {
      const expiryDate = new Date(expiresAt).toLocaleDateString('en-AU', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
      const issuedDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      subject = `Your Mad Monkey Staff Discount Pass 🐒`;
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden;">
          <div style="background: #E8432E; padding: 30px; text-align: center;">
            <img src="https://mm-staff-discount.lovable.app/images/mad-monkey-email-logo.png" alt="Mad Monkey" style="height: 50px; margin-bottom: 12px;" />
            <p style="color: #ffffff; opacity: 0.9; margin: 0; font-size: 14px;">Staff Discount Pass</p>
          </div>
          <div style="padding: 30px; text-align: center; border-top: 6px solid #F5A623;">
            <div style="display: inline-block; background: #F5A623; color: #ffffff; font-size: 11px; font-weight: bold; letter-spacing: 2px; padding: 6px 14px; border-radius: 20px; margin: 0 0 20px;">CERTIFIED STAFF</div>
            <br/>
            ${photoHtml}
            <h2 style="font-size: 22px; font-weight: 900; text-transform: uppercase; margin: 0 0 4px; color: #333;">${fullName}</h2>
            <p style="color: #999; font-size: 13px; margin: 0 0 20px;">${email}</p>
            <div style="background: #E8432E; color: #ffffff; padding: 16px 20px; border-radius: 10px; font-size: 20px; font-weight: 900; margin: 0 0 20px;">50% FOOD & BEVERAGE</div>
            <div style="background: #FFF5F0; border: 2px solid #E85D2A; border-radius: 10px; padding: 16px; margin: 0 0 20px;">
              <p style="color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px;">UNIQUE VERIFICATION CODE</p>
              <p style="color: #E85D2A; font-size: 22px; font-weight: bold; font-family: monospace; margin: 0;">${code}</p>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin: 0 0 16px;">
              <tr>
                <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee; text-align: left;">Name</td>
                <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; text-align: right;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-size: 14px; border-bottom: 1px solid #eee; text-align: left;">Valid Until</td>
                <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; border-bottom: 1px solid #eee; text-align: right;">${expiryDate}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #666; font-size: 14px; text-align: left;">Issued</td>
                <td style="padding: 10px 0; color: #333; font-size: 14px; font-weight: bold; text-align: right;">${issuedDate}</td>
              </tr>
            </table>
            <p style="color: #999; font-size: 12px; margin: 0; line-height: 1.5;">Show this email or your digital pass at any Mad Monkey location worldwide to receive your staff discount.</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">Powered by TheoroX</p>
          </div>
        </div>
      `;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Mad Monkey <madmonkey@verify.theorox.com>',
        to: [email],
        subject,
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
