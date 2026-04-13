# Tasty Crousty Backend

Backend Node.js + Express + MongoDB pour gérer les paiements Stripe.

## 🚀 Setup Quick (5 min)

### 1. **MongoDB Atlas** (Cloud gratuit)
- Va sur [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
- Crée un compte gratuit
- Crée un cluster (free tier)
- Copie la connection string: `mongodb+srv://user:pass@cluster.mongodb.net/tastycrousty`

### 2. **Gmail App Password** (pour les emails)
- Va sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Sélectionne "Mail" et "Windows"
- Copie le mot de passe généré (16 caractères)

### 3. **Variables d'environnement** (`.env`)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (À faire après Stripe)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tastycrousty
EMAIL_USER=ton-email@gmail.com
EMAIL_PASSWORD=xxx (App Password)
FRONTEND_URL=http://localhost:3000 (ou ton domaine)
```

### 4. **Installer & Tester**
```bash
npm install
npm run dev
# Serveur sur http://localhost:3001
```

---

## 📦 Déploiement Vercel

### 1. Push sur GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/tasty-crousty-backend
git push -u origin main
```

### 2. Connecter à Vercel
- Va sur [vercel.com](https://vercel.com)
- "New Project" → Importe depuis GitHub
- Ajoute les **Environment Variables** (`.env`)
- Deploy !

### 3. Stripe Webhook
Après le déploiement Vercel:
- Stripe Dashboard → Webhooks
- Ajoute un endpoint: `https://ton-backend.vercel.app/api/webhooks/stripe`
- Events à écouter: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Copie le secret webhook dans `.env` → Redeploy

---

## 🔌 API Endpoints

### POST `/api/create-payment-intent`
```json
{
  "amount": 49.90,
  "email": "client@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "cart": [
    { "id": 1, "name": "Produit", "price": 29.90, "size": "M" }
  ]
}
```

**Response:**
```json
{
  "clientSecret": "pi_xxx#secret_xxx",
  "orderId": "507f1f77bcf86cd799439011"
}
```

### POST `/api/confirm-payment`
```json
{
  "paymentIntentId": "pi_xxx",
  "orderId": "507f1f77bcf86cd799439011"
}
```

---

## 📝 Notes

- ✅ Ajouter les headers CORS correct dans le frontend
- ✅ Utiliser les clés **test** avant d'aller en production
- ✅ Sauvegarder les variables `.env` de manière sécurisée
- ✅ Tester les webhooks avec `stripe trigger payment_intent.succeeded`

---

**Questions?** contact@tastycrousty.com
