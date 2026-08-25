# Compiled Spec

## Page: Command & Booking Console (`booking-room.html`)
- Page scene thesis: Tactical Clinical OSPE 7-Star Room Reservation and Real-time Telemetry Deck
- Signature composition: Architectural Matrix with luminous status beacons and live pulsing check-in countdown diodes.
- Signature composition source id: `comp-cutaway-monolith-01`
- Why this cannot collapse into a default grid: It integrates coordinate time axes, dynamic slot occupancy calculations, live countdown timers, and contextual modal chambers.
- One big idea: Real-time luminous availability matrix with 5-minute auto-expire countdown ticker.
- Heavy interaction: Live slot hover telemetric tooltip + Real-time countdown ticker interval + interactive quota progress tracker.
- Heavy interaction source id: `ix-realtime-telemetry-hud`
- Showy reveals: Modal backdrop zoom-in easing and pulsing check-in beacon.
- Showy reveal source id(s): `rev-chamber-aperture`
- Restraint notes: Clean darkroom styling without noisy textures; high WCAG AA contrast on all student ID and timestamp labels.
- Typography source id(s): `typo-surgical-mono-03`
- Atmosphere/background source id(s): `bg-obsidian-radial-glow`

## Entrance Map
- Scene 1 (Header HUD): `fadeInDown` with 0.4s ease.
- Scene 2 (Schedule Matrix): Staggered cell appearance with subtle luminosity gradient.
- Scene 3 (Chamber Protocol): `fadeInUp` 0.5s.

## External Library Decision

### Q1: What is the core motion experience of this page?
- Crisp state transitions, pulsing status diodes, and realtime ticking countdowns.

### Q2: Can the native library entries do it?
- Yes, pure modern CSS animations and native JavaScript `requestAnimationFrame` / `setInterval` provide 60fps performance without heavy external dependencies.

### Q3: If an external library is used, why this one and how will it be redirected through the chosen film language?
- None needed. Google Fonts (`Bai Jamjuree`, `Inter`, `JetBrains Mono`) are sufficient.

### Decision
- 100% Native CSS/JS implementation inside Google Apps Script Web App environment for zero latency and offline resilience.

## Derived Global Tokens
```css
:root {
  --bg-core:          #070a12;
  --bg-gradient:      radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99, 102, 241, 0.12), transparent);
  --surface-base:     #0d1322;
  --surface-elevated: #131b2e;
  --surface-glass:    rgba(13, 19, 34, 0.82);
  --border-hairline:  rgba(255, 255, 255, 0.08);
  --border-focus:     rgba(99, 102, 241, 0.45);
  
  --text-pure:        #f8fafc;
  --text-muted:       #94a3b8;
  --text-dim:         #64748b;
  
  /* Tactical Status Grades */
  --emerald:          #10b981;
  --emerald-bg:       rgba(16, 185, 129, 0.08);
  --emerald-border:   rgba(16, 185, 129, 0.22);
  --emerald-glow:     0 0 12px rgba(16, 185, 129, 0.25);
  
  --amber:            #f59e0b;
  --amber-bg:         rgba(245, 158, 11, 0.10);
  --amber-border:     rgba(245, 158, 11, 0.28);
  --amber-glow:       0 0 14px rgba(245, 158, 11, 0.30);
  
  --crimson:          #f43f5e;
  --crimson-bg:       rgba(244, 63, 94, 0.08);
  --crimson-border:   rgba(244, 63, 94, 0.22);
  --crimson-glow:     0 0 12px rgba(244, 63, 94, 0.25);
  
  --cyan:             #06b6d4;
  --indigo:           #6366f1;
  
  --radius-xs:        6px;
  --radius-sm:        10px;
  --radius-md:        14px;
  --radius-lg:        20px;
  
  --ease-cinematic:   cubic-bezier(0.16, 1, 0.3, 1);
  --transition-snappy: 0.22s var(--ease-cinematic);
}
```

## Phase 3 Quality Check
- [x] Every section has complete layout CSS
- [x] Every section has complete entrance behavior
- [x] Every section has complete interaction behavior or intentional `none`
- [x] JS-required effects include complete JS
- [x] Entrance variety rules pass
- [x] External Library Decision block is complete
- [x] Library source ids are present for all major visual moves
