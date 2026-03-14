# Moira NWOS v25 — AVEVA Predictive Layer

## Current State
Moira NWOS v24 is a sovereign-grade National Wealth Operating System with 13 tabs: Dashboard, Transactions, Moira AI, Sensors, Vault, Cloud, Brain, Admin, Library, M.Sim Strong Room (violet), 6G, GOI Command. Features include: 3D Global Pulse Globe, Sovereign Visualization Engine, Golden 3rd Eye Aura, Lexus Ignition Sequence, Sovereign View Overlay, Bio-Sovereign Bar, Digital Smile Behavioral DNA, Device Trust Simulation, Kill Switch & Cold Start Recovery, PAM360 Telemetry, Regulatory Compliance Translator, M.Sim Telemetry Dashboard, AI Societal Impact Predictor, Property Tokenization Engine, Wealth Algorithms, Library, Printable Notes, Senate Briefing Export, Parliamentary Demo Tour. The previous draft has expired.

## Requested Changes (Diff)

### Add
- **AVEVA Predictive Layer** integrated into Brain tab and Sensors tab
  - Dedicated AVEVA panel in Brain tab with industrial terminal aesthetic
  - Dedicated AVEVA panel in Sensors tab
  - **Threat Prediction Score**: live breach probability % with trend graph simulation, color-coded risk bands (GREEN/AMBER/RED), predictive horizon (next 15min/1hr/24hr)
  - **Behavioral Sensibility Index**: duress detection score, coercion probability, cognitive decline indicator — each with live animated bar, threshold markers, and alert state
  - **Industrial Mirror Status**: Digital Twin sync status between M.Sim Strong Room and AVEVA twin engine, mirror fidelity %, last sync timestamp, heartbeat indicator
  - AVEVA branding: deep amber/orange accent color to distinguish from rest of app (classified terminal base + AVEVA amber overlay)
  - Live auto-refresh every 3 seconds for all AVEVA metrics
  - "AVEVA DIGITAL TWIN" header badge with DEMO label
  - AVEVA engine status indicator: ONLINE / CALIBRATING / ALERT states
  - Flat Banking High-Voltage Corridor panel: shows AVEVA governing the settlement corridor with voltage-style animated indicator

### Modify
- Brain tab: add AVEVA Predictive Layer section below existing content
- Sensors tab: add AVEVA Behavioral Sensibility panel below Lexus Ignition section

### Remove
- Nothing removed

## Implementation Plan
1. Rebuild full Moira NWOS v24 codebase from scratch (all tabs, all existing features)
2. Add AVEVA Predictive Engine component with all three metric panels
3. Embed AVEVA component in Brain tab (Threat Prediction + Industrial Mirror Status + Flat Banking Corridor)
4. Embed AVEVA Behavioral Sensibility panel in Sensors tab
5. AVEVA amber/orange accent colors applied only to AVEVA panels
6. All AVEVA metrics auto-animate on 3s interval
7. Deploy with fresh link
