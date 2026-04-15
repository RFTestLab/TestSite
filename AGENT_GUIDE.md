# RF Test Site – Project Context & Agent Guide

## Overview

This project is a **manual testing playground** for RoboForm-related scenarios.

It is used for:
- testing password manager behavior
- testing iframe interactions (same-domain and cross-domain)
- testing autofill behavior (login, credit cards)
- testing security edge cases (injection-like scenarios, hidden frames, etc.)
- testing passkey / WebAuthn behavior on web and mobile (Android)

This is NOT a production app.  
This is a **controlled testing environment**.

---

## Key Principles

### 1. This is a TESTING TOOL, not a product

Some things may look “wrong” or “unsafe”:
- hidden iframes
- offscreen elements
- unusual sandbox configurations
- programmatic input filling

These are **intentional** and must NOT be removed.

---

### 2. Do NOT simplify away test scenarios

If something looks:
- weird
- duplicated
- overly explicit

It may exist to:
- simulate real-world attack scenarios
- test password manager edge cases

👉 Preserve behavior unless clearly broken.

---

### 3. Static hosting only

The site must:
- work on GitHub Pages
- not require backend
- not require build tools

❌ Do NOT introduce:
- React
- TypeScript
- Node.js
- bundlers
- APIs that require server logic

---

## Project Structure

Main pages:

- `index.html`
  - landing page with links to all test scenarios

- `login.html`
  - login form test (same domain iframe)

- `login_dd.html`
  - login form test (different domain iframe)

- `cc.html`
  - credit card autofill test (same domain)

- `cc_dd.html`
  - credit card autofill test (cross-domain)

- `passkeys.html`
  - passkey / WebAuthn security testing page

Assets:

- `assets/css/style.css` (or styles.css)
  - shared styling

---

## UI/UX Rules

- Bootstrap-based layout
- Green accent color (RoboForm-like)
- Simple, clean, functional UI

Common patterns:

- Home button (top-left)
- Floating control panel (top-right)
- Bottom fixed log panel
- Cards for test sections

👉 All pages should feel like part of the same suite.

---

## Logging System

Each test page has:

- bottom fixed log panel
- real-time event logging
- debugging via postMessage / events

Do NOT:
- remove logs
- hide logs permanently
- break logging flow

---

## Iframe Testing (CRITICAL)

Some pages intentionally use:

- sandbox attributes
- invisible iframe
- offscreen iframe
- cross-origin iframe

These are used to test:
- password manager injection behavior
- autofill behavior
- security boundaries

👉 NEVER remove or “fix” these patterns.

---

## Passkey / WebAuthn Testing

The `passkeys.html` page is used to test:

- navigator.credentials.get()
- navigator.credentials.create()

Scenarios:

- silent execution (no user interaction)
- gesture-triggered execution

Goals:

- detect if passkey operations run without user interaction
- verify correct browser / system behavior
- validate Android + password manager integration

---

## What SHOULD be improved

You can safely improve:

- broken links
- wrong CSS references
- inconsistent naming
- duplicated styles (if safe to unify)
- UI consistency
- spacing/layout
- mobile responsiveness
- readability
- minor JS robustness issues

---

## What MUST NOT be changed

Do NOT:

- remove test scenarios
- remove iframe tricks
- remove hidden/offscreen elements
- simplify test flows
- add frameworks
- convert project to SPA
- introduce backend
- change fundamental behavior of tests

---

## Refactoring Guidelines

- Prefer minimal, safe changes
- Keep code readable and explicit
- Avoid clever abstractions
- Avoid overengineering
- Maintain manual testing clarity

---

## Decision Rule

If you are unsure:

👉 "Is this weird because it's broken, or because it's a test?"

If unsure → KEEP IT and add a comment instead of removing.

---

## Output Expectations (for agent)

When making changes:

1. Provide audit summary
2. List issues found
3. Apply safe fixes
4. List modified files
5. Explain reasoning

---

## Final Goal

Make the project:

- clean
- consistent
- reliable
- easy to use for manual testing
- safe to extend

WITHOUT breaking its purpose as a testing playground.