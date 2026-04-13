import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export async function sendConfirmationEmail(order) {
  try {
    const cartHTML = order.cart?.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">
          ${item.name} (Taille ${item.size})
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
          ${item.price.toFixed(2).replace('.', ',')} €
        </td>
      </tr>
    `).join('') || '';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ff1493 0%, #8b5cf6 50%, #00d9ff 100%); padding: 2rem; color: white; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0;">✅ Commande confirmée !</h1>
        </div>
        
        <div style="background: #f9f9f9; padding: 2rem; border-radius: 0 0 8px 8px;">
          <p>Bonjour ${order.firstName || 'Client'},</p>
          <p>Merci pour ta commande ! Ton paiement a été confirmé avec succès.</p>
          
          <h3 style="color: #ff1493; margin-top: 2rem;">Détails de la commande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              ${cartHTML}
              <tr style="font-weight: bold;">
                <td style="padding: 12px; text-align: right;">Total :</td>
                <td style="padding: 12px; text-align: right; color: #ff1493;">
                  ${order.amount.toFixed(2).replace('.', ',')} €
                </td>
              </tr>
            </tbody>
          </table>

          <h3 style="color: #00d9ff; margin-top: 2rem;">Prochaines étapes</h3>
          <ul style="color: #666;">
            <li>Nous préparons ton colis 📦</li>
            <li>Tu recevras un email de suivi dans 24-48h</li>
            <li>Livraison gratuite à partir de 60€ ✓</li>
          </ul>

          <p style="color: #666; font-size: 12px; margin-top: 2rem; border-top: 1px solid #ddd; padding-top: 1rem;">
            Des questions ? Contacte-nous: contact@tastycrousty.com<br>
            Référence commande: <strong>${order._id}</strong>
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: order.email,
      subject: '✅ Commande confirmée - Tasty Crousty × Skibiditentation',
      html
    });

    console.log(`✓ Email envoyé à ${order.email}`);
  } catch (error) {
    console.error('Email error:', error);
  }
}
