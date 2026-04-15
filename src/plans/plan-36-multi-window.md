# Plan 36: Multi-Window Support

## Problem Statement
Tally is single-window — you can't view a report while entering a voucher. This forces constant switching.

## Current Pain Points
- Cannot view ledger balance while entering voucher
- Report viewing interrupts data entry workflow
- Cannot compare two reports side by side
- No split-screen capability
- Alt-tabbing between reference data and entry is tedious

## Proposed Solution
Multi-panel interface with split views, pop-out windows, and reference panels.

### Key Features
1. **Split View**: Divide screen into 2-3 panels
2. **Pop-Out Windows**: Open reports/ledgers in floating windows
3. **Reference Panel**: Quick-access panel showing ledger details during voucher entry
4. **Layout Presets**: Save and restore panel arrangements
5. **Drag-Drop Organization**: Rearrange panels by dragging

## Implementation Steps
1. Implement panel management system (resizable, draggable)
2. Build split-view layout component
3. Create pop-out window functionality (browser window.open or modal)
4. Build reference panel for voucher entry
5. Add layout preset save/load
6. Implement panel drag-drop

## Priority Level
🟡 **Medium**

## Estimated Effort
~7 days
