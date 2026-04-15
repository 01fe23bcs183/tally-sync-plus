# Plan 34: Keyboard Shortcut Customization

## Problem Statement
Tally users rely on keyboard shortcuts but may want different bindings. New users find the shortcut system overwhelming.

## Current Pain Points
- Cannot customize Tally's keyboard shortcuts
- No visual cheat sheet available during work
- Shortcuts differ between Tally versions (ERP 9 vs Prime)
- No shortcut discovery — must memorize or refer to manual
- Power users want custom bindings for frequent operations

## Proposed Solution
Customizable keyboard shortcut system with visual cheat sheet, profiles, and learn-as-you-go hints.

### Key Features
1. **Shortcut Manager**: View and remap any keyboard shortcut
2. **Profiles**: Tally ERP 9 layout, Tally Prime layout, Custom layout
3. **Visual Cheat Sheet**: Overlay showing all available shortcuts (toggle with ?)
4. **Context-Aware Hints**: Show relevant shortcuts based on current screen
5. **Shortcut Search**: Type description to find shortcut
6. **Usage Analytics**: Show most/least used shortcuts, suggest optimizations


## UI — Easy Mode
Visual shortcut editor with key capture, profile selector dropdown, searchable cheat sheet overlay, conflict detection


## UI — Tally Mode
Shortcut list in Tally-style menu, Alt+K to view all shortcuts, F5 to customize, profile switching with Alt+1/2/3


## Implementation Steps
1. Create shortcut registry with default bindings
2. Build shortcut manager UI
3. Implement profile system (save/load/switch)
4. Create cheat sheet overlay component
5. Add context-aware hint system
6. Track shortcut usage for analytics

## Priority Level
🟡 **Medium**

## Estimated Effort
~5 days
