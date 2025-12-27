┌───────────────────────────────┐
│        USER ROLES LAYER        │
│  Police | SHO | Court | Judge  │
└───────────────┬───────────────┘
                │ (Role-based access)
                ▼
┌───────────────────────────────┐
│     FIR & CASE INITIATION      │
│  - FIR Upload / Entry          │
│  - FIR ID + Timestamp          │
│  - Auto Case Creation          │
└───────────────┬───────────────┘
                │       
                ▼
┌───────────────────────────────┐
│  CASE OWNERSHIP & ASSIGNMENT   │
│  - SHO assigns Police Officer │
│  - Priority & Control         │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ INVESTIGATION & DOCUMENT LAYER │
│ - Evidence Upload              │
│ - Witness Statements           │
│ - Legal Templates              │
│   (Charge Sheet, Evidence List)│
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ VALIDATION & CHECKLIST ENGINE  │
│ - Mandatory Docs Check         │
│ - Missing File Detection       │
│ - Submission Control           │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ INVESTIGATION OUTCOME DECISION │
│  → Charge Sheet OR Closure     │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ POLICE → COURT HANDOVER (CORE) │
│ - Digital Submission           │
│ - Case Locking                 │
│ - Timestamped Transfer         │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│     COURT INTAKE SYSTEM        │
│ - Court Clerk Review           │
│ - Acknowledgement Receipt     │
│ - Status Update                │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ COURT TRACKING (READ-ONLY)     │
│ - Cognizance / Charges         │
│ - Trial Status                 │
│ - Judgment Upload              │
└───────────────┬───────────────┘
                │
                ▼
┌───────────────────────────────┐
│ CASE DISPOSAL & ARCHIVAL       │
│ - Closed / Disposed            │
│ - Appeal Tracking (Optional)   │
│ - Timeline Frozen              │
└───────────────────────────────┘
