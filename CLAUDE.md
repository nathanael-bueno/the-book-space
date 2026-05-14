# CLAUDE.md - Project Context & Collaboration

This document provides context for AI assistants when collaborating on the **The Book Space** project.

## 🎯 Project Goals
- **Name:** The Book Space (App de Troca e Doação de Livros com Rede Social).
- **Objective:** Facilitate real-world book exchanges, social reading interactions, and donations to partner institutions.
- **Academic Context:** PI (Projeto Integrador) - Software Engineering.
- **Social Impact:** Aligned with UN SDG 4 (Quality Education).

## 💻 Tech Stack
- **Frontend:** React (TypeScript), Vite + SWC, TailwindCSS.
- **Backend:** PHP 8.2, Laravel, PostgreSQL (using UUIDs).
- **Infrastructure:** Docker (Nginx, PHP-FPM, PostgreSQL).
- **Authentication:** JWT.

## 🏛️ Architecture & Conventions
- **Monorepo Structure:** 
  - `/api`: Laravel backend.
  - `/client`: React frontend.
- **Branching Strategy:** `feature/*` → `develop` → `main`.
- **API Design:** RESTful endpoints following Laravel standards.
- **Database:** UUIDs for all primary keys.

## 🤝 Development Guidelines
- **Multi-Agent Flow:** Collaborating with **Gemini** (orchestration/frontend) and **Codex** (backend/logic).
- **Current Phase:** Sprint 2 - Consolidation (April/May 2026).
- **UI/UX:** Responsive web design focused on accessibility and social interaction.
- **Coding Style:** 
  - Follow PSR-12 for PHP.
  - Use Functional Components and Hooks for React.
  - Keep logic separated from presentation.

## 📁 Key Modules
- **Users:** Auth, profiles, reputation system (0.0-5.0).
- **Books:** Catalog, search (title/author/ISBN), filtering by genre/location.
- **Trades:** Proposal flow, real-time chat (after acceptance), status tracking.
- **Social:** Feed, recommendations, likes, comments, following system.
- **Donations:** Institution directory, donation history.
- **Admin:** Moderation, metrics, institution management.

## 🧪 Quick Commands
```bash
# Infrastructure
docker-compose up -d --build
docker-compose exec app php artisan migrate

# Backend (API)
docker-compose exec app php artisan route:list
docker-compose exec app php artisan test

# Frontend (Client)
cd client && npm install && npm run dev
```
