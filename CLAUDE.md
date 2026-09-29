# Mojuli Christ Glorious School Portal — Claude Instructions & Context

## Project Overview
This repository contains the complete web application and institutional management portal for **Mojuli Christ Glorious School** (Ado-Ekiti, Ekiti State, Nigeria).
- **Motto**: "Jesus is our great teacher"
- **Primary Website & App File**: `index.html` (single-file rich web app with vanilla CSS and JavaScript)
- **Standalone Version**: `../mojuli_standalone.html` (base64 embedded imagery for zero-dependency local viewing)
- **Local Dev Server**: `server.exe` (Go HTTP file server running on `http://localhost:8080/index.html`)
- **Live GitHub Pages URL**: `https://tomi-code-bit.github.io/mojuli-school-portal/`
- **GitHub Repository**: `https://github.com/Tomi-code-bit/mojuli-school-portal`

---

## Academic Structure & Class Levels
Classes follow the Nigerian Universal Basic Education & Christian school curriculum:
- **Early Years & Kindergarten**: `KG 1`, `KG 2`, `Nursery 1`, `Nursery 2` *(Note: KG 3 is removed; Nursery 1 & Nursery 2 follow KG 2)*
- **Primary School**: `Primary 1`, `Primary 2`, `Primary 3`, `Primary 4`, `Primary 5`, `Primary 6`
- **Secondary School**: `JSS 1`, `JSS 2`, `JSS 3`, `SS 1`, `SS 2`, `SS 3`

---

## Authentication & Access Control Rules

### 1. Sequential Student ID & Password Series
- Format: `MJL/{2-digit-year}/{4-digit-seq}` (e.g. `MJL/26/0001`, `MJL/26/0002`, `MJL/26/0003`, ..., `MJL/26/0009`)
- **Default Password**: Identical to the Student ID (e.g., `MJL/26/0001` signs in with password `MJL/26/0001`). Fallback demo password is `student123`.

### 2. Student Self-Registration Policy
- **Students cannot register themselves on the portal**.
- They are enrolled exclusively by school administrators or classroom teachers.
- The Student Login page shows only the Sign In form and an official policy advisory notice explaining this rule.

### 3. Demo Accounts & Credentials
| Role | Identifier / Email | Default Password | Notes |
|------|--------------------|------------------|-------|
| **Student (Primary)** | `MJL/26/0001` | `MJL/26/0001` | Faith Adebayo (Primary 4) |
| **Student (Secondary)** | `MJL/26/0009` | `MJL/26/0009` | Emmanuel Okafor (JSS 2) |
| **Parent** | `08012345678` | `parent123` | Mrs. Adebayo (links to `MJL/26/0001`) |
| **Teacher** | `oduya.g@mojulichristglorious.edu.ng` | `staffpass` | Mrs. Grace Oduya (Primary 4) |
| **Admin & Principal** | `admin@mojulichristglorious.edu.ng` | `admin2026` | Master admin passcode is `admin2026` |

---

## Key Features & Component Map in `index.html`

1. **Teacher Assignments Management (`data-panel-td="homework"`)**:
   - Dynamic store: `assignmentsStore` backed by `localStorage` (`assignmentsStore`).
   - Teacher can create assignments (Subject, Target Class, Due Date, Title, Detailed Instructions).
   - Teacher can delete old or completed assignments.
   - Filtered automatically on the Student Dashboard (`data-panel-sd="homework"`).

2. **Admin Academic Results by Class (`data-panel-ad="results"`)**:
   - Class selector dropdown (`All Classes`, `KG 1` – `SS 3`).
   - Renders pupils enrolled in that class, their CA1-3, Exam, Total, Grade, Class Average, and Teacher Remarks.
   - Direct button to print official term report card for each pupil.

3. **Announcements Management (`data-panel-ad="announcements"`)**:
   - Form to broadcast official school bulletin.
   - `🗑 Delete` button for manual removal of outdated notices with confirmation modal.

4. **Profile Pictures & Visual Passports**:
   - Uploadable via base64 `FileReader` during pupil enrollment and teacher registration.
   - Displayed in:
     - Teacher console sidebar (`.who`) and profile tab.
     - Student profile tab (`data-panel-sd="profile"`).
     - Printed terminal report cards (`.rc-photo`).
     - Class roster tables.

5. **Automatic Previous Term Brought Forward (B/F)**:
   - First Term: Prev B/F starts at 0 or manual input.
   - Second Term: Automatically pulls First Term Total score.
   - Third Term: Automatically pulls Second Term Total score.

6. **Hotlines & Direct WhatsApp Contact**:
   - Phone 1: `07042664309`
   - Phone 2: `0803779632`
   - Floating WhatsApp live inquiry button and modal.

7. **Supabase & GitHub Integration**:
   - Built-in Supabase client in `supabaseClient.js` for optional cloud database sync.
   - SQL schema in `supabase_schema.sql`.

---

## Guidelines for Modifying Code with Claude
1. **Preserve Document Integrity**: When updating `index.html`, do not remove existing functionality, design tokens, or responsive layouts.
2. **Persistence**: Use `DB.get(key, fallback)` and `DB.set(key, value)` for all reactive data stores so that changes persist in the browser.
3. **Class Structure**: Always use `PRIMARY_CLASSES = ["KG 1", "KG 2", "Nursery 1", "Nursery 2", "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6"]`.
4. **Git Sync**: To commit and push updates:
   ```powershell
   $gitBin = "C:\Users\SUCCESS NEW\.gemini\antigravity-ide\scratch\mingit\cmd"
   $ghBin = "C:\Users\SUCCESS NEW\.gemini\antigravity-ide\scratch"
   $env:PATH = "$gitBin;$ghBin;$env:PATH"
   git add -A
   git commit -m "Your update message"
   git push origin main
   ```
