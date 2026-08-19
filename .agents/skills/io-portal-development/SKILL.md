---
name: io-portal-development
description: >-
  Development standards, architectural patterns, visual tokens, and shared component guidelines
  for the UTN Operations Research (Investigación Operativa) Web Portal. Use when modifying or adding
  units, simulators, styling, or navigation in this repository.
---

# UTN Operations Research Web Portal Guidelines

This skill guides the development and maintenance of the interactive web tools for the 4th Year Operations Research (Investigación Operativa) course at UTN.

## 1. Unit Theme Palettes

Each unit has a distinct primary accent color:
- **Unit 1 (Cadenas de Markov):** Indigo (`#6366f1`, `#818cf8`)
- **Unit 2 (Teoría de Colas - M/M/k):** Blue (`#3b82f6`, `#60a5fa`)
- **Unit 3 (Gestión de Proyectos - PERT/CPM):** Amber (`#f59e0b`, `#fbbf24`)
- **Unit 4 (Simulación de Montecarlo):** Emerald (`#10b981`, `#34d399`)
- **Unit 5 (Modelos de Inventarios):** Fuchsia Pink (`#ec4899`, `#f472b6`)
- **Unit 6 (Programación Lineal Continua):** Cyan (`#06b6d4`, `#67e8f9`)
- **Unit 7 (Teoría de Juegos y Decisiones):** Rose (`#f43f5e`, `#fda4af`)

## 2. Architecture & Design Tokens

- **Core Styling:** Use `styles.css` for shared variables and layout.
- **Glassmorphism:** Dark modern surface background `rgba(15, 23, 42, 0.75)` with thin translucent borders `rgba(..., 0.2)` and subtle backdrop blur.
- **Typography:** Headings in `Inter` (700/800), math formulas in `KaTeX`, tabular/numeric values in `Fira Code` monospace.
- **Navigation:** Integrated via `<div id="nav-container"></div>` and `<script src="menu.js"></script>`. Top navbar shows current unit dropdown and active sub-links.
- **Responsive Layout:** 100% full width, avoiding fixed column widths that force horizontal scrollbars.

## 3. Libraries & Dependencies

- **Chart.js:** Line charts, sawtooth inventory waves, bar distributions. Always configure responsive canvas with `maintainAspectRatio: false`.
- **KaTeX:** Standard delimiters: `$$ ... $$` for display mode, `$ ... $` for inline mode. Auto-render with `renderMathInElement(document.body)`.
- **Excel Formula Box:** Always provide direct copy-to-clipboard buttons with localized Spanish Excel syntax (e.g. `=RAIZ(...)`, `;` or `,` as parameter delimiters).

## 4. Notifications

- Run PowerShell sound notification after completing user turns:
  `powershell -c "[console]::beep(1000, 300); [System.Media.SystemSounds]::Asterisk.Play()"`
