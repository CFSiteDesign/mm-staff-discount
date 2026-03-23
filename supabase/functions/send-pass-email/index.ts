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
    let subject: string;
    let htmlContent: string;

    if (type === 'revoked') {
      subject = `Mad Monkey – Pass Revoked`;
      htmlContent = `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
<div style="background:#E8432E;padding:20px;text-align:center;">
<img src="https://mm-staff-discount.lovable.app/images/mad-monkey-email-logo.png" alt="Mad Monkey" style="height:40px;" />
</div>
<div style="padding:24px;text-align:center;">
${photo ? `<img src="${photo}" alt="" width="90" height="90" style="border-radius:50%;border:3px solid #E8432E;object-fit:cover;display:block;margin:0 auto 12px;" />` : ''}
<p style="margin:0 0 12px;color:#333;font-size:15px;">Hi ${firstName}, your pass <strong>${code}</strong> has been <span style="color:#E8432E;font-weight:bold;">revoked</span>.</p>
${reason ? `<p style="background:#FFF5F0;padding:10px;border-radius:6px;color:#666;font-size:13px;margin:0 0 12px;"><strong>Reason:</strong> ${reason}</p>` : ''}
<p style="color:#999;font-size:12px;margin:0;">Contact your manager if you believe this is an error.</p>
</div>
<div style="background:#f9f9f9;padding:12px;text-align:center;"><p style="color:#bbb;font-size:11px;margin:0;">Powered by TheoroX</p></div>
</div>`;
    } else {
      const expiryDate = new Date(expiresAt).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' });
      subject = `Your Mad Monkey Staff Discount Pass 🐒`;
      htmlContent = `<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee;">
<div style="background:#E8432E;padding:20px;text-align:center;">
<img src="https://mm-staff-discount.lovable.app/images/mad-monkey-email-logo.png" alt="Mad Monkey" style="height:40px;" />
</div>
<div style="padding:24px;text-align:center;border-top:5px solid #F5A623;">
<span style="display:inline-block;background:#F5A623;color:#fff;font-size:10px;font-weight:bold;letter-spacing:2px;padding:5px 12px;border-radius:20px;">CERTIFIED STAFF</span>
${photo ? `<br/><img src="${photo}" alt="" width="100" height="100" style="border-radius:50%;border:3px solid #E8432E;object-fit:cover;display:block;margin:12px auto;" />` : '<br/>'}
<p style="font-size:18px;font-weight:900;text-transform:uppercase;margin:4px 0 2px;color:#333;">${fullName}</p>
<p style="color:#999;font-size:12px;margin:0 0 16px;">${email}</p>
<div style="background:#E8432E;color:#fff;padding:14px;border-radius:8px;font-size:18px;font-weight:900;margin:0 0 16px;">50% FOOD & BEVERAGE</div>
<div style="background:#FFF5F0;border:2px solid #E85D2A;border-radius:8px;padding:12px;margin:0 0 16px;">
<p style="color:#888;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px;">VERIFICATION CODE</p>
<p style="color:#E85D2A;font-size:20px;font-weight:bold;font-family:monospace;margin:0;">${code}</p>
</div>
<p style="color:#666;font-size:13px;margin:0 0 4px;"><strong>Valid Until:</strong> ${expiryDate}</p>
<p style="color:#999;font-size:11px;margin:12px 0 0;">Show at any Mad Monkey location for your staff discount.</p>
</div>
<div style="background:#f9f9f9;padding:12px;text-align:center;"><p style="color:#bbb;font-size:11px;margin:0;">Powered by TheoroX</p></div>
</div>`;
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
