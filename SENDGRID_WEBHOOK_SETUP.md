# SendGrid Webhook Setup Instructions

To enable email tracking (delivery, opens, clicks, bounces), you need to configure SendGrid webhooks:

## 1. Get Your Webhook URL
Your webhook URL is: `https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/sendgrid-webhook`

## 2. Configure SendGrid Webhook
1. Go to https://app.sendgrid.com/settings/mail_settings
2. Navigate to **Settings > Mail Settings > Event Webhook**
3. Click **Create New Webhook**
4. Set the following:
   - **Webhook URL**: `https://ldgrcodffsalkevafbkb.supabase.co/functions/v1/sendgrid-webhook`
   - **HTTP Method**: POST
   - **Events to Track**: Select all events:
     - ✅ Delivered
     - ✅ Opened  
     - ✅ Clicked
     - ✅ Bounced
     - ✅ Dropped
     - ✅ Spam Report
     - ✅ Unsubscribe
     - ✅ Deferred
   - **Webhook Status**: Enabled

## 3. Test the Webhook
After setup, SendGrid will send test events to verify the webhook is working.

## 4. Verify Setup
- Send a test email
- Check if status updates from "sent" to "delivered" when received
- Open the email to see if "opened" status is tracked
- Click any links to see if "clicked" status is tracked

## Troubleshooting
- Make sure the webhook URL is exactly as shown above
- Ensure all event types are selected
- Webhook must be enabled in SendGrid settings
- Check the edge function logs for any errors

Without this webhook setup, emails will remain in "sent" status and no analytics will be tracked.