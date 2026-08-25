# Design Decisions

- Entry mode: Surprise me (Curated Precision Cinema)
- Genre: Sci-Fi / High-Precision Clinical Noir
- Director: Denis Villeneuve
- Film: Arrival (2016) / Blade Runner 2049 (Wallace Archive & Laboratory)
- Niche: Clinical OSPE / OSCE Pharmacy Medical Simulation Suite Booking & Real-time Check-in Protocol (ห้อง 7 ดาว เภสัชฯ จุฬาฯ)
- Pages: Single unified web app (`booking-room.html`)
- Major page roles: Interactive Real-time HUD Command & Schedule Matrix, Time-slot Reservation Chamber, Protocol Validation / Check-in Ticker, Security & Rules Chamber.
- Image placeholders: No (Focus purely on Architectural Monolith, Hairline Grids, Tactical Typography, Phosphor Luminescence, and Time Table ergonomics)
- Sub-agent delegation plan (optional): None needed, executing unified spec.

## Demo Uniqueness Audit

- Previous-work audit: Generic light SaaS calendar, basic rounded white cards, default bootstrap-style modals.
- Recurring traits to avoid:
  - Cluttered multi-color card grids
  - Low-contrast light gray borders
  - Standard pastel calendar views
  - Overused generic float animations
- Shell-ban list:
  - Standard bootstrap/tailwind generic white card layout
  - Cartoonish icons
  - Generic gradient-text hero
- Primary composition family: **Cutaway Monolith & Tactical Architectural Grid**
- Why this family differs from the most recent output: Transmutes the app from a simple spreadsheet form into an elite medical flight-control deck — deep dark obsidian titanium background (`#090d16`), precision luminous HUD indicators, phosphor emerald for available docks, warning amber for pending check-in counters, and surgical typography.
- Wireframe-level uniqueness test: Even with pure wireframe lines, the structural hierarchy presents as an architectural surgical bay rather than a generic booking calendar.

## Research Notes

### Research Boundary
- Film research is observational input, not a spec: Studying Villeneuve's framing, silence, monolithic weight, and luminous amber/emerald contrast in dark surgical spaces.
- What is being translated into web language: Deep obsidian negative space, precision luminous status diodes, monospace coordinate time headers, tactile spring-physics modals, and atmospheric ambient gradients.
- What must not be flattened into product-template logic: The deliberate sense of authority, focus, and quiet discipline appropriate for pharmacy students training for high-stakes Clinical OSPE examinations.

### Research Sources
- Director source: Denis Villeneuve (Atmospheric silence, architectural brutalism, surgical lighting control).
- Film source: *Arrival* (Temporal non-linear precision) & *Blade Runner 2049* (Wallace Earth HQ minimal water/light reflections & monolithic slabs).
- Secondary analysis: Roger Deakins lighting architecture, high-contrast HUD interfaces in aerospace and medical simulation.
- Niche source 1: Stanford Medical Simulation Center Operations Deck.
- Niche source 2: RxCU OSPE Clinical Examination Command System.

### Film Palette
- Primary Void (Obsidian Slate): `#070a12` / `#0b101d`
- Surface Monolith (Dark Titanium): `#111728`
- Surface Highlight / Border: `rgba(255, 255, 255, 0.08)` / `rgba(99, 102, 241, 0.2)`
- Phosphor Emerald (Free / Confirmed): `#10b981` (Glow: `rgba(16, 185, 129, 0.25)`)
- Wallace Amber (Pending / 1 Table Left / Check-in Ticker): `#f59e0b` (Glow: `rgba(245, 158, 11, 0.3)`)
- Laser Crimson (Locked / Full / Expired): `#f43f5e` (Glow: `rgba(244, 63, 94, 0.25)`)
- Text Primary (Surgical White): `#f8fafc`
- Text Secondary (Muted Titanium): `#94a3b8`
- Text Monospace (Telemetry): `#64748b`

### Director Signatures
1. **Architectural Framing**: Monumental containers framed by hairline borders and calibrated inner shadows.
2. **Atmospheric Luminescence**: Subtle backlights and diode beacons that indicate life and state without overwhelming the reader.
3. **Temporal Precision**: Time slots rendered with strict monospace alignment (`JetBrains Mono` / `Inter`), high legibility, and realtime countdown telemetry.

### Film Translation Notes
- Framing: Full viewport monolithic canvas with tactile inner padding and floating command header.
- Rhythm: Strict 1-hour temporal cadence across 12 col-slices and 7-day rows.
- Lighting: Statuses emit directional soft glows (`box-shadow: inset 0 0 16px ...`).
- Space: High negative space around key operational actions to eliminate cognitive clutter.
- Materiality: Smoked glass surfaces (`backdrop-filter: blur(24px)`) paired with anodized dark metal cards.
