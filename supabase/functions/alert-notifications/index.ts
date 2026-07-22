import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    // Support testing payload vs Database Webhook payload structure
    const record = payload.record || payload;

    // Only process critical alerts
    if (record.severity !== "critical") {
      return new Response(JSON.stringify({ message: "Ignored, alert is not critical" }), { headers: corsHeaders });
    }

    const { event_type, description, city } = record;

    // Load credentials from environment
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioFrom = Deno.env.get("TWILIO_FROM_NUMBER");
    const twilioTo = Deno.env.get("ALERT_PHONE_NUMBER");

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const alertEmail = Deno.env.get("ALERT_EMAIL_ADDRESS");

    const promises = [];
    const results = { sms: "skipped", email: "skipped" };

    // 1. Dispatch Twilio SMS
    if (twilioAccountSid && twilioAuthToken && twilioFrom && twilioTo) {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
      const formData = new URLSearchParams();
      formData.append("To", twilioTo);
      formData.append("From", twilioFrom);
      formData.append("Body", `GRID CRITICAL ALERT: ${event_type} at ${city || 'System'}. ${description}`);

      promises.push(
        fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": "Basic " + btoa(`${twilioAccountSid}:${twilioAuthToken}`)
          },
          body: formData.toString()
        })
        .then(res => res.json())
        .then(data => { 
          results.sms = data; 
          console.log("Twilio response:", data);
        })
        .catch(e => { console.error("Twilio error:", e); results.sms = "error"; })
      );
    } else {
      console.log("Missing Twilio configuration. SMS skipped.");
    }

    // 2. Dispatch Email (using Resend API for simple, robust delivery vs raw SMTP)
    if (resendApiKey && alertEmail) {
      promises.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "onboarding@resend.dev",
            to: [alertEmail],
            subject: `CRITICAL ALERT: ${event_type}`,
            html: `<h3>GridPulse Critical Alert</h3>
                   <p><strong>Type:</strong> ${event_type}</p>
                   <p><strong>City:</strong> ${city}</p>
                   <p><strong>Details:</strong> ${description}</p>
                   <br><p><em>This is an automated message from the GridPulse Operations Center.</em></p>`
          })
        })
        .then(res => res.json())
        .then(data => { 
          results.email = data;
          console.log("Resend response:", data);
        })
        .catch(e => { console.error("Resend error:", e); results.email = "error"; })
      );
    } else {
      console.log("Missing Email/SMTP configuration. Email skipped.");
    }

    await Promise.all(promises);

    return new Response(JSON.stringify({ success: true, results }), { headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
