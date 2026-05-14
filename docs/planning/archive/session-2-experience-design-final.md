# Session 2 — Experience Design (Archived Final)

Archived: 2026-05-07

## Locked Direction

Session 2 is locked with an **agent-in-call** interaction model:

- Student + tutor + agent participate in a single live call experience.
- The agent appears as a call participant and uses its own video feed as the primary learning surface.
- Parent remains the primary required app user (setup, tutor network management, summaries).
- Tutor should be able to participate without app install.
- Voice/call-only operation remains a required fallback if richer visual surfaces are unavailable.

## Core Interaction Model

1. Parent configures trusted tutor network (3+ tutors, level metadata, priority hints).
2. Child initiates a call-first session.
3. Agent opens interaction with playful mode selection.
4. In parallel:
   - Outreach agent recruits tutor with timeout and fallback behavior.
   - Prep agent generates activity plan for selected mode.
5. Tutor joins the same call.
6. Agent video feed acts as shared learning canvas.
7. Session runs human-led with agent pacing/support.
8. Session ends and summary is stored for parent review and future prep context.

## Surfaces

- **Primary:** in-call agent video feed as learning canvas.
- **Secondary (optional):** mirrored web companion for tutor readability/cues.
- **Required app UI:** parent only.

## Constraints Carried to Session 3

- Same-call participation is the default experience.
- Tutor participation cannot depend on app installation.
- Session remains functional with degraded visuals (voice-first fallback).
- Preserve two-track architecture work in Session 3:
  - FaceTime-first aspirational path.
  - Controllable-call MVP path that preserves user-facing experience shape.
