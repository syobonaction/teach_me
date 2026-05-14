# Session 1 — Product Scope Lock (Archived)

Archived: 2026-05-02

## Objective

Define the MVP’s boundaries, non-goals, and Day 1 acceptance criteria for a **call/video-first** learning experience that keeps the child out of a traditional “app workflow” as much as possible, while still allowing **optional lightweight companion UI** (for example, a small overlay window) to support the live interaction when needed.

## Scope Statement

Build a Mandarin learning system where a child primarily starts a session through a guardian-configured **call/video entry point** (the “producer line” / call-in experience).

An AI producer runs the opening conversation, helps the child pick a **play mode** verbally, then runs **tutor outreach** and **activity prep** in parallel, supports a short live multiplayer learning interaction, and records a **post-session summary** to improve the next session.

The trusted humans remain the primary relational anchors; the AI is the **producer**—setting context, sequencing the activity, recruiting participants, and stepping back during human-led play.

## Core Product Principles

- AI is orchestration + scaffolding, not a substitute for trusted tutors.
- Optimize for **relationship-forward learning**, not solo tutoring software.
- Keep child friction near-zero; minimize navigation inside product UI.
- Design for **mixed tutor Mandarin proficiency** in the same session formats.
- Collect **minimal learning telemetry** and avoid storing unnecessary media.
- Day 1 prioritizes **end-to-end reliability** of the full loop; UX polish matters but cannot compromise basic orchestration quality.

## Engagement Model (Why “modes,” why call-first)

Starting from playful modes (“I want to play…”) matches homes without urgent homework pressure and supports expansion later (“I need help”, “free converse”, etc.) without changing the core orchestration spine.

## Day 1 Happy Path

1. Guardian configures a trusted tutor network with **at least 3 tutors**, including Mandarin proficiency metadata (and any priority/ordering fields you choose for outreach testing).
2. Child initiates a session through the call/video entry point.
3. AI producer answers and quickly moves into **verbal mode selection** (from a small starter set).
4. Child selects a mode verbally (or confirms a suggested option).
5. System starts two parallel tracks:
   - **Outreach agent** contacts tutors in ranked order with **timeouts and fallback** so you can observe real sequencing behavior.
   - **Prep agent** generates a structured activity plan for the selected mode, adapted to student context and (when known) the accepting tutor’s proficiency.
6. Tutor accepts and joins via **SMS/link-assisted** flow (MVP remains compatible with external video surfaces).
7. Session runs ~10 minutes: producer kicks off clearly, then largely yields to humans.
8. Session ends; summarizer stores encountered concepts, retention signals, and next-session notes.

## Must-Haves (MVP)

- Guardian tutor network setup supporting **3+ tutors** for outreach testing.
- Call/video-first session initiation for the child (no primary dependency on “open the app and navigate”).
- Verbal mode selection at session start.
- Parallel **outreach + prep** orchestration.
- Outreach behavior that is **testable**: ordering, timeout, fallback, and logging/observability.
- Structured activity generation tied to the selected mode from a **starter mode catalog**.
- Tutor join flow via messaging/link.
- Post-session summary persistence retrievable for future prep context.

## Starter Mode Catalog (MVP)

- Vocabulary scavenger hunt
- Tone match
- Mini story insertion

## Near-Term Expansion Modes (Explicitly not required for Day 1)

- Learn a song (Rock Band–style pacing / call-and-response structure)
- I Spy (**tutor-mediated observation** in the room—no requirement for automated vision scoring)
- “I need help”
- Free converse

## Non-Goals (MVP)

- Voice wake-word engineering as a product requirement (unless it is trivially available)
- OCR / homework scanning ingestion
- Multi-subject expansion beyond Mandarin
- Building a heavy long-term knowledge graph engine

## UX Direction Note (Child Interaction Model)

The north star is that the child stays primarily on the **live call/video surface**. Any product UI should be optional assistance—such as a **small companion overlay**—rather than a destination workflow.

Platform feasibility for “hovering over FaceTime” varies by device/OS and may require pragmatic sequencing (for example, Picture-in-Picture patterns where supported, or companion surfaces on secondary devices). Day 1 should not assume a specific overlay mechanism works everywhere.

## Day 1 Acceptance Criteria

- Guardian can persist **at least 3 tutors** with proficiency metadata.
- Child can initiate primarily via call/video entry without requiring app-first navigation as the default path.
- Verbal mode selection results in orchestration starting reliably.
- Outreach demonstrates **timeout/fallback** behavior in testing (not just single-tutor happy path).
- Prep produces valid structured output for the selected starter mode.
- Tutor can join successfully via invite flow.
- Session completes and a summary record is written and retrievable.
- The loop can be run repeatedly with stable outcomes (reliability-first).

## Risks to Track Early

- Call/video platform constraints for companion UI patterns (overlay/Picture-in-Picture feasibility vs assumptions).
- Outreach latency and real-world tutor responsiveness variability.
- Prompt/output consistency across tutor proficiency levels.
- Privacy posture for learning logs (especially if any media interactions appear later).
- Scope creep into heavy interactive UI layers before the orchestration spine is rock solid.

## Immediate Next Step (Session 2 Preview)

Translate this scope into concrete interaction scripts and surfaces:

- opening 60–120 seconds on the call,
- producer ↔ child dialogue patterns,
- tutor join handoff,
- “what happens if nobody answers,”
- mode-specific facilitation patterns that remain human-led (including tutor-mediated I Spy).
