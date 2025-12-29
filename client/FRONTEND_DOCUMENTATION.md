# NyayaSankalan Frontend - Complete Documentation

> **Last Updated:** December 29, 2025  
> **Tech Stack:** React 18 + Vite 7.3 + TypeScript 5.7 + Tailwind CSS 4  
> **API Base URL:** http://localhost:5000/api

---

## 📁 Project Structure

```
client/
├── public/
├── src/
│   ├── api/                    # API service layer
│   │   ├── axios.ts            # Axios instance with JWT interceptor
│   │   ├── auth.api.ts         # Authentication APIs
│   │   ├── case.api.ts         # Case management APIs
│   │   ├── court.api.ts        # Court operations APIs
│   │   ├── fir.api.ts          # FIR creation APIs
│   │   ├── investigation.api.ts # Investigation APIs (evidence, witness, accused)
│   │   ├── document.api.ts     # Document management APIs
│   │   ├── bail.api.ts         # Bail application APIs
│   │   ├── timeline.api.ts     # Timeline & audit log APIs
│   │   ├── organization.api.ts # Police station & officer APIs
│   │   └── index.ts            # API exports
│   │
│   ├── components/
│   │   ├── common/             # Shared utility components
│   │   │   ├── EmptyState.tsx  # Empty list placeholder
│   │   │   ├── ErrorMessage.tsx # Error display with retry
│   │   │   ├── FileUpload.tsx  # File upload component
│   │   │   └── Loader.tsx      # Loading spinner
│   │   │
│   │   ├── layout/             # Layout components
│   │   │   ├── Header.tsx      # Page header with title/subtitle/action
│   │   │   ├── Layout.tsx      # Main app layout wrapper
│   │   │   ├── Navbar.tsx      # Top navigation bar (role-based)
│   │   │   └── index.ts        # Layout exports
│   │   │
│   │   └── ui/                 # Reusable UI components
│   │       ├── Badge.tsx       # Status badges (success, warning, danger, info)
│   │       ├── Button.tsx      # Button with variants & loading state
│   │       ├── Card.tsx        # Content card container
│   │       ├── Input.tsx       # Form input field
│   │       ├── Select.tsx      # Dropdown select
│   │       ├── Table.tsx       # Data table
│   │       └── Textarea.tsx    # Multi-line text input
│   │
│   ├── context/
│   │   └── AuthContext.tsx     # Authentication context provider
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   └── Login.tsx       # Login page
│   │   │
│   │   ├── police/             # Police officer pages
│   │   │   ├── Dashboard.tsx   # Police dashboard with stats
│   │   │   ├── MyCases.tsx     # List of assigned cases
│   │   │   ├── CaseDetails.tsx # Case details with investigation actions
│   │   │   └── CreateFIR.tsx   # FIR creation form
│   │   │
│   │   ├── sho/                # SHO (Station House Officer) pages
│   │   │   ├── Dashboard.tsx   # SHO dashboard with overview
│   │   │   ├── AllCases.tsx    # All station cases with filters
│   │   │   └── CaseDetails.tsx # Case details with assign/submit actions
│   │   │
│   │   ├── court/              # Court Clerk pages
│   │   │   ├── Dashboard.tsx   # Court dashboard
│   │   │   ├── IncomingCases.tsx # Cases submitted from police
│   │   │   └── CaseDetails.tsx # Case details with intake action
│   │   │
│   │   └── judge/              # Judge pages
│   │       ├── Dashboard.tsx   # Judge dashboard
│   │       ├── Cases.tsx       # All court cases
│   │       └── CaseDetails.tsx # Case details with court action recording
│   │
│   ├── routes/
│   │   └── ProtectedRoute.tsx  # Role-based route protection
│   │
│   ├── types/
│   │   └── api.types.ts        # All TypeScript interfaces & enums
│   │
│   ├── utils/
│   │   └── caseState.ts        # Case state utilities (badge colors, checks)
│   │
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind CSS imports
│
├── .env                        # Environment variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🔐 Authentication System

### AuthContext (`src/context/AuthContext.tsx`)
- Manages user authentication state
- Stores JWT token in localStorage
- Provides `login()`, `logout()` functions
- Auto-checks token validity on app load
- Exposes `user`, `isAuthenticated`, `isLoading` states

### Protected Routes (`src/routes/ProtectedRoute.tsx`)
- Role-based access control
- Redirects unauthenticated users to login
- Redirects users to their role-specific dashboard

### Login Page (`src/pages/auth/Login.tsx`)
- Email & password form
- Form validation
- Error handling with toast notifications
- Auto-redirect after successful login

---

## 👮 Police Module

### Dashboard (`src/pages/police/Dashboard.tsx`)
- **Stats Display:** Total cases, Under Investigation, Submitted to Court
- **Quick Actions:** Create FIR, View My Cases
- **Recent Cases List:** Top 5 cases with quick access

### My Cases (`src/pages/police/MyCases.tsx`)
- Lists all cases assigned to the logged-in officer
- Table view with FIR number, sections, state, date
- Click to view case details
- Uses `getCaseStateBadgeVariant()` for consistent badge colors

### Create FIR (`src/pages/police/CreateFIR.tsx`)
- Form fields: Incident Date, Sections Applied, FIR Source
- File upload for FIR document
- Auto-creates Case after FIR registration
- Redirects to case details on success

### Case Details (`src/pages/police/CaseDetails.tsx`)
- **Case Information Card:** FIR number, state badge, creation date
- **Status Banners:**
  - Yellow: "Read-only mode" (not assigned to user)
  - Gray: "Case is locked" (submitted to court)
  - Green: "You are assigned" (can edit)
- **Investigation Actions (when editable):**
  - Add Evidence (category, description, file upload)
  - Add Witness (name, contact, address, statement)
  - Add Accused (name, address, status)
- **Investigation Summary:** Evidence, Witnesses, Accused, Documents counts
- **Evidence List:** Category badges, file links
- **Witnesses List:** Name, contact, statement (text or file link)
- **Accused List:** Name, status badge

---

## 👨‍✈️ SHO Module

### Dashboard (`src/pages/sho/Dashboard.tsx`)
- **Stats Display:** Total cases, Unassigned, Pending Review, In Court
- **Unassigned Cases Section:** Cases needing officer assignment
- **Cases Pending Review:** Ready for court submission
- **Recent Cases List:** Overview with quick access

### All Cases (`src/pages/sho/AllCases.tsx`)
- Lists all cases in the police station
- **Filter by State:** All, FIR Registered, Under Investigation, Investigation Completed, Submitted to Court
- Table with FIR, sections, state, assigned officer, date
- Uses shared badge utilities

### Case Details (`src/pages/sho/CaseDetails.tsx`)
- **Case Information:** FIR number, state, assignment status, date
- **Unassigned Warning Banner:** Prominent if no officer assigned
- **Assign Officer Section:**
  - Dropdown of available officers (from `/api/officers`)
  - Assignment reason field
  - Shows current officer if assigned with reassign option
- **FIR Details:** Sections, incident date, police station
- **Assignment History:** List of all past and current assignments
- **Investigation Summary:** Stats cards for evidence, witnesses, accused, documents
- **Submit to Court Section (when state allows):**
  - Court selection dropdown
  - Submit button
- **Court Submitted Banner:** Shows when case is in court

---

## ⚖️ Court Clerk Module

### Dashboard (`src/pages/court/Dashboard.tsx`)
- Overview of court cases
- Quick access to incoming cases

### Incoming Cases (`src/pages/court/IncomingCases.tsx`)
- Lists cases submitted to court awaiting intake
- Filter and sorting options

### Case Details (`src/pages/court/CaseDetails.tsx`)
- **Case Information:** FIR number, state badge, received date
- **FIR Details:** Sections, incident date, police station
- **Case Summary:** Evidence, witnesses, accused, documents counts
- **Intake Action (when SUBMITTED_TO_COURT):**
  - Optional acknowledgement number input
  - Accept Case button
- **Court Accepted Banner:** Shows when case is accepted
- **Court Actions List:** All recorded court actions

---

## 👨‍⚖️ Judge Module

### Dashboard (`src/pages/judge/Dashboard.tsx`)
- Overview of court cases under jurisdiction
- Quick access to case list

### Cases (`src/pages/judge/Cases.tsx`)
- All cases in court
- Filter by state

### Case Details (`src/pages/judge/CaseDetails.tsx`)
- **Case Information:** FIR number, state badge, received date
- **FIR Details:** Sections, incident date, police station
- **Case Summary:** Evidence, witnesses, accused, court actions counts
- **Record Court Action (when COURT_ACCEPTED/TRIAL_ONGOING/JUDGMENT_RESERVED):**
  - Action Type: Cognizance, Charges Framed, Hearing, Judgment, Sentence, Acquittal, Conviction
  - Action Date picker
  - Record Action button
- **Case Disposed Banner:** Shows when case is disposed
- **Court Actions History:** All recorded actions with dates and badges

---

## 🎨 UI Components

### Badge (`src/components/ui/Badge.tsx`)
```tsx
// Variants: default, success, warning, danger, info
<Badge variant="success">APPROVED</Badge>
```

### Button (`src/components/ui/Button.tsx`)
```tsx
// Variants: primary, secondary, danger
// Sizes: sm, md, lg
// Props: isLoading, disabled
<Button variant="primary" isLoading={submitting}>Submit</Button>
```

### Card (`src/components/ui/Card.tsx`)
```tsx
<Card title="Case Information">
  {/* content */}
</Card>
```

### Input (`src/components/ui/Input.tsx`)
```tsx
<Input 
  label="Email" 
  type="email" 
  value={email} 
  onChange={e => setEmail(e.target.value)}
  required 
/>
```

### Select (`src/components/ui/Select.tsx`)
```tsx
<Select
  label="Court"
  value={selectedCourt}
  onChange={e => setSelectedCourt(e.target.value)}
  options={[
    { value: 'court1', label: 'District Court' },
    { value: 'court2', label: 'High Court' },
  ]}
/>
```

### Textarea (`src/components/ui/Textarea.tsx`)
```tsx
<Textarea
  label="Statement"
  rows={4}
  value={statement}
  onChange={e => setStatement(e.target.value)}
/>
```

---

## 🔧 Utilities

### Case State Utilities (`src/utils/caseState.ts`)

```tsx
// Get consistent badge color for any case state
getCaseStateBadgeVariant(state: string): 'default' | 'success' | 'warning' | 'danger' | 'info'

// Format state for display (replace _ with space)
getCaseStateLabel(state: string): string

// Check if police can edit the case
isEditableByPolice(state: string): boolean

// Check if SHO can submit to court
canSubmitToCourt(state: string): boolean

// Check if court clerk can intake
canIntakeCase(state: string): boolean

// Check if judge can record actions
isInCourt(state: string): boolean

// Check if editing is locked after court submission
isLockedForPolice(state: string): boolean
```

### Badge Color Mapping

| Case State | Badge Variant | Color |
|------------|---------------|-------|
| FIR_REGISTERED | default | Gray |
| CASE_ASSIGNED | info | Blue |
| UNDER_INVESTIGATION | info | Blue |
| INVESTIGATION_PAUSED | warning | Orange |
| INVESTIGATION_COMPLETED | warning | Orange |
| CHARGE_SHEET_PREPARED | warning | Orange |
| SUBMITTED_TO_COURT | info | Blue |
| RETURNED_FOR_DEFECTS | info | Blue |
| COURT_ACCEPTED | success | Green |
| TRIAL_ONGOING | success | Green |
| JUDGMENT_RESERVED | warning | Orange |
| DISPOSED | default | Gray |
| ARCHIVED | default | Gray |

---

## 🔌 API Services

### Authentication API (`src/api/auth.api.ts`)
```ts
authApi.login(email, password)    // POST /api/auth/login
authApi.getCurrentUser()          // GET /api/auth/me
authApi.logout()                  // Clears token
```

### Case API (`src/api/case.api.ts`)
```ts
caseApi.getMyCases()              // GET /api/cases/my (Police)
caseApi.getAllCases()             // GET /api/cases/all (SHO/Court)
caseApi.getCaseById(caseId)       // GET /api/cases/:caseId
caseApi.assignCase(caseId, data)  // POST /api/cases/:caseId/assign
caseApi.archiveCase(caseId)       // POST /api/cases/:caseId/archive
```

### FIR API (`src/api/fir.api.ts`)
```ts
firApi.createFIR(data)            // POST /api/firs (with file upload)
firApi.getFIRById(firId)          // GET /api/firs/:firId
```

### Investigation API (`src/api/investigation.api.ts`)
```ts
investigationApi.createEvidence(caseId, data)   // POST /api/cases/:caseId/evidence
investigationApi.getEvidence(caseId)            // GET /api/cases/:caseId/evidence
investigationApi.createWitness(caseId, data)    // POST /api/cases/:caseId/witnesses
investigationApi.getWitnesses(caseId)           // GET /api/cases/:caseId/witnesses
investigationApi.createAccused(caseId, data)    // POST /api/cases/:caseId/accused
investigationApi.getAccused(caseId)             // GET /api/cases/:caseId/accused
```

### Court API (`src/api/court.api.ts`)
```ts
courtApi.getPoliceStations()      // GET /api/police-stations
courtApi.getCourts()              // GET /api/courts
courtApi.submitToCourt(caseId, data)  // POST /api/cases/:caseId/submit-to-court
courtApi.intakeCase(caseId, data) // POST /api/cases/:caseId/intake
courtApi.createCourtAction(caseId, data)  // POST /api/cases/:caseId/court-actions
courtApi.getCourtActions(caseId)  // GET /api/cases/:caseId/court-actions
```

### Organization API (`src/api/organization.api.ts`)
```ts
organizationApi.getOfficers()     // GET /api/officers (for SHO assignment)
```

---

## 🔄 Case Flow (Frontend Workflow)

```
┌─────────────────────────────────────────────────────────────────┐
│                        POLICE MODULE                            │
├─────────────────────────────────────────────────────────────────┤
│  1. Police creates FIR → Case created (FIR_REGISTERED)          │
│  2. SHO assigns officer → State: CASE_ASSIGNED                  │
│  3. Police adds evidence, witnesses, accused                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SHO MODULE                              │
├─────────────────────────────────────────────────────────────────┤
│  4. SHO reviews case details                                    │
│  5. SHO submits to court → State: SUBMITTED_TO_COURT            │
│     (Police editing now LOCKED)                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     COURT CLERK MODULE                          │
├─────────────────────────────────────────────────────────────────┤
│  6. Court Clerk views incoming case                             │
│  7. Court Clerk accepts case → State: COURT_ACCEPTED            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        JUDGE MODULE                             │
├─────────────────────────────────────────────────────────────────┤
│  8. Judge records court actions:                                │
│     - Cognizance → TRIAL_ONGOING                                │
│     - Hearings                                                  │
│     - Judgment → JUDGMENT_RESERVED                              │
│     - Final verdict → DISPOSED                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^7.x",
    "axios": "^1.x",
    "react-hot-toast": "^2.x"
  },
  "devDependencies": {
    "typescript": "^5.7",
    "vite": "^7.3",
    "tailwindcss": "^4.x",
    "@vitejs/plugin-react": "^4.x"
  }
}
```

---

## 🚀 Running the Frontend

```bash
# Install dependencies
cd client
npm install

# Start development server
npm run dev
# → http://localhost:5173

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

---

## 🔗 Backend Integration

The frontend expects the backend running at `http://localhost:5000` with the following:

- **Authentication:** JWT tokens stored in `Authorization: Bearer <token>` header
- **CORS:** Backend must allow requests from `http://localhost:5173`
- **File Uploads:** Uses `multipart/form-data` for evidence, witness statements, FIR documents

---

## ✅ Implementation Status

| Feature | Status |
|---------|--------|
| Project Setup (React + Vite + TS + Tailwind) | ✅ Complete |
| TypeScript Types & Enums | ✅ Complete |
| API Service Layer | ✅ Complete |
| Authentication Context | ✅ Complete |
| Protected Routes | ✅ Complete |
| UI Components (Button, Card, Badge, etc.) | ✅ Complete |
| Layout Components (Navbar, Header) | ✅ Complete |
| Login Page | ✅ Complete |
| Police Dashboard | ✅ Complete |
| Police My Cases | ✅ Complete |
| Police Case Details | ✅ Complete |
| Police Create FIR | ✅ Complete |
| SHO Dashboard | ✅ Complete |
| SHO All Cases | ✅ Complete |
| SHO Case Details (with assign & submit) | ✅ Complete |
| Court Clerk Dashboard | ✅ Complete |
| Court Clerk Incoming Cases | ✅ Complete |
| Court Clerk Case Details (with intake) | ✅ Complete |
| Judge Dashboard | ✅ Complete |
| Judge Cases List | ✅ Complete |
| Judge Case Details (with court actions) | ✅ Complete |
| Case State Utilities | ✅ Complete |
| Consistent Badge Colors | ✅ Complete |

---

**All frontend features are fully implemented and functional!** 🎉
