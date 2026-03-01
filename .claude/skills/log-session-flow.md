# SKILL: Build the Log Session Flow

Use this skill when building or extending the session logging feature.
This is the core feature of Laara — read carefully.

---

## Overview

The log-session flow lets users record a study session against a material from their library.

**Entry points:**
- Study tab "Log Study Session" button → passes `date` param
- Study tab "Add Activity" button (if session exists for date) → same
- "CONTINUE" button on a recent material → passes `materialId` + `date`

**Flow:**
```
select-material  →  active-session  →  (auto-save on stop)  →  Study tab
```

---

## Route structure

```
app/log-session/
├── select-material.tsx    # Step 1: pick material from library
└── active-session.tsx     # Step 2: timer + input form + save
```

---

## Step 1 — select-material.tsx

**Purpose:** Show library materials, let user tap one to start a session.

**Receives params:** `date` (YYYY-MM-DD string)

**Key behaviors:**
- Show all materials grouped or filtered (same FilterBar as library)
- Tapping a material navigates to `active-session` with `{ materialId, date }`
- Show `EmptyState` if library is empty (with link to add material)
- Search/filter is nice to have, not required for MVP

**Component:** Similar to Library tab but cards are tappable with a different affordance.

---

## Step 2 — active-session.tsx

**Purpose:** Timer runs, user records what they did, taps "Save."

**Receives params:** `materialId` (number), `date` (YYYY-MM-DD string)

**Key behaviors:**

### Timer
- Start timer on mount (count-up, not countdown for MVP)
- Display as `MM:SS` or `H:MM:SS`
- Timer persists if user backgrounds app (use `Date.now()` start time, not interval counter)

```ts
// Robust timer pattern — survives backgrounding
const [startTime] = useState(() => Date.now());
const [elapsed, setElapsed] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setElapsed(Math.floor((Date.now() - startTime) / 1000));
  }, 1000);
  return () => clearInterval(interval);
}, [startTime]);

const elapsedMinutes = Math.max(1, Math.round(elapsed / 60)); // minimum 1 min
```

### Material display
- Show `CardCover` + material name + type badge at top
- User should know what they're logging against

### Input fields (type-specific units)
Reuse `ActivityDetailsForm` from `src/components/logSession/ActivityDetailsForm.tsx` — it already handles type-specific fields (pages, episodes, videos, lessons, sessions).

```tsx
<ActivityDetailsForm
  materialType={material.type}
  timeMode={timeMode}
  selectedQuickTime={selectedQuickTime}
  customTime={customTime}
  onQuickTimeSelect={handleQuickTimeSelect}
  onCustomTimeChange={setCustomTime}
  pagesRead={pagesRead}
  chaptersRead={chaptersRead}
  unitsStudied={unitsStudied}
  onPagesReadChange={setPagesRead}
  onChaptersReadChange={setChaptersRead}
  onUnitsStudiedChange={setUnitsStudied}
/>
```

### Time input logic
The form has two modes: quick-pick (15/30/45/60 min buttons) OR custom text input.
Timer elapsed time should pre-fill or influence the custom time field.

```ts
// When user taps "Save", resolve final duration:
const getFinalDuration = (): number => {
  if (selectedQuickTime) return selectedQuickTime;
  if (customTime) return parseInt(customTime, 10) || elapsedMinutes;
  return elapsedMinutes; // fall back to actual elapsed
};
```

### Save logic
```ts
const handleSave = async () => {
  const duration = getFinalDuration();
  if (duration <= 0) {
    Alert.alert("Duration required", "Please enter how long you studied.");
    return;
  }

  try {
    setLoading(true);
    
    // 1. Upsert session for this date
    const sessionId = await getOrCreateSessionForDate(date);
    
    // 2. Add activity
    await addActivity({
      session_id: sessionId,
      material_id: materialId,
      duration_minutes: duration,
      units_studied: getUnitsStudied(), // type-specific
    });
    
    // 3. Update material progress if units were entered
    if (shouldUpdateProgress()) {
      await updateMaterialProgress(materialId, getUnitsStudied());
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace("/(tabs)"); // go back to study tab, not back stack
  } catch (error) {
    console.error("Error saving session:", error);
    Alert.alert("Error", "Failed to save session. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

### Discard logic
```ts
const handleDiscard = () => {
  Alert.alert(
    "Discard session?",
    "Your timer progress will be lost.",
    [
      { text: "Keep going", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.replace("/(tabs)") }
    ]
  );
};
```

---

## Database queries needed

Add these to `src/database/queries.js` (use database-query.md skill for implementation):

```ts
// Upsert session for a date — returns session_id
getOrCreateSessionForDate(date: string): Promise<number>

// Insert an activity and update session total_duration
addActivity(data: {
  session_id: number,
  material_id: number,
  duration_minutes: number,
  units_studied?: number | null,
  notes?: string | null,
}): Promise<void>

// Update material's current_unit (progress tracking)
updateMaterialProgress(materialId: number, unitsToAdd: number): Promise<void>
```

---

## MVP scope (happy path only)

For the first build, keep it tight:

**In scope:**
- Select material from library
- Timer (count-up)
- Quick time buttons + custom input
- Units studied (type-specific)
- Save → go to Study tab
- Discard with confirmation

**Out of scope for MVP:**
- Pomodoro mode
- Notes field
- Editing a past session
- Multiple materials in one session
- Pause/resume timer
- Background timer notifications

---

## UI/UX notes

- The active session screen should feel focused — minimal UI, big timer
- Timer display: large, centered, monospaced feel
- The "Stop & Save" button should be prominent (full width, primaryAccent)
- "Discard" should be subtle (text link, not a button)
- Show material name + type so user knows what they're logging

---

## Checklist

- [ ] `select-material.tsx` receives and passes `date` param
- [ ] `active-session.tsx` receives `materialId` and `date`
- [ ] Timer uses `Date.now()` (not interval counter) — survives backgrounding
- [ ] Duration falls back to elapsed time if no input
- [ ] `getOrCreateSessionForDate` upserts correctly
- [ ] `addActivity` updates `sessions.total_duration` atomically
- [ ] After save: `router.replace("/(tabs)")` not `router.back()` (avoid back to timer)
- [ ] Discard shows confirmation Alert
- [ ] Haptics on save success
- [ ] Loading state while saving
