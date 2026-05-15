# GradeStack — SGPA & CGPA Calculator

> A sleek, terminal-inspired academic GPA calculator. Track every semester, name your subjects, and compute SGPA and CGPA in real time — with a dark/light theme toggle and full mobile support.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo Usage](#demo-usage)
- [Grade–Point Mapping](#gradepoint-mapping)
- [How Calculations Work](#how-calculations-work)
  - [SGPA](#sgpa-formula)
  - [CGPA](#cgpa-formula)
- [File Structure](#file-structure)
- [Tech Stack](#tech-stack)
- [Running Locally](#running-locally)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

**GradeStack** started as a minimal single-semester SGPA tool and evolved into a full-featured academic GPA dashboard. Whether you want to cross-check one semester's performance or compute your cumulative GPA across an entire degree, GradeStack has you covered — with zero dependencies and zero backend.

---

## Features

| Feature | Detail |
|---|---|
| 🗂️ Multi-semester support | Add as many semesters as you need, name each one |
| ✏️ Editable subjects | Name each subject, choose a letter grade, set credit hours |
| ⚡ Individual SGPA | Calculate a single semester's SGPA without touching the others |
| 📊 Full CGPA calc | One click computes all SGPAs and your cumulative CGPA simultaneously |
| 🌗 Dark / Light theme | Toggle between themes; preference is saved across sessions |
| 📱 Mobile-first layout | Responsive grid adjusts from 320 px to wide desktop |
| 📋 Grade reference | Floating `?` button reveals the full grade–point table at any time |
| 💬 Toast notifications | Non-intrusive error messages; no browser `alert()` popups |

---

## Demo Usage

1. **Open** `index.html` in any modern browser (Chrome, Firefox, Safari, Edge).
2. **Add semesters** with the `+ Add Semester` button.
3. **Name** each semester (e.g. *Year 1 Odd*, *Semester 3*).
4. **Fill in subjects** — enter the subject name, select the letter grade, and type the credit value.
5. **Add more subjects** per semester using `+ Subject`; remove rows with `✕`.
6. Hit **`Calc SGPA`** on a single semester, or click the big **`Calculate CGPA & All SGPAs`** button for a full report.
7. The **Output** panel shows each semester's SGPA and the overall CGPA. The top summary bar updates the CGPA live.

---

## Grade–Point Mapping

This calculator uses the 10-point grading scale common in Indian universities (KTU, Anna University, VTU, etc.).

| Letter Grade | Grade Points |
|:---:|:---:|
| S | 10.0 |
| A+ | 9.0 |
| A | 8.5 |
| B+ | 8.0 |
| B | 7.5 |
| C+ | 7.0 |
| C | 6.5 |
| D | 6.0 |
| P | 5.5 |
| F | 0.0 |

---

## How Calculations Work

### SGPA Formula

SGPA is the credit-weighted average of grade points for all subjects in a single semester.

```
SGPA = Σ (Grade_Point_i × Credit_i)  /  Σ Credit_i
```

**Example:**

| Subject | Grade | Grade Point | Credits | GP × C |
|---|---|:---:|:---:|:---:|
| Mathematics | S | 10 | 4 | 40 |
| Physics | A+ | 9 | 3 | 27 |
| Programming | A | 8.5 | 3 | 25.5 |
| **Total** | | | **10** | **92.5** |

```
SGPA = 92.5 / 10 = 9.25
```

---

### CGPA Formula

CGPA is the credit-weighted average across **all semesters**. Each semester's subjects contribute their raw `(GP × Credits)` totals — CGPA is not an average of SGPAs.

```
CGPA = Σ (Grade_Point_ij × Credit_ij) [all semesters]
       ─────────────────────────────────────────────────
              Σ Credit_ij [all semesters]
```

This ensures that semesters with different total credit loads are weighted correctly.

---

## File Structure

```
gradestack/
│
├── index.html       # Application shell, layout, modal markup
├── styles.css       # All styling — themes, components, animations, responsive
├── script.js        # Core logic — semester/subject management, calculations, UI
└── README.md        # This file
```

### `index.html`
Semantic HTML5 structure. Contains:
- App header with logo, live indicator, and theme toggle
- Summary bar (live CGPA, total semesters, total credits)
- Semesters container (dynamically populated by JS)
- Results output panel
- Grade reference modal

### `styles.css`
- CSS custom properties (`--accent`, `--bg`, `--surface`, etc.) for both dark and light themes on `:root` and `[data-theme="light"]`
- Responsive grid via `display: grid` with `@media` breakpoints at 600 px and 400 px
- Keyframe animations: `fadeSlideIn`, `scanMove` (header scanline), `pulse` (live dot), `spin` (calculate button icon)
- No external CSS framework used

### `script.js`
- `GRADE_POINTS` — single source of truth for the grade–point map
- `createSemesterCard()` — dynamically builds each semester with its own header, subjects area, and action buttons
- `createSubjectRow()` — builds an individual subject input row (name, grade select, credits, delete)
- `calcSGPA(card)` — performs the SGPA calculation for a given semester card; returns `{ sgpa, credits, points }` or `{ error }`
- `calculateAllBtn` handler — loops all semester cards, accumulates global totals, renders the full results panel and updates summary bar
- `showResultsPanel(rows, fullCalc)` — renders the output panel with CGPA and per-semester SGPA rows
- `showToast(msg)` — displays a non-blocking notification at the bottom of the viewport
- Theme persistence via `localStorage` key `gs-theme`

---

## Tech Stack

| Layer | Choice |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | Vanilla CSS3 (custom properties, grid, flexbox, keyframes) |
| Logic | Vanilla JavaScript (ES6+, no frameworks) |
| Fonts | [Space Mono](https://fonts.google.com/specimen/Space+Mono) (monospace / numeric display) + [DM Sans](https://fonts.google.com/specimen/DM+Sans) (UI body) via Google Fonts |
| Storage | `localStorage` (theme preference only) |
| Build | None — open `index.html` directly |

---

## Running Locally

No build step, no Node, no dependencies.

```bash
# Clone or download the repository
git clone https://github.com/your-username/gradestack.git
cd gradestack

# Open directly in browser
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

Or serve it with any static server if you prefer:

```bash
npx serve .
# → http://localhost:3000
```

---

## Contributing

Pull requests are welcome.

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push and open a PR

Please keep the zero-dependency philosophy and avoid adding a build step unless absolutely necessary.

---

## License

MIT © 2025 — feel free to use, modify, and distribute.