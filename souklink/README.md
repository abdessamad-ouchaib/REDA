# SoukLink — Marketplace de vente entre particuliers

![CI/CD](https://github.com/abdessamad-ouchaib/souklink/actions/workflows/ci.yml/badge.svg)
![Java](https://img.shields.io/badge/Java-21-orange?logo=java)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.5-6DB33F?logo=spring)
![Angular](https://img.shields.io/badge/Angular-17-DD0031?logo=angular)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql)
![Stripe](https://img.shields.io/badge/Stripe-mode_test-635BFF?logo=stripe)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-009688)

> Projet portfolio · Abdessamad Ouchaib · 2026  
> 🔗 **Démo live** : [souklink.vercel.app](https://souklink.vercel.app)  
> Carte de test Stripe : `4242 4242 4242 4242` · Exp : `12/34` · CVC : `123`

---

## 🛒 C'est quoi SoukLink ?

SoukLink est une marketplace web où des particuliers publient des annonces pour vendre des objets (vêtements, électronique, meubles, livres...). Les autres utilisateurs peuvent rechercher, filtrer, discuter avec le vendeur via une messagerie intégrée en temps réel, puis payer en toute sécurité via Stripe.

---

## ✨ Fonctionnalités

| Fonctionnalité | Détails |
|---|---|
| 🔐 Auth JWT | Inscription, connexion, rôles UTILISATEUR / ADMIN |
| 📦 Annonces | CRUD complet, filtres par catégorie / prix / mot-clé, pagination |
| 📸 Photos | Upload multi-photos vers Supabase Storage (max 6 par annonce, max 5 Mo) |
| 💬 Chat temps réel | WebSocket STOMP — messagerie instantanée acheteur/vendeur |
| 💳 Paiement Stripe | Checkout sécurisé + webhook de confirmation (signature Stripe vérifiée) |
| ⭐ Avis | Évaluation vendeur uniquement après transaction confirmée |
| ❤️ Favoris | Ajouter / retirer des annonces en un clic |
| 🛡️ Admin | Suspension de comptes, gestion des catégories |
| 📱 Responsive | Interface adaptée mobile et desktop (Tailwind CSS) |
| ✅ Tests | JUnit 5 + Mockito (services) · Test d'intégration MockMvc |
| 🚀 CI/CD | GitHub Actions — tests auto à chaque push |

---

## 🏗️ Stack technique

| Couche | Technologie |
|---|---|
| Backend | Java 21 + Spring Boot 3.2.5 + Spring Security |
| Frontend | Angular 17 + TypeScript + Tailwind CSS |
| Base de données | PostgreSQL (Supabase — Connection Pooler port 6543) |
| Stockage photos | Supabase Storage (bucket public en lecture) |
| Auth | JWT (jjwt 0.11.5) |
| Paiement | Stripe Checkout + Webhooks (mode test) |
| Chat | WebSocket STOMP (@stomp/stompjs + SockJS) |
| Tests backend | JUnit 5 + Mockito + H2 en mémoire |
| CI/CD | GitHub Actions |
| Hébergement | Render (backend) + Vercel (frontend) |

---

## 🚀 Installation locale

### Prérequis
- Java 21
- Maven 3.9+
- Node.js 20+
- Un compte Supabase (BDD + Storage)
- Un compte Stripe (mode test gratuit)

### Backend

```bash
cd backend

# Copier et remplir les variables d'environnement
cp src/main/resources/application.properties application-local.properties

# Remplir dans application-local.properties :
# spring.datasource.url=jdbc:postgresql://...
# jwt.secret=...
# stripe.secret-key=sk_test_...
# stripe.webhook-secret=whsec_...
# app.frontend-url=http://localhost:4200
# cors.allowed-origins=http://localhost:4200

mvn spring-boot:run
# → API disponible sur http://localhost:8080
# → Swagger UI : http://localhost:8080/swagger-ui.html
```

### Frontend

```bash
cd frontend

npm install

# Dans src/environments/environment.ts, vérifier :
# apiUrl: 'http://localhost:8080/api'
# wsUrl: 'http://localhost:8080/ws/messages'

# Dans src/app/creer-annonce/creer-annonce.component.ts, remplacer :
# SUPABASE_URL = 'https://TON_PROJECT_ID.supabase.co'
# SUPABASE_ANON_KEY = 'TA_CLE_ANON_SUPABASE'

ng serve
# → Application disponible sur http://localhost:4200
```

### Tests

```bash
cd backend
mvn test -Dspring.profiles.active=test
# → Tests avec base H2 en mémoire, sans connexion à Supabase
```

---

## 🗄️ Déploiement

### 1. Supabase — Base de données

1. Sur [supabase.com](https://supabase.com), créer un nouveau projet.
2. Dans **Settings → Database** : copier l'URL du **Connection Pooler** (port 6543).
3. Dans **Storage** : créer un bucket `souklink-photos` en accès **public en lecture**.

### 2. GitHub — Pousser le projet

```bash
# Depuis la racine du projet (dossier souklink/)
git init
git add .
git commit -m "feat: initial SoukLink project"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/souklink.git
git push -u origin main
```

### 3. Render — Backend Spring Boot

1. Sur [render.com](https://render.com), **New → Web Service → Docker**.
2. Connecter le repo GitHub → choisir le dossier `backend/`.
3. Ajouter les **Environment Variables** :

| Variable | Valeur |
|---|---|
| `SPRING_DATASOURCE_URL` | URL Supabase Connection Pooler |
| `SPRING_DATASOURCE_USERNAME` | postgres |
| `SPRING_DATASOURCE_PASSWORD` | Ton mot de passe Supabase |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | update |
| `JWT_SECRET` | Une chaîne secrète longue et aléatoire |
| `STRIPE_SECRET_KEY` | `sk_test_...` (Dashboard Stripe) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (après étape 5 ci-dessous) |
| `APP_FRONTEND_URL` | https://souklink.vercel.app |
| `CORS_ALLOWED_ORIGINS` | https://souklink.vercel.app |

4. Déployer. Note l'URL de ton service (ex: `https://souklink-api.onrender.com`).

### 4. Vercel — Frontend Angular

1. Sur [vercel.com](https://vercel.com), **New Project → Import from GitHub**.
2. Choisir le repo `souklink`, **Root Directory** : `frontend/`.
3. Dans `src/environments/environment.prod.ts`, remplacer l'URL par celle de Render.
4. Déployer.

### 5. Stripe — Configurer le webhook

1. Sur [dashboard.stripe.com](https://dashboard.stripe.com), aller dans **Developers → Webhooks**.
2. **Add endpoint** → URL : `https://souklink-api.onrender.com/api/transactions/webhook`.
3. **Events** : sélectionner `checkout.session.completed` et `checkout.session.expired`.
4. Copier le **Signing secret** (`whsec_...`) → l'ajouter dans les variables Render (`STRIPE_WEBHOOK_SECRET`).

---

## 🔒 Sécurité — Points clés

- **Le paiement n'est jamais confirmé depuis le frontend** — seul le webhook Stripe (après vérification de signature) marque une transaction comme payée.
- **La signature du webhook est toujours vérifiée** avant de traiter l'événement Stripe.
- **Le prix est toujours calculé côté serveur** (lecture depuis la BDD), jamais transmis depuis le client.
- **Les avis ne peuvent être laissés** qu'après une transaction confirmée (statut PAYE).
- **Les emails des utilisateurs ne sont jamais exposés** dans l'API publique.

---

## 🧪 Défis techniques résolus

- **Webhook Stripe sécurisé** : endpoint public protégé uniquement par vérification de signature, pas par JWT.
- **Chat temps réel** : WebSocket STOMP avec SockJS (compatible mobile + navigateurs sans WebSocket natif), abonnement par conversation.
- **Recherche filtrée** : requête JPQL avec paramètres optionnels (`@Query` Spring Data JPA).
- **Upload de photos** : upload direct vers Supabase Storage depuis le frontend, URLs enregistrées en BDD, backend Spring Boot ne manipule jamais les fichiers binaires.

---

## 📁 Structure du projet

```
souklink/
├── backend/                    # Spring Boot 3.2.5 — Java 21
│   ├── src/main/java/com/souklink/
│   │   ├── model/              # 9 entités JPA
│   │   ├── dto/                # Request / Response DTOs
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── service/            # Logique métier
│   │   ├── controller/         # Controllers REST
│   │   ├── websocket/          # Controller STOMP (chat temps réel)
│   │   ├── config/             # Security, WebSocket, CORS
│   │   └── exception/          # Exceptions + GlobalExceptionHandler
│   └── src/test/               # Tests JUnit 5 + Mockito + MockMvc
│
├── frontend/                   # Angular 17 + Tailwind CSS
│   └── src/app/
│       ├── shared/             # Services, models, auth.service
│       ├── auth/               # Connexion / Inscription
│       ├── catalogue/          # Catalogue avec recherche et filtres
│       ├── annonce-detail/     # Fiche annonce + chat + paiement
│       ├── creer-annonce/      # Formulaire avec upload photos
│       ├── messagerie/         # Chat WebSocket temps réel
│       ├── mes-annonces/       # Tableau de bord vendeur
│       ├── transaction/        # Succès paiement + mes achats
│       ├── profil/             # Profil utilisateur + avis
│       ├── admin/              # Administration
│       ├── guards/             # AuthGuard, AdminGuard
│       └── interceptors/       # JWT interceptor, Error interceptor
│
└── .github/
    └── workflows/ci.yml        # Pipeline CI/CD GitHub Actions
```

---

*Abdessamad Ouchaib · Projet portfolio · 2026*
