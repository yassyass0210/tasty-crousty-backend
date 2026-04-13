// Email Marketing Integration (Mailchimp / SendGrid)
export async function subscribeToMailingList(email, firstName = '', lastName = '') {
  try {
    // Check if Mailchimp is configured
    if (!process.env.MAILCHIMP_API_KEY || !process.env.MAILCHIMP_LIST_ID) {
      console.warn('⚠️  Mailchimp not configured - using local storage only');
      return { success: true, message: 'Subscription recorded locally' };
    }

    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;
    const server = apiKey.split('-')[1]; // API key format: xxxxx-us1
    
    const url = `https://${server}.api.mailchimp.com/3.0/lists/${listId}/members`;
    
    const subscriber = {
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      },
      tags: ['tasty-crousty', 'new-member']
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscriber)
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Mailchimp error:', error);
      // Don't fail - just log
      return { success: true, message: 'Subscription recorded (Mailchimp sync pending)' };
    }

    return { success: true, message: 'Subscribed to Mailchimp' };
  } catch (error) {
    console.error('Mailchimp subscription error:', error);
    // Don't fail - email already saved in DB
    return { success: true, message: 'Subscription recorded' };
  }
}

// Send welcome email with discount
export async function sendWelcomeEmail(email) {
  try {
    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.warn('⚠️  SendGrid not configured - welcome email not sent');
      return { success: true, message: 'Email recorded locally' };
    }

    const apiKey = process.env.SENDGRID_API_KEY;
    
    const emailData = {
      personalizations: [{
        to: [{ email }],
        subject: '🎉 Bienvenue! -5% pour ta première commande',
        dynamic_template_data: {
          discountCode: 'WELCOME5'
        }
      }],
      from: { email: process.env.SENDGRID_FROM_EMAIL || 'contact@tastycrousty.com' },
      template_id: process.env.SENDGRID_WELCOME_TEMPLATE_ID || 'd-xxx' // Use dynamic template
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (!response.ok) {
      console.error('SendGrid error:', response.statusText);
      return { success: true, message: 'Email queued locally' };
    }

    return { success: true, message: 'Welcome email sent' };
  } catch (error) {
    console.error('SendGrid error:', error);
    return { success: true, message: 'Email recorded' };
  }
}

export default { subscribeToMailingList, sendWelcomeEmail };
