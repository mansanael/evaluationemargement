# SMI — Plateforme Évaluation & Émargement des Séminaires

Application full-stack de gestion des séminaires : émargement numérique, évaluation, analytics et partage de ressources.

## Architecture

```
evaluationemargement/
├── frontend/   Next.js 14 + Tailwind CSS
└── backend/    NestJS + Prisma + SQLite
```

## Prérequis

- Node.js 18+
- npm 9+

## Installation

```bash
# Backend
cd backend
npm install
npx prisma migrate dev   # Crée la base de données
npx ts-node prisma/seed.ts   # Crée l'admin par défaut

# Frontend
cd ../frontend
npm install
```

## Lancement

**Terminal 1 — Backend (port 3001)**
```bash
cd backend
npm run start:dev
```

**Terminal 2 — Frontend (port 3000)**
```bash
cd frontend
npm run dev
```

Accès : http://localhost:3000

## Compte Admin par défaut

| Email | Mot de passe |
|-------|-------------|
| admin@smi.com | admin123 |

> Changez ce mot de passe en production !

## Fonctionnalités

### Participants
- Inscription et connexion
- Émargement numérique avec signature dessinée à l'écran
- Questionnaire d'évaluation complet en 6 parties (conforme au modèle PDF SMI)
- Accès aux ressources (fichiers + liens) par séminaire

### Admin
- Dashboard global (stats : séminaires, émargements, évaluations, satisfaction)
- CRUD des séminaires (créer, modifier, supprimer)
- Vue des émargements avec signatures
- Analytics par séminaire (graphiques par question)
- Upload de fichiers et ajout de liens par séminaire

## API Backend (port 3001)

| Endpoint | Description |
|----------|-------------|
| POST /api/auth/register | Inscription |
| POST /api/auth/login | Connexion |
| GET /api/seminars | Liste des séminaires |
| POST /api/seminars | Créer un séminaire (Admin) |
| POST /api/seminars/:id/attendance | Émarger |
| GET /api/seminars/:id/attendance | Liste émargements (Admin) |
| POST /api/seminars/:id/evaluations | Soumettre une évaluation |
| GET /api/analytics | Stats globales (Admin) |
| GET /api/analytics/seminars/:id | Analytics par séminaire (Admin) |
| POST /api/seminars/:id/resources/upload | Upload fichier (Admin) |
| POST /api/seminars/:id/resources/link | Ajouter lien (Admin) |
