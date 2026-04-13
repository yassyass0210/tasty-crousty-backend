# 🚀 SETUP Guide - Tasty Crousty Backend + Frontend

## 📋 Checklist Rapide

- [ ] MongoDB Atlas (DB)
- [ ] Stripe (Paiements)
- [ ] Twilio (SMS)
- [ ] Mailchimp (Email marketing)
- [ ] SendGrid (Emails transactionnels)
- [ ] Google Analytics (GA4)
- [ ] Tidio (Chatbot)

---

## 1️⃣ MongoDB Atlas (Database)

### Setup:
1. Va sur [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Crée un compte free
3. Crée un **Cluster** (free tier: M0 Sandbox)
4. Va dans **Database Access** → Crée un utilisateur `tastycrousty` / password
5. Va dans **Network Access** → Ajoute `0.0.0.0/0` (allow all)
6. Va dans **Clusters** → **Connect** → Copie la URI:

```
mongodb+srv://tastycrousty:PASSWORD@cluster.mongodb.net/tastycrousty?retryWrites=true&w=majority
```

Ajoute à `.env`:
```
MONGODB_URI=mongodb+srv://tastycrousty:PASSWORD@cluster.mongodb.net/tastycrousty
```

---

## 2️⃣ Stripe (Paiements)

**Tes clés sont déjà prêtes!**

Ajoute à `.env`:
```
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_test_xxx (À obtenir)
```

### Pour Webhook Secret:
1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Webhooks** → **Add endpoint**
3. URL: `http://localhost:3001/api/webhooks/stripe` (pour dev)
4. Events à écouter: `payment_intent.succeeded`
5. Copie la **Signing secret**

---

## 3️⃣ Twilio (SMS)

### Setup:
1. Va sur [twilio.com](https://twilio.com)
2. Crée un compte
3. Récupère:
   - **Account SID**
   - **Auth Token**
   - **Phone Number** (le tien pour tester)

Ajoute à `.env`:
```
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+33612345678
```

---

## 4️⃣ Mailchimp (Email Marketing)

### Setup:
1. Va sur [mailchimp.com](https://mailchimp.com)
2. Crée un compte
3. **Create Audience** → Configure l'audience "Tasty Crousty"
4. Copy **Audience ID** (dans Settings)
5. **Account Settings** → **Extras** → **API Keys** → Generate

Ajoute à `.env`:
```
MAILCHIMP_API_KEY=xxxxxx-us1
MAILCHIMP_LIST_ID=xxxxx
```

---

## 5️⃣ SendGrid (Emails)

### Setup:
1. Va sur [sendgrid.com](https://sendgrid.com)
2. Crée un compte
3. **Settings** → **API Keys** → Create API Key
4. Copie la clé

Ajoute à `.env`:
```
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=contact@tastycrousty.com
SENDGRID_WELCOME_TEMPLATE_ID=d-xxxxx
```

### Dynamic Template (optionnel):
- Va dans **Transactional Templates**
- Create → Branding personnalisé
- Copy l'ID du template

---

## 6️⃣ Google Analytics (GA4)

### Setup:
1. Va sur [analytics.google.com](https://analytics.google.com)
2. **Create** → **Property** → "Tasty Crousty"
3. **Data Streams** → **Web**
4. Copie **Measurement ID** (format: `G-XXXXXXXXXX`)

### Ajoute au HTML:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 7️⃣ Tidio (Chatbot)

### Setup:
1. Va sur [tidio.com](https://tidio.com)
2. Crée un compte
3. **Channels** → Copie ton **Widget ID** (format: `xxxxxxxxxxxxx`)

### Ajoute au HTML:
```html
<script src="//code.tidio.co/xxxxxxxxxxxxx.js"></script>
```

---

## 🖥️ LOCAL SETUP

### Prérequis:
- Node.js 18+ (`node -v`)
- npm (`npm -v`)

### Étapes:

1. **Clone les fichiers backend:**
```bash
cd c:\Users\mboua\Downloads\backend
```

2. **Crée `.env` avec tes clés:**
```bash
cp .env.example .env
# Puis édite .env avec tes vrais secrets
```

3. **Installe dépendances:**
```bash
npm install
```

4. **Lance le serveur:**
```bash
npm run dev
```

Doit afficher:
```
✓ MongoDB connected
🚀 Server running on http://localhost:3001
```

5. **Teste les endpoints:**

```bash
# Health check
curl http://localhost:3001/api/health

# Stock alert
curl -X POST http://localhost:3001/api/stock-alert \
  -H "Content-Type: application/json" \
  -d '{"prodId": 1, "email": "test@example.com", "productName": "Caleçon TC"}'

# Email signup
curl -X POST http://localhost:3001/api/subscribe-email \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "firstName": "John"}'

# SMS signup
curl -X POST http://localhost:3001/api/subscribe-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+33612345678"}'
```

---

## ☁️ DEPLOYMENT — Vercel

### Frontend:

1. **Crée repo GitHub:**
```bash
# Option 1: Depuis VS Code:
# - Init repo
# - Commit tous les fichiers
# - Push vers GitHub
```

2. **Deploy sur Vercel:**
- Va sur [vercel.com](https://vercel.com)
- Login avec GitHub
- **New Project** → Import le repo
- **Deploy**

URL sera: `https://tastycrousty.vercel.app`

### Backend:

1. **Prépare `.env.production`:**
```
STRIPE_SECRET_KEY=...
MONGODB_URI=...
TWILIO_ACCOUNT_SID=...
(toutes les clés)
```

2. **Deploy sur Vercel:**
- Même repo ou repo séparé
- Ajoute variables d'env dans **Settings** → **Environment Variables**
- Deploy

URL sera: `https://tasty-crousty-backend.vercel.app`

3. **Update HTML frontend:**
```javascript
// Remplace:
const BACKEND_URL = 'http://localhost:3001';
// Par:
const BACKEND_URL = 'https://tasty-crousty-backend.vercel.app';
```

---

## 🧪 TEST COMPLET

### Scénario 1: Ajouter au panier → Payer
1. Ouvre le HTML
2. Clique sur produit → Ajouter au panier
3. Va en checkout
4. Utilise carte test Stripe: `4242 4242 4242 4242` / 12/25 / 123
5. Doit voir "✅ Commande confirmée"

### Scénario 2: Stock Alert
1. Produit page → "🔔 Notifier si en stock"
2. Rentre email
3. Backend doit recevoir POST `/api/stock-alert`
4. Vérifier MongoDB: collection `stockalerts`

### Scénario 3: Email Marketing
1. HOME page → "🎁 -5% pour new members"
2. Rentre email
3. Doit être dans Mailchimp + SendGrid

### Scénario 4: SMS
1. CONTACT page → "📱 + Stock alerts en SMS"
2. Rentre numéro français (+33...)
3. Doit recevoir SMS Twilio

---

## 🚨 Troubleshooting

| Problème | Solution |
|----------|----------|
| MongoDB connection failed | Vérifie MONGODB_URI + IP whitelist (0.0.0.0/0) |
| Stripe payment fails | Vérifie clés + webhook secret |
| SMS ne s'envoie pas | Twilio pas configuré = logs seulement |
| Email ne s'envoie pas | SendGrid pas configuré = logs seulement |
| CORS error | Vérifie FRONTEND_URL dans .env |
| Port 3001 occupied | `lsof -i :3001` puis kill processus |

---

## 📧 Support Contacts

- **Stripe**: support@stripe.com
- **Twilio**: https://support.twilio.com
- **Mailchimp**: https://mailchimp.com/help
- **SendGrid**: https://support.sendgrid.com
- **MongoDB**: https://docs.mongodb.com

---

**Prêt? Lance `npm run dev` et teste! 🚀**
