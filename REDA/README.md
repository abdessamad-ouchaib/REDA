# 🛒 تغذية عامة رضا — Site web du magasin

Site complet pour le magasin **تغذية عامة رضا** :
- **Frontend** (`/frontend`) : site public en HTML/CSS/JS (RTL, arabe) avec les onglets **الرئيسية / من نحن / منتجاتنا / أثمنتنا / موقعنا / تواصل معنا**, + une page admin (`admin.html`) protégée par mot de passe pour **ajouter / modifier / supprimer** les produits.
- **Backend** (`/backend`) : API Node.js + Express + MongoDB qui stocke les produits et gère la connexion admin (JWT).

Aucune connaissance technique avancée n'est requise pour le déploiement : suivez les étapes dans l'ordre.

---

## 0. Ce qu'il vous faut avant de commencer

- Un compte **GitHub** (gratuit) → https://github.com/signup
- Un compte **MongoDB Atlas** (gratuit) → https://www.mongodb.com/cloud/atlas/register
- Un compte **Render** (gratuit) → https://render.com
- Un compte **Vercel** (gratuit) → https://vercel.com
- **Node.js** installé sur votre ordinateur si vous voulez tester en local → https://nodejs.org

> Note sur la base de données : vous avez mentionné "Noem" ou Firebase. J'ai construit ce projet avec **MongoDB Atlas**, qui est le choix standard et gratuit pour ce type de site (Node.js + Express + Render). C'est probablement ce que vous vouliez dire par "Noem" (MongoDB). Si vous préférez vraiment Firebase, dites-le-moi : la structure changerait (Firestore + Firebase Auth) mais le principe reste similaire.

---

## 1. Tester le site sur votre ordinateur (optionnel mais recommandé)

### 1.1 Backend
```bash
cd backend
npm install
cp .env.example .env
```
Ouvrez `.env` et remplissez au minimum `MONGODB_URI` (étape 3 ci-dessous) et `JWT_SECRET` (n'importe quelle phrase longue).

```bash
npm run seed     # crée le compte admin + quelques produits de démo
npm run dev       # démarre le serveur sur http://localhost:5000
```

### 1.2 Frontend
Ouvrez simplement `frontend/index.html` dans votre navigateur (double-clic), ou utilisez l'extension "Live Server" de VS Code. Le fichier `frontend/js/config.js` pointe déjà vers `http://localhost:5000/api`, donc tout fonctionnera directement avec le backend local.

Pour entrer dans l'admin : ouvrez `frontend/admin.html`, identifiant/mot de passe = ceux définis dans `.env` (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).

---

## 2. Mettre le projet sur GitHub

```bash
cd REDA              # le dossier que vous avez dézippé
git init
git add .
git commit -m "Premier envoi du site تغذية عامة رضا"
```

1. Allez sur https://github.com/new
2. Nom du dépôt : `reda-store` (ou ce que vous voulez), laissez-le **Public** ou **Private**, ne cochez aucune case d'initialisation.
3. Cliquez sur **Create repository**.
4. GitHub vous donne des commandes du type :
```bash
git remote add origin https://github.com/VOTRE_NOM/reda-store.git
git branch -M main
git push -u origin main
```
Collez-les dans votre terminal, dans le dossier `REDA`.

✅ Votre code est maintenant sur GitHub.

---

## 3. Créer la base de données (MongoDB Atlas — gratuit)

1. Connectez-vous sur https://cloud.mongodb.com
2. Créez un nouveau projet, puis cliquez sur **Build a Database** → choisissez l'offre **gratuite (M0)**.
3. Choisissez une région proche (ex: Europe), nommez le cluster (ex: `reda-cluster`), créez.
4. **Sécurité réseau** : dans *Network Access*, cliquez **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) — nécessaire pour que Render puisse se connecter.
5. **Utilisateur de base de données** : dans *Database Access*, créez un utilisateur (ex: `redaAdmin`) avec un mot de passe — **notez-le**.
6. Retournez sur le cluster → **Connect** → **Drivers** → copiez l'URL de connexion, qui ressemble à :
   ```
   mongodb+srv://redaAdmin:<password>@reda-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Remplacez `<password>` par votre vrai mot de passe, et ajoutez le nom de la base après `.net/` :
   ```
   mongodb+srv://redaAdmin:VotreMotDePasse@reda-cluster.xxxxx.mongodb.net/reda_store?retryWrites=true&w=majority
   ```
   → C'est cette ligne que vous mettrez dans `MONGODB_URI`.

---

## 4. Déployer le backend sur Render

1. Allez sur https://dashboard.render.com → **New +** → **Web Service**.
2. Connectez votre compte GitHub et choisissez le dépôt `reda-store`.
3. Renseignez :
   - **Name** : `reda-backend`
   - **Root Directory** : `backend`
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
   - **Plan** : Free
4. Dans **Environment Variables**, ajoutez :
   | Clé | Valeur |
   |---|---|
   | `MONGODB_URI` | votre lien Atlas de l'étape 3 |
   | `JWT_SECRET` | une longue phrase aléatoire |
   | `ADMIN_USERNAME` | l'identifiant que vous voulez |
   | `ADMIN_PASSWORD` | le mot de passe que vous voulez |
   | `FRONTEND_URL` | (à remplir après l'étape 5, ex: `https://reda-store.vercel.app`) |
5. Cliquez **Create Web Service**. Render installe et démarre votre API (~2-3 min). Vous obtenez une URL du type :
   ```
   https://reda-backend.onrender.com
   ```
6. **Créez le compte admin** une seule fois : dans Render, ouvrez l'onglet **Shell** de votre service et lancez :
   ```bash
   npm run seed
   ```
   (ou faites-le en local en pointant `.env` vers la même base Atlas).

> ⚠️ Le plan gratuit de Render "s'endort" après 15 minutes d'inactivité ; la première requête après une pause peut prendre 30-50 secondes.

---

## 5. Déployer le frontend sur Vercel

D'abord, modifiez **une seule ligne** dans votre projet avant de déployer :

Ouvrez `frontend/js/config.js` et remplacez :
```js
const API_BASE_URL = "http://localhost:5000/api";
```
par l'URL Render obtenue à l'étape 4 :
```js
const API_BASE_URL = "https://reda-backend.onrender.com/api";
```
Puis enregistrez, et renvoyez le changement sur GitHub :
```bash
git add .
git commit -m "Connexion au backend Render"
git push
```

Maintenant sur Vercel :
1. Allez sur https://vercel.com/new
2. Importez le dépôt `reda-store`.
3. **Root Directory** : sélectionnez `frontend`.
4. Framework Preset : **Other** (site statique, aucune configuration de build nécessaire).
5. Cliquez **Deploy**.
6. Vous obtenez une URL du type `https://reda-store.vercel.app`.

✅ Retournez sur Render → variables d'environnement de `reda-backend` → mettez à jour `FRONTEND_URL` avec cette URL Vercel exacte, puis **Manual Deploy → Redeploy**.

---

## 6. Utiliser le site

- **Site public** : `https://reda-store.vercel.app`
- **Espace admin** : `https://reda-store.vercel.app/admin.html` (lien discret en bas à gauche du site "🔐 دخول المسؤول")
  - Identifiant / mot de passe = ceux définis dans Render (`ADMIN_USERNAME` / `ADMIN_PASSWORD`)
  - Depuis cette page vous pouvez **ajouter, modifier et supprimer** des produits (nom, catégorie, prix, unité, description, image, disponibilité). Les changements apparaissent immédiatement sur le site public (sections "منتجاتنا" et "أثمنتنا").

---

## 7. Personnaliser le site

| Élément | Où le modifier |
|---|---|
| Logo / couleurs | `frontend/css/style.css` (variables en haut du fichier `:root{...}`) |
| Adresse, téléphone, horaires | `frontend/index.html`, sections "موقعنا" et "تواصل معنا" |
| Carte Google Maps | `frontend/index.html`, balise `<iframe src="https://www.google.com/maps?q=...">` — remplacez par l'adresse exacte de votre magasin |
| Liens WhatsApp / Facebook / Instagram | `frontend/index.html`, section "تواصل معنا" |
| Photos de la devanture / rayons | dossier `frontend/images/` (remplacez `storefront.jpg`, `shelf-1.jpg`, etc. en gardant les mêmes noms, ou changez les chemins dans `index.html`) |
| Catégories de produits | `backend/models/Product.js` (liste `enum`) ET `frontend/admin.html` (liste `<select>`) — gardez les deux synchronisées |

---

## 8. Structure du projet

```
REDA/
├── backend/
│   ├── models/Product.js       → schéma d'un produit
│   ├── models/Admin.js         → schéma du compte admin
│   ├── routes/auth.js          → connexion admin (JWT)
│   ├── routes/products.js      → API produits (GET public, POST/PUT/DELETE protégés)
│   ├── middleware/auth.js      → vérifie le token avant modification
│   ├── server.js               → point d'entrée du serveur
│   ├── seed.js                 → crée le compte admin + produits de démo
│   ├── .env.example            → modèle des variables d'environnement
│   └── package.json
├── frontend/
│   ├── index.html              → site public
│   ├── admin.html              → tableau de bord admin
│   ├── css/style.css           → style du site public
│   ├── css/admin.css           → style de l'admin
│   ├── js/config.js            → ⚠️ adresse de l'API (à modifier une fois le backend en ligne)
│   ├── js/main.js              → logique du site public
│   ├── js/admin.js             → logique de l'admin (connexion, CRUD)
│   └── images/                 → photos du magasin
└── README.md                   → ce fichier
```

---

## 9. Sécurité — à ne pas oublier

- Changez `ADMIN_PASSWORD` et `JWT_SECRET` pour des valeurs fortes avant la mise en ligne réelle.
- Ne partagez jamais votre fichier `.env` ni ne le poussez sur GitHub (il est déjà ignoré par `.gitignore`).
- Le lien admin est volontairement discret mais reste accessible publiquement (`/admin.html`) — la sécurité repose sur le mot de passe, donc choisissez-en un robuste.

Bonne mise en ligne pour تغذية عامة رضا ! 🛒
