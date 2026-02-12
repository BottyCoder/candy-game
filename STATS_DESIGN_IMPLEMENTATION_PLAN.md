# Stats Dashboard — Super Design Implementation Plan

**Design source:** Super Design  
- Project ID: `7ac8bd42-730c-4d6d-b297-4c970606e7a4`  
- Draft: Woosh Ai | Stats Dashboard (`a430109e-4061-4d97-ada8-23959fec8b20`)  
- Fetched HTML saved in agentic-mvp: `superdesign-stats-draft.html` (reference only)

**Target file:** `valentines-game/public/stats.html`  
**Constraint:** Keep all existing behavior (API calls, pagination, dynamic data). Change only markup and styles to match the design.

---

## 1. Design vs current — summary

| Area | Current | Design |
|------|---------|--------|
| **Head** | Vanilla CSS, Plus Jakarta Sans | Tailwind CDN + Iconify + Plus Jakarta Sans |
| **Header** | `.page-label` + `.page-title` | Cyan bar (1px × 8px) + label + larger h1 (4xl/5xl) |
| **Summary cards** | 3 cards, emoji icons, simple shadow | 3 cards with decorative circle (top-right), Iconify icons in colored boxes, hover shadow tint (cyan/purple/emerald), badge "Real-time"/"Engagement"/"Retention" |
| **Age / Suburb** | Two full-width cards, stacked | Two-column grid (lg:2cols), section titles with `border-l-4` accent (cyan / purple), rounded-2xl table wrapper |
| **Leaderboard** | Single card, simple table | Section with border-b header, optional action buttons (search/filter/download — can be hidden), rank as circular badge (1–3 colored), player with avatar circle + name |
| **Game sessions** | Table + pagination below | Same order; table in rounded card; pagination in footer strip (bg slate-50) with Prev/Next + "Page X of Y \| N total" |
| **Games per user** | Vertical list of `.user-block` | Grid of cards (1/2/3 cols), each: name + masked mobile, "N Games" pill, "Seeds Used" + seed tags |

---

## 2. Implementation approach

**Option A (recommended):** Add Tailwind CDN + Iconify to `stats.html`, then replace section markup and class names to match the design. Keep all `id`s and script logic unchanged; only update the HTML that is injected (e.g. table rows, pagination HTML, user cards) so it uses the new Tailwind classes.

**Option B:** Keep vanilla CSS; add new class names and `<style>` rules that replicate the design (decorative circles, shadows, border accents, grid, etc.). No new scripts. More effort but no CDN dependency.

Recommendation: **Option A** for speed and consistency with the design (Tailwind + Iconify match the draft).

---

## 3. Step-by-step implementation (Option A)

### 3.1 Head

- Add Tailwind and Iconify:
  - `<script src="https://cdn.tailwindcss.com"></script>`
  - `<script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>`
- Keep Plus Jakarta Sans link.
- Remove or slim down existing `<style>` (rely on Tailwind). Keep only:
  - `.loading`, `.error` (or replace with Tailwind utility classes in JS).
  - `font-variant-numeric: tabular-nums` if not using Tailwind’s `tabular-nums`.

### 3.2 Page wrapper

- Replace `.container` with design wrapper:
  - `<div class="min-h-screen bg-white pb-20">`
  - `<div class="max-w-[1440px] mx-auto px-6 lg:px-12 py-10">`

### 3.3 Header (1)

- Replace current header with:
  - Outer: `<header class="mb-12">`
  - Line + label: `<div class="flex items-center gap-2 mb-3">` with `<span class="h-px w-8 bg-[#07b9d5]">` and `<span class="text-[#07b9d5] text-xs font-bold uppercase tracking-[0.2em]">Valentine's Match Challenge</span>`
  - Title: `<h1 class="text-4xl lg:text-5xl font-extrabold text-[#0f172a] tracking-tight">Stats — Leaderboard, Sessions & Games per User</h1>`

### 3.4 Summary cards (2)

- Replace `#summary-grid` and the three stat cards with the design structure:
  - Section: `class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"`
  - Each card: `p-8 rounded-[1.5rem] bg-white border border-[#f1f5f9] shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(7,185,213,0.05)] transition-all relative overflow-hidden group` (use cyan/purple/emerald for the hover shadow per card).
  - Decorative circle: `absolute top-0 right-0 w-32 h-32 bg-[#07b9d5]/5 rounded-full -mr-16 -mt-16` (and purple/emerald for cards 2–3).
  - Icon: `<div class="w-12 h-12 rounded-xl bg-[#07b9d5] ..."><iconify-icon icon="lucide:users"></iconify-icon></div>` (and `lucide:gamepad-2`, `lucide:bar-chart-3` for 2–3).
  - Badge: e.g. "Real-time", "Engagement", "Retention".
  - Value: `class="text-5xl font-extrabold ... tabular-nums mb-2 tracking-tighter"`; keep `id="stat-entries"`, `id="stat-games"`, `id="stat-average"`.
  - Label text: "Total Unique Entries", "Total Games Played", "Average Times Played".

### 3.5 Age group & Region (3 & 4)

- Wrap both in: `<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">`.
- **Age group:**
  - Section header: `<div class="mb-6 flex flex-col border-l-4 border-[#07b9d5] pl-4">` with "Age Group Distribution" and "Demographic breakdown of participants".
  - Table wrapper: `class="overflow-hidden rounded-2xl border border-[#f1f5f9]"`.
  - Table: thead `bg-[#f8fafc]`, th `px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-[#64748b]`, tbody `divide-y divide-[#f1f5f9]`, tr `hover:bg-slate-50 transition-colors`, td `px-6 py-4 text-sm font-semibold` / `tabular-numbers text-right`.
- **Suburb:** Same layout; header `border-l-4 border-[#7c3bed]`, "Regional Analytics" and "Top active locations by suburb". Keep `id="age-group-content"` and `id="suburb-content"` on the table container divs.
- In `loadAgeGroup()` and `loadSuburb()`, keep building `<table>...</table>` but use the new class names (e.g. thead/tr/th and tbody/tr/td classes from the design).

### 3.6 Full Leaderboard (5)

- Section: `class="mb-16"`, header with `border-b border-slate-100 pb-4`, title "Full Leaderboard", subtitle "Elite performance and top scoring players". Optionally hide the search/filter/download buttons (or add later).
- Table wrapper: `class="bg-white rounded-[1.5rem] border border-[#f1f5f9] overflow-hidden shadow-sm"`.
- Table: thead same pattern; for tbody rows:
  - Rank: circular badge `w-8 h-8 rounded-full bg-[#07b9d5]/10 ... text-[#07b9d5]` (1), purple (2), emerald (3).
  - Player: optional avatar circle + `<span class="font-bold">` name.
  - Mobile: can show masked (e.g. `082 *** 4592`) if desired.
  - Best Score / Games: `text-right`, tabular-nums.
- Keep `id="leaderboard-content"`; in `loadLeaderboard()` output the new `<table>` and `<tr>`/`<td>` structure with these classes.

### 3.7 Game Sessions (6)

- Section: "Recent Game Sessions", "Live feed of completed matches across all devices".
- Table: same card wrapper; columns Date & Time, Player, Mobile, Score, Seed, Best? (icon or text). Seed as small badge e.g. `px-2 py-1 bg-slate-100 rounded text-[10px] font-mono`. Best?: check/minus icon (Iconify) or "Yes"/blank.
- Pagination: wrap in `class="px-8 py-6 bg-[#f8fafc] border-t border-[#f1f5f9] flex items-center justify-between"`. Buttons: `flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg ... hover:border-[#07b9d5] hover:text-[#07b9d5]`. Text: "Page **1** of **46** | *459 total sessions*".
- Keep `id="sessions-content"` and `id="sessions-pagination"`; in `loadSessions()` build the new table and pagination HTML, and re-bind Prev/Next `onclick` to the same `loadSessions(page)` logic.

### 3.8 Games per User (7)

- Section: "User Engagement Depth", "Breakdown of active seeds and frequency per unique player".
- Container: `class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"`.
- Each user card: `class="p-6 rounded-2xl bg-white border border-[#f1f5f9] hover:border-[#07b9d5]/30 transition-all"` (or purple/emerald tint for variety).
  - Top: name (font-bold), mobile (text-xs font-mono text-slate-400, optionally masked).
  - Pill: `px-3 py-1 bg-[#07b9d5]/10 rounded-full` with "N Games" (e.g. "12 Games").
  - "Seeds Used" label + wrap of seed tags: `px-2 py-1 bg-slate-50 ... border border-slate-100 rounded` with "Seed 1234" (or design’s "#S45-A" style if you prefer).
- Keep `id="users-content"`. In `loadUsers()`, build one card per user with the above structure; keep data source as current (all sessions from `/api/stats/sessions` without params, grouped by player).

### 3.9 Script

- Do not change API URLs or fetch logic.
- Do not change `loadSummary()`, `loadAgeGroup()`, `loadSuburb()`, `loadLeaderboard()`, `loadSessions(1)`, `loadUsers()` flow.
- Only change the **HTML strings** and **element classes** inside each loader so the injected markup matches the design (tables, cards, pagination, badges). Keep `escapeHtml()` and all `getElementById` / `innerHTML` / `onclick` wiring.
- If you switch to Tailwind, ensure dynamic content still gets correct classes (e.g. `.loading` / `.error` can become Tailwind classes in the JS strings).

### 3.10 IDs and behavior

- Preserve: `stat-entries`, `stat-games`, `stat-average`, `age-group-content`, `suburb-content`, `leaderboard-content`, `sessions-content`, `sessions-pagination`, `users-content`.
- Preserve: SESSIONS_PAGE_SIZE = 20, sessionsCurrentPage, sessionsTotal, and pagination button handlers.

---

## 4. Verification

- Open `/stats.html` (dev and production build).
- Confirm: summary numbers, age group table, suburb table, full leaderboard, game sessions (20 per page), pagination, games-per-user cards all load and match design.
- Confirm: no duplicate or missing sections; order matches design (1 → 7).
- Confirm: colour scheme #07b9d5, #7c3bed, #10b981, #0f172a, #64748b, #f1f5f9, #f8fafc only.

---

## 5. Files touched

| File | Action |
|------|--------|
| `valentines-game/public/stats.html` | Replace head (add Tailwind + Iconify, trim CSS), replace body markup and section structure, update JS-generated HTML to use design classes. |

No backend or API changes. Design reference: `agentic-mvp/superdesign-stats-draft.html` (optional; can delete after implementation).
