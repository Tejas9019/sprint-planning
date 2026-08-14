Viewed authStore.ts:1-148
Viewed contactsStore.ts:1-150
Listed directory auth
Viewed App.tsx:1-150
Viewed NoteServiceImpl.java:1-100
Viewed TaskServiceImpl.java:1-100
Viewed TenantController.java:1-42
Listed directory service
Viewed TenantMembershipServiceImpl.java:1-100
Searched for "acceptInvite"
Viewed AuthServiceImpl.java:1-100
Viewed AcceptInvite.tsx:1-98

Here is a detailed breakdown of the features already built, what features/APIs are currently pending or need integration, and the exact commands you can run to check both the frontend and backend.

---

### 1. ⚙️ Currently Built & Fully Integrated Features
The backend already has robust implementations for the core data models, security, multi-tenancy, and standard CRUD APIs:

* **Authentication & Session:**
  * **API Endpoints:** `POST /auth/signup`, `POST /auth/signin`, `POST /auth/verify-otp`, `POST /auth/resend-otp`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/switch-tenant`, `GET /auth/me`.
  * **Integration:** Fully integrated with the frontend `authStore.ts` (local sign-up/sign-in and switch tenant functionality works with backend sessions and JWT).
* **Profile Settings:**
  * **API Endpoints:** `PUT /users/me`
  * **Integration:** Integrated with frontend `ProfileSettingsView.tsx` for updating user profile info.
* **Tasks & Kanban (Board):**
  * **API Endpoints:** `GET /tasks`, `POST /tasks`, `PUT /tasks/{id}`, `DELETE /tasks/{id}`, `POST /tasks/{id}/comments`.
  * **Integration:** Integrated with `boardStore.ts` and updates the board columns (`To Do`, `Doing`, `Done`) and comments thread in real-time.
* **Google-Keep Notes:**
  * **API Endpoints:** `GET /notes`, `POST /notes`, `PUT /notes/{id}`, `DELETE /notes/{id}`, `DELETE /notes/trash/empty`.
  * **Integration:** Integrated with `notesStore.ts` (pinned notes, tags, colors, soft-delete trash, checklists).
* **Onboarding & Member Management:**
  * **API Endpoints:** `GET /tenants/{tenantId}/members`, `POST /tenants/{tenantId}/members` (invite), `PUT /tenants/{tenantId}/members/{membershipId}/role`, `DELETE /tenants/{tenantId}/members/{membershipId}`.
  * **Integration:** Integrated with `contactsStore.ts` for listing, inviting, updating roles, and revoking members.

---

### 2. ⏳ Pending Features & API Gaps
Here are the areas where backend APIs or integrations are still pending:

1. **Invite Acceptance Flow (High Priority):**
   * **The Gap:** The backend service has `TenantMembershipServiceImpl.acceptInvite(String token, UUID userId)` implemented, but there is **no REST API endpoint** exposing it in `TenantMembershipController.java`.
   * **Frontend Status:** The frontend `contactsStore.ts` has a mock/empty `acceptInvite` method. Guest users who visit the invite link (`?invite=<token>`) cannot fetch the invite details (e.g., who invited them, to which tenant, and for what role) because there is no unauthenticated endpoint to get invite details by token.
   * **Fix Required:** 
     * Create an unauthenticated API endpoint (e.g. `GET /api/v1/invites/{token}`) to fetch invite details.
     * Create an authenticated endpoint (e.g. `POST /api/v1/invites/{token}/accept`) or integrate it into the sign-up flow to accept the invite.

2. **Real-time Chat / Direct Messaging:**
   * **The Gap:** There is no chat/messages package or database tables in the backend database.
   * **Frontend Status:** The `chatStore.ts` is purely simulated on the frontend with mock replies and local storage.
   * **Fix Required:** Define chat message schemas, repositories, services, and REST/WebSocket endpoints for real-time communication between tenant members.

3. **AI Panel & Notebook AI Writer:**
   * **The Gap:** No AI endpoints or integration in the backend.
   * **Frontend Status:** The `AIPanel.tsx` and `AIWriterView.tsx` use simulated responses with predefined replies.
   * **Fix Required:** Add backend services to connect with LLM APIs (e.g., Gemini API) to analyze sprint data, generate release notes, and answer user queries.

---

### 3. 🚀 Commands to Run the Application

To check the frontend and backend, please run the following commands on your system:

#### A. Run the Backend (Spring Boot + MySQL)
Ensure your MySQL database is running (configured for port `3307` in `backend/src/main/resources/application.properties`). Open a terminal in the `backend` directory and run:
```powershell
# Installs dependencies and runs the Spring Boot development server
mvn spring-boot:run
```

#### B. Run the Frontend (Vite + React)
Open a new terminal in the `frontend` directory and run:
```powershell
# Install Node dependencies
npm install

# Run the Vite local development server
npm run dev
```
Once both are running, the frontend will connect to the backend at `http://localhost:8080`.

---

### How would you like to proceed?
Would you like me to create an **Implementation Plan** to build the **Invite Acceptance REST APIs** first?