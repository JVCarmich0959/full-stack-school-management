# Data Sanitization Pipeline

This document describes how raw student profile objects are normalized before rendering.

1. `sanitizeStudentProfile(raw)` returns a strict `CleanStudentProfile`.
2. Helper functions (`normalizeGrade`, `validateContact`, etc.) resolve contradictions and enforce ranges.
3. An anomaly log (console warnings) highlights discarded or suspect values.

## TODO
- Integrate zod schema for runtime validation.
- Add Jest tests for duplicate scores, invalid grade strings, missing contacts.
