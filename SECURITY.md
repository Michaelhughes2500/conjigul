# Security Policy

Reconnect Directory currently stores demo profile, contact, check-in, and resource data in the user's browser through `localStorage`. Do not treat the demo as a secure case-management system until authentication, encryption, access control, audit logging, and data-retention rules are added.

## Reporting a Vulnerability

Report vulnerabilities through the repository issue tracker or private project contact. Include the affected page, browser, reproduction steps, and whether any personal data could be exposed.

## Data Safety Notes

- Verify local providers before publishing a live resource directory.
- Avoid storing sensitive supervision, legal, medical, or safety-plan details in browser storage for production use.
- The planning tools support communication and organization; they do not replace legal, medical, clinical, or supervision advice.
