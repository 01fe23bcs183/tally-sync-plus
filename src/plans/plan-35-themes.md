# Plan 35: Dark Mode & Themes

## Problem Statement
Tally has a fixed blue/cream color scheme. Users working long hours want dark mode, and businesses want brand-matched themes.

## Current Pain Points
- Tally's bright blue interface causes eye strain in prolonged use
- No dark mode option
- No theme customization
- High contrast themes for accessibility not available
- Cannot match company branding

## Proposed Solution
Full theme system with dark mode, multiple pre-built themes, custom theme builder, and accessibility options.

### Key Features
1. **Dark Mode**: Full dark theme for both Easy and Tally modes
2. **Pre-built Themes**: Classic Tally, Modern Blue, Dark Professional, High Contrast
3. **Custom Theme Builder**: Pick primary/accent colors, preview live
4. **Tally Mode Themes**: Classic cream, dark terminal, modern minimal
5. **Accessibility**: High contrast, large text, reduced motion options
6. **Schedule**: Auto-switch dark mode at sunset


## UI — Easy Mode
Theme preview cards with live preview, color picker panel, font selector, custom theme builder


## UI — Tally Mode
F12:Configure theme selection, Alt+T to cycle themes, Tally Classic theme option preserves original look


## Implementation Steps
1. Define theme token system (CSS variables)
2. Create theme switching infrastructure
3. Build 4-5 pre-built themes
4. Create theme builder UI with live preview
5. Add accessibility options
6. Implement schedule-based switching

## Priority Level
🟡 **Medium**

## Estimated Effort
~5 days
