# Session 3 - Agent and Data Contracts (Rev 1)

Status: In review  
Date: 2026-05-07

## 1) Locked Direction (from previous step)

- Agent-in-call interaction model is the target UX.
- Dual-path implementation strategy is required:
  - FaceTime-aspirational path.
  - Controllable-call MVP path with equivalent user experience shape.
- Parent-first required UI; child/tutor can operate call-first.
- Session must degrade gracefully to voice-first if visual layer fails.

## 2) Orchestration Roles and Contracts

### 2.1 Conversation Agent (live session producer)
Purpose: join live session, run opening, pace activity, provide rescue prompts.

**Input**
- `sessionId`
- `modeId`
- `activityPlan`
- `participantContext` (child profile, tutor level, language prefs)
- `callContext` (provider, room/call id, media capabilities)

**Output events**
- `conversation.opened`
- `round.prompted`
- `round.completed`
- `conversation.rescue_prompted`
- `conversation.closed`

### 2.2 Outreach Agent
Purpose: recruit available tutor with deterministic timeout/fallback.

**Input**
- `sessionId`
- `candidateTutors[]` with `priorityScore`, `contactMethod`, `timeoutSeconds`
- `joinLink`

**Output**
- success:
  - `selectedTutorId`
  - `acceptedAt`
  - `attemptCount`
- failure:
  - `reason` (`no_response|delivery_error|all_declined`)
  - `attemptCount`

### 2.3 Prep Agent
Purpose: generate structured activity for selected mode with tutor-level scaffolds.

**Input**
- `sessionId`
- `modeId`
- `studentContext` (recent concepts, known gaps, age band)
- `tutorLevel` (best-known or fallback)

**Output**
- `activityPlan` JSON (schema-validated)
- `renderPayload` (for agent feed + optional companion views)
- `fallbackVoicePrompts[]`

### 2.4 Summarizer Agent
Purpose: persist learning evidence and next-session prep hints.

**Input**
- `sessionId`
- `modeId`
- `roundEvents[]`
- `completionMeta`

**Output**
- `encounteredConcepts[]`
- `retentionSignals[]`
- `nextSessionHints`
- `parentSummaryCard`

## 3) Session State Transition Table

| From | Event | To | Notes |
|---|---|---|---|
| `requested` | `mode_selected` | `initiated` | Child picks/accepts mode verbally. |
| `initiated` | `start_parallel_jobs` | `outreach_in_progress` + `prep_in_progress` | Parallel substates tracked independently. |
| `outreach_in_progress` | `tutor_accepted` | `tutor_joined` | Attempt metadata persisted. |
| `outreach_in_progress` | `all_attempts_failed` | `no_tutor_fallback` | Voice-first fallback flow. |
| `prep_in_progress` | `activity_validated` | `prep_ready` | Must pass strict schema validation. |
| `tutor_joined` + `prep_ready` | `start_live` | `live_session` | Conversation agent runs session. |
| `live_session` | `complete_session` | `session_completed` | Non-blocking finalization. |
| `session_completed` | `summary_written` | `summary_persisted` | Final success state. |
| `session_completed` | `summary_failed` | `summary_retry_queued` | Async retry; session remains complete. |

## 4) Minimal JSON Contracts

### 4.1 ActivityPlan schema (MVP)
```json
{
  "sessionId": "uuid",
  "modeId": "vocab_hunt|tone_match|mini_story|learn_song|i_spy",
  "durationMinutes": 10,
  "targetConcepts": [
    { "hanzi": "苹果", "pinyin": "ping guo", "english": "apple" }
  ],
  "rounds": [
    {
      "roundId": "r1",
      "goal": "Find one object matching 苹果",
      "childPrompt": "Can you find an apple or something like one?",
      "tutorScaffoldByLevel": {
        "zero": "Say: Let's look for ping guo together.",
        "fluent": "Prompt naturally in Mandarin and ask follow-up."
      },
      "successSignalsHumanConfirmable": ["child_identified_object"]
    }
  ],
  "fallbackVoicePrompts": [
    "No worries, let's try one easier word together."
  ]
}
```

### 4.2 OutreachAttempt schema
```json
{
  "sessionId": "uuid",
  "tutorId": "uuid",
  "attemptOrder": 1,
  "contactMethod": "sms|whatsapp",
  "sentAt": "iso8601",
  "timeoutSeconds": 90,
  "result": "accepted|declined|timeout|delivery_error",
  "respondedAt": "iso8601|null"
}
```

### 4.3 LearningSummary schema
```json
{
  "sessionId": "uuid",
  "modeId": "vocab_hunt",
  "encounteredConcepts": ["苹果", "水", "米饭"],
  "retentionSignals": [
    { "concept": "苹果", "signal": "independent_recall", "confidence": "medium" }
  ],
  "nextSessionHints": "Reinforce food words with quick retrieval rounds.",
  "parentSummaryCard": "Practiced 3 food words; apple was strongest."
}
```

## 5) Minimal Supabase Schema Draft

### `sessions`
- `id` uuid pk
- `student_id` uuid fk
- `mode_id` text
- `status` text
- `call_provider` text
- `call_reference` text
- `selected_tutor_id` uuid nullable fk
- `created_at`, `started_at`, `ended_at`

### `tutors`
- `id` uuid pk
- `guardian_id` uuid fk
- `name` text
- `mandarin_level` text
- `contact_value` text
- `priority_score` numeric
- `status` text

### `outreach_attempts`
- `id` uuid pk
- `session_id` uuid fk
- `tutor_id` uuid fk
- `attempt_order` int
- `contact_method` text
- `sent_at` timestamptz
- `timeout_seconds` int
- `result` text
- `responded_at` timestamptz nullable

### `activities`
- `id` uuid pk
- `session_id` uuid fk
- `mode_id` text
- `payload_json` jsonb
- `validated` boolean
- `created_at` timestamptz

### `session_events`
- `id` bigint pk
- `session_id` uuid fk
- `event_type` text
- `event_payload` jsonb
- `created_at` timestamptz

### `learning_summaries`
- `id` uuid pk
- `session_id` uuid fk
- `student_id` uuid fk
- `payload_json` jsonb
- `created_at` timestamptz

## 6) Reliability and Failure Rules

- Prep output must pass schema validation before entering `prep_ready`.
- Outreach must log every attempt and timeout deterministically.
- If tutor cannot be recruited, route to `no_tutor_fallback` with voice-first mini-rounds.
- Summary failures never roll back completed sessions; queue retry.

## 7) Next Review Target (Session 3 Rev 2)

- Decide final provider strategy for dual-path call integration.
- Confirm timeout/retry policy values.
- Lock state names and event taxonomy for implementation.
