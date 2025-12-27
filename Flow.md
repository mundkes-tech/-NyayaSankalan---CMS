# System Flow

## 1️⃣ USER ROLES LAYER
**Police | SHO | Court | Judge**
- Role-based access control

⬇️

## 2️⃣ FIR & CASE INITIATION
- FIR Upload / Entry
- FIR ID + Timestamp
- Auto Case Creation

⬇️

## 3️⃣ CASE OWNERSHIP & ASSIGNMENT
- SHO assigns Police Officer
- Priority & Control

⬇️

## 4️⃣ INVESTIGATION & DOCUMENT LAYER
- Evidence Upload
- Witness Statements
- Legal Templates
  - Charge Sheet
  - Evidence List

⬇️

## 5️⃣ VALIDATION & CHECKLIST ENGINE
- Mandatory Docs Check
- Missing File Detection
- Submission Control

⬇️

## 6️⃣ INVESTIGATION OUTCOME DECISION
**→ Charge Sheet OR Closure**

⬇️

## 7️⃣ POLICE → COURT HANDOVER *(CORE)*
- Digital Submission
- Case Locking
- Timestamped Transfer

⬇️

## 8️⃣ COURT INTAKE SYSTEM
- Court Clerk Review
- Acknowledgement Receipt
- Status Update

⬇️

## 9️⃣ COURT TRACKING *(READ-ONLY)*
- Cognizance / Charges
- Trial Status
- Judgment Upload

⬇️

## 🔟 CASE DISPOSAL & ARCHIVAL
- Closed / Disposed
- Appeal Tracking (Optional)
- Timeline Frozen

---

### Flow Summary
```
USER ROLES → FIR INITIATION → ASSIGNMENT → INVESTIGATION → VALIDATION 
    → OUTCOME → HANDOVER → COURT INTAKE → TRACKING → ARCHIVAL
```
