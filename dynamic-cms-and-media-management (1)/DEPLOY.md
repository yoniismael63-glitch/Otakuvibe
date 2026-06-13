# Déploiement sur Vercel — Guide Otaku Vibes

## Le problème

Vercel a deux contraintes qui cassent notre app actuelle :

1. **Stockage de fichiers** : le filesystem Vercel est **lecture seule** (sauf `/tmp` éphémère). Les uploads dans `public/uploads/` ne fonctionneront pas.
2. **Base de données** : Vercel n'héberge pas PostgreSQL. Il faut une base externe.

## Solution : Cloudinary (gratuit) + PostgreSQL externe

---

## Étape 1 — Créer une base PostgreSQL

Créer une base sur l'un de ces services (tous ont un plan gratuit) :

| Service | URL |
|---|---|
| **Neon** (recommandé) | https://neon.tech |
| **Supabase** | https://supabase.com |
| **Railway** | https://railway.app |

Récupérez l'URL de connexion (format `postgresql://user:pass@host:5432/db`).

---

## Étape 2 — Créer un compte Cloudinary (gratuit)

1. Allez sur https://cloudinary.com et créez un compte gratuit.
2. Dans le dashboard, récupérez :
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

Les images et vidéos seront stockées chez Cloudinary au lieu du disque local.

---

## Étape 3 — Déployer sur Vercel

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer (depuis la racine du projet)
vercel
```

Ou directement via le dashboard web : https://vercel.com/new → importez votre repo Git.

### Variables d'environnement à définir sur Vercel

Dans **Project Settings → Environment Variables**, ajoutez :

```
DATABASE_URL=postgresql://...          # URL fournie par Neon/Supabase
JWT_SECRET=une-vraie-cle-longue-aleatoire
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-seCRET
```

> ⚠️ **Important** : La variable `JWT_SECRET` doit être une chaîne longue et aléatoire (32+ caractères). Vous pouvez en générer une avec : `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Puis cliquez **Redeploy**.

---

## Étape 4 — Initialiser la base et créer l'admin

Après le premier déploiement :

```bash
# Option A : Depuis un terminal avec DATABASE_URL configuré
npx drizzle-kit push

# Option B : Visitez l'URL de seed dans votre navigateur
https://votre-domaine.vercel.app/api/seed
```

Vous pouvez ensuite vous connecter à l'admin :
`https://votre-domaine.vercel.app/admin/login`

Identifiants créés par le seed :
- Email : `admin@otakuvibes.com`
- Mot de passe : `admin123`

---

## Étape 5 — Redéploiement automatique

Si votre code est sur GitHub, connectez le repo dans Vercel :
Settings → Git → Connect Git Repository. Chaque `git push` déclenchera un redéploiement.

---

## Notes importantes

- 📁 Les fichiers uploadés vont sur Cloudinary (CDN mondial, rapide)
- 🗄️ Les métadonnées (URL, taille, type) restent dans PostgreSQL
- 🔒 Les variables `CLOUDINARY_*` et `JWT_SECRET` sont **server-only** et ne sont jamais exposées au client
- 🧪 Testez d'abord avec `vercel` (preview) avant de faire `vercel --prod`

## Le code a été adapté

Le fichier `src/lib/storage.ts` gère automatiquement :
- **Cloudinary** si `CLOUDINARY_CLOUD_NAME` est défini (production/Vercel)
- **Stockage local** dans `public/uploads/` sinon (développement)

Aucune configuration n'est nécessaire pour l'un ou l'autre mode.
