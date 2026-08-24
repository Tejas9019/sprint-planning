<div align="center">

# ⚡ TrackFlows

### A Premium, AI-Native Project & Sprint Management Workspace

TrackFlows is a state-of-the-art project management workspace featuring multi-tenant task boards, real-time analytics, Keep-style note capture, and a modular AI service powered by Gemini and FastAPI.

<br />

<!-- Primary Badges -->
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript 6](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Spring Boot 4](https://img.shields.io/badge/Spring_Boot-4.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)

<!-- Secondary Badges -->
[![Java 21](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org)
[![Python 3.11](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org)
[![MySQL 8](https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-Flash-8E75C2?style=flat-square&logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Chroma VectorDB](https://img.shields.io/badge/Chroma_DB-RAG-3178C6?style=flat-square&logo=googlecloud&logoColor=white)](https://www.trychroma.com/)
[![Zustand](https://img.shields.io/badge/Zustand-State-443E38?style=flat-square&logo=react&logoColor=white)](https://github.com/pmndrs/zustand)
[![Flyway](https://img.shields.io/badge/Flyway-Migrations-CC0200?style=flat-square&logo=flyway&logoColor=white)](https://flywaydb.org)

</div>

---

## 📖 Table of Contents
- [✨ Key Features](#-key-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🧱 Tech Stack Details](#-tech-stack-details)
- [📂 Repository Structure](#-repository-structure)
- [⚙️ Setup & Installation](#️-setup--installation)
  - [Prerequisites](#prerequisites)
  - [1. Backend Setup (Spring Boot)](#1-backend-setup-spring-boot)
  - [2. AI Service Setup (FastAPI)](#2-ai-service-setup-fastapi)
  - [3. Frontend Setup (React & Vite)](#3-frontend-setup-react--vite)
- [🔌 Primary API Endpoints](#-primary-api-endpoints)
- [🛡️ License & Attributions](#️-license--attributions)

---

## ✨ Key Features

TrackFlows bridges standard task tracking with automated intelligence and rich data visualizations:

*   **🗂️ Kanban Boards & Workflows:** Drag-and-drop workspace powered by `@dnd-kit/sortable` supporting multiple board view formats (Kanban, Table, Calendar).
*   **📊 Dynamic Insights Dashboard:** Visual representation of task distribution, 7-day velocity/completion trends, workload metrics, and Gantt charts using **Recharts**.
*   **👥 Multi-Tenant Member Control:** Secure onboard invites, member role transitions (`Admin`, `Manager`, `Member`, `Guest`), and bulk-user onboarding via CSV/Excel parsing.
*   **💡 Google-Keep-Style Quick Capture:** Rich quick notes support containing pinned entries, color labels, hashtags, checklists, and soft-delete trash.
*   **🤖 Gemini RAG Assistant:** Fully integrated FastAPI AI service providing document indexing (PDF, DOCX), context-aware retrieval, release notes generation, and direct prompt actions.

---

## 🏗️ System Architecture

TrackFlows utilizes a decoupled microservices architecture designed to run seamlessly in locally-hosted development environments:

```mermaid
graph TD
    subgraph Client Application
        Frontend[React Vite SPA]
    end

    subgraph Service Layer
        Backend[Spring Boot Backend]
        AIService[FastAPI AI Service]
    end

    subgraph Storage Layer
        MySQL[(MySQL Database)]
        Chroma[(Chroma Vector DB)]
    end

    %% Connections
    Frontend -->|HTTP Requests| Backend
    Frontend -->|HTTP Requests / AI Actions| AIService
    Backend -->|Data Sync / CRUD| MySQL
    AIService -->|RAG Documents & Embeddings| Chroma
    AIService -->|Gemini API Calls| Gemini[Google Gemini LLM]
```

---

## 🧱 Tech Stack Details

| Layer | Component | Version / Tools Used | Description |
| :--- | :--- | :--- | :--- |
| **Frontend** | React | 19.2.6 | Component architecture & modern rendering |
| | Vite | 8.0.12 | Ultra-fast local development & hot module replacement |
| | Tailwind CSS | 4.3.0 | Modern utility-first CSS styling framework |
| | State Management | Zustand 5.0.13 | Lightweight, atomic react state store with session persistence |
| | Visualizations | Recharts 3.8.1 / @xyflow/react | Charts, metrics, and workflow visualization pipelines |
| **Backend** | Spring Boot | 4.0.0 (Java 21) | Production-ready enterprise application framework |
| | Database Migration | Flyway | Structured schema setup & schema versions tracker |
| | Authorization | Spring Security / JJWT | Token-based session verification & multi-tenant access control |
| | DB Connector | MySQL Driver | Connector routing standard MySQL commands to engine |
| **AI Service** | FastAPI | 0.115.x (Python 3.11) | Lightweight, asynchronous REST API builder |
| | Framework | LangChain | LLM orchestration and document loading pipeline |
| | LLM Engine | Google Gemini | Core reasoning, sprint classification, & release note writer |
| | Vector Database | ChromaDB | Vector space storage for semantic indexing and search |

---

## 📂 Repository Structure

```text
sprint-planning/
├── backend/                  # Java Spring Boot service
│   ├── src/main/java/...     # Controllers, Models, JPA Services, JWT filters
│   ├── src/main/resources/   # Application properties, Flyway migrations
│   └── pom.xml               # Maven configuration
├── ai-service/               # FastAPI RAG & LLM service
│   ├── app/                  # Application core, routers, models, schemas, services
│   │   ├── api/              # Route controllers & routers
│   │   ├── core/             # Configuration & LLM engine setups
│   │   └── db/               # SQLAlchemy engine & model configurations
│   ├── alembic/              # Database migration version files
│   └── requirements.txt      # Python dependency manifest
├── frontend/                 # Vite + React Single-Page Application
│   ├── src/                  # React components, Zustand stores, layout styles
│   │   ├── components/       # Modals, boards, widgets, tables
│   │   ├── store/            # Board, auth, note, and contact stores
│   │   └── App.tsx           # Global routing & view assembler
│   └── package.json          # Node.js dependencies
└── doc/                      # Project reference documentation & guides
```

---

## ⚙️ Setup & Installation

### Prerequisites
*   **Java JDK 21** or higher
*   **Node.js 18+** & **npm**
*   **Python 3.11** or higher
*   **MySQL 8.x** running locally (default: port `3307`, schema: `sprint_planning`)

---

### 1. Backend Setup (Spring Boot)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create your `.env` configuration file inside `backend/`:
   ```properties
   DB_URL=jdbc:mysql://localhost:3307/sprint_planning
   DB_USERNAME=root
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long
   ```
3. Run migrations and start the server:
   ```bash
   mvn spring-boot:run
   ```
   *The backend will boot on http://localhost:8080.*

---

### 2. AI Service Setup (FastAPI)
1. Navigate to the `ai-service` directory:
   ```bash
   cd ai-service
   ```
2. Create your virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your environment variables in `.env` inside `ai-service/`:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key
   DATABASE_URL=mysql+pymysql://root:your_mysql_password@localhost:3307/sprint_planning
   ```
5. Launch the service:
   ```bash
   python run.py
   ```
   *The AI service will launch on http://localhost:8000.*

---

### 3. Frontend Setup (React & Vite)
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Setup the client-side `.env` configuration:
   ```env
   VITE_API_URL=http://localhost:8080
   VITE_AI_SERVICE_URL=http://localhost:8000
   ```
3. Install Node modules and start the Vite server:
   ```bash
   npm install
   npm run dev
   ```
   *The UI will launch on http://localhost:5173.*

---

## 🔌 Primary API Endpoints

### 🔐 Authentication & Session (Backend)
*   `POST /auth/signup` - Register user profile
*   `POST /auth/signin` - Authenticate user & return JWT token
*   `POST /auth/verify-otp` - Verify multi-factor OTP code
*   `POST /auth/switch-tenant` - Move context to a different tenant membership

### 📋 Boards & Tasks (Backend)
*   `GET /tasks` - Retrieve tasks for the active tenant
*   `POST /tasks` - Register a new sprint task card
*   `PUT /tasks/{id}` - Modify details or drag column position
*   `POST /tasks/{id}/comments` - Add discussion text to a card

### 🤖 AI Service APIs (AI-Service)
*   `POST /api/v1/chat` - Prompt session assistant with sprint context
*   `POST /api/v1/documents/upload` - Index documentation into ChromaDB
*   `POST /api/v1/summarize` - Auto-generate release summary updates

---

## 🛡️ License & Attributions
Distributed under the MIT License. See `LICENSE` for more information. Built for high-efficiency engineering teams tracking sprints in modern web spaces.
