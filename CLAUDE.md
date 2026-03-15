# CLAUDE.md — Laara Project Reference

> This file is the canonical reference for all AI-assisted development on this project.
> Read this before writing any code. Update it when conventions change.

---

## Project Overview

**Laara** is a React Native / Expo mobile app for serious language learners.
It is a **study logger and material library** — not a teaching app.

Target user: AJATT/immersion learners, polyglots, r/languagelearning power users.
Pricing: $4.99 one-time purchase. No subscription.

Tech stack: React Native 0.81 · Expo SDK 54 · TypeScript · Expo Router · SQLite (expo-sqlite)

---

## Folder Structure

```
laara-app/
├── app/                          # Expo Router screens (file = route)
│   ├── _layout.tsx               # Root layout: GestureHandlerRootView + PortalProvider + Stack
│   ├── index.tsx                 # Welcome/intro screen (entry point)
│   ├── language-selection.tsx    # Onboarding step 1
│   ├── (tabs)/                   # Bottom tab navigator
│   │   ├── _layout.tsx           # Tab config (Study, Library, Reports, Settings)
│   │   ├── index.tsx             # Study/Dashboard tab
│   │   ├── library.tsx           # Library tab
│   │   ├── reports.tsx           # Reports tab
│   │   └── settings.tsx          # Settings tab
│   ├── add-material/             # Material creation flow (modal-style screens)
│   │   ├── index.tsx             # Category picker
│   │   ├── book.tsx
│   │   ├── audio.tsx
│   │   ├── video.tsx
│   │   ├── class.tsx
│   │   └── app.tsx
│   ├── settings/                 # Settings sub-screens
│   │   └── manage-languages.tsx  # Manage user languages
│   ├── log-session/              # Session logging flow
│   │   ├── select-material.tsx   # Material picker
│   │   ├── active-session.tsx    # Count-up timer
│   │   └── session-summary.tsx   # Post-session logging form
│   └── onboarding/
│       └── level-selection.tsx
│
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── EmptyState.tsx
│   │   ├── addMaterial/          # Components specific to add-material flow
│   │   ├── forms/                # Shared form primitives
│   │   │   ├── ActionButtons.tsx
│   │   │   ├── BookForm.tsx
│   │   │   ├── FormHeader.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchEmptyState.tsx
│   │   │   └── TypeSelectorModal.tsx
│   │   ├── icons/                # SVG icon components
│   │   │   ├── small/            # 16px metadata icons
│   │   │   └── Nav*.tsx          # Tab bar icons
│   │   ├── logSession/           # Components for log session flow
│   │   ├── navigation/
│   │   │   └── TabIcon.tsx
│   │   ├── svgGraphics/          # Illustration SVGs (not icons)
│   │   ├── tabs/
│   │   │   ├── library/          # Library tab components
│   │   │   └── study/            # Study tab components
│   │   └── ui/                   # Generic UI primitives
│   │
│   ├── database/
│   │   ├── database.js           # initDatabase() — runs migrations on startup
│   │   ├── queries.js            # ALL SQL queries live here (never inline in components)
│   │   ├── migrations.js         # Versioned schema migrations
│   │   └── languageData.js       # Seed data for languages
│   │
│   ├── theme/
│   │   ├── colors.ts             # All color constants (use these, never hardcode hex)
│   │   ├── spacing.ts            # spacing.xs/sm/md/lg/xl/xxl + borderRadius
│   │   ├── typography.ts         # typography.headingSmall/bodyMedium/etc
│   │   └── styles.ts             # globalStyles (container, buttonPrimary, etc.)
│   │
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Helper functions (seedLibraryData, etc.)
│
└── assets/
    ├── fonts/                    # Domine (Regular/Medium/SemiBold/Bold)
    └── images/
```

---

## Naming Conventions

| Thing                 | Convention                  | Example                              |
| --------------------- | --------------------------- | ------------------------------------ |
| Component files       | PascalCase                  | `LibraryItem.tsx`                    |
| Route files           | kebab-case                  | `add-material/book.tsx`              |
| Hooks                 | camelCase with `use` prefix | `useFocusEffect`                     |
| Query functions       | camelCase verbs             | `getMaterialById`, `addMaterial`     |
| Theme constants       | camelCase                   | `colors.primaryAccent`, `spacing.lg` |
| Interfaces            | PascalCase                  | `interface Material {}`              |
| Local state variables | camelCase                   | `const [loading, setLoading]`        |

---

## Screen Structure Pattern

> ⚠️ **SafeAreaView inside tab navigator:** Always pass `edges={['top', 'left', 'right']}` to `SafeAreaView` on screens rendered inside the bottom tab navigator. The tab navigator already handles bottom safe area — omitting this causes a double-padding gap above the tab bar.

Every screen follows this exact structure — do not deviate:

```tsx
// app/some-screen.tsx
export default function SomeScreen() {
  // 1. Params / route
  // 2. State declarations
  // 3. Effects (useEffect, useFocusEffect)
  // 4. Handler functions (handle*)
  // 5. Loading guard (return early)
  // 6. JSX return

  return (
    <SafeAreaView style={globalStyles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <View style={styles.content}>
        {/* screen content */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ ... });
```

---

## Form Screen Pattern

All "add/edit" form screens share this layout:

```
SafeAreaView
  View (content, flex:1, backgroundColor: colors.gray50)
    FormHeader (back button + title)
    KeyboardAvoidingView (flex:1)
      ScrollView (flex:1, keyboardShouldPersistTaps="handled")
        [form fields]
    View (buttonContainer — OUTSIDE KeyboardAvoidingView, fixed bottom)
      ActionButtons (Save + Cancel)
```

Key details:

- `backgroundColor: colors.gray50` on content and buttonContainer for consistent background
- Focus state tracked locally: `const [focusedField, setFocusedField] = useState<string | null>(null)`
- Focused input gets `borderColor: colors.primaryAccent` via `inputFocused` style
- `ActionButtons` only renders when form is visible (not during search state)

---

## Component Patterns

### TypeSelectorModal

Use for any dropdown/picker. Renders a bottom sheet via `@gorhom/portal`.
Required: wrap app in `<PortalProvider>` (already done in `_layout.tsx`).

```tsx
<TypeSelectorModal
	categories={subcategories} // string[]
	selectedCategory={selectedSubcategory}
	onSelectCategory={setSelectedSubcategory}
	label="Type"
/>
```

### CardCover

Renders a colored tile with a category icon. Used in library list and session activity cards.

```tsx
<CardCover type={material.type} /> // type: "book" | "audio" | "video" | "class" | "app"
```

### FilterBar / FilterChip

Horizontal scrolling filter bar for the library screen. Pass `filters: {label, value}[]`.

### EmptyState

Full-screen empty state with illustration and CTA. Has three `__DEV__`-only seed scenario buttons: Basic library (one language), Two languages (ES+JA), Full state (two languages + sessions).

---

## Data Layer

> ⚠️ **Date range queries:** Always use `<=` not `<` when filtering by today's date. Using `session_date < today` excludes today's sessions entirely. The correct pattern is `session_date <= today` or `session_date BETWEEN start AND end` (inclusive).

**All database operations go in `src/database/queries.js`.**
Components import and call query functions — never write SQL in components.

### Material data shape (from DB):

```ts
interface Material {
	id: number;
	name: string;
	type: "book" | "audio" | "video" | "class" | "app";
	subtype?: string; // e.g. "novel", "podcast", "youtube"
	author?: string; // creator/instructor/host
	total_units?: number; // pages / episodes / videos / sessions / lessons
	current_unit?: number; // progress tracking
	progress_percentage?: number;
}
```

### Session data shape (table: `daily_sessions` + `session_activities`):

```ts
interface Session {
	id: number;
	session_date: string; // "YYYY-MM-DD"
	total_duration: number; // minutes (sum of all activities)
	activities: Activity[];
}

interface Activity {
	id: number;
	session_id: number;
	material_id: number;
	material_name: string; // joined from materials
	material_type: string; // joined from materials
	material_subtype?: string; // joined from materials
	duration_minutes: number;
	units_studied?: number;
	// NOTE: no "notes" column in session_activities
}
```

### Key query functions (confirmed from source):

**Materials:**

- `getAllMaterials()` → `Material[]` (includes `calculated_progress`)
- `getMaterialById(id)` → `Material`
- `addMaterial(data)` → `number` (new ID)
- `updateMaterialProgress(materialId, unitsToAdd, progressPercentage)` → void — **3 args**
- `deleteMaterial(id)` → void

**Sessions (daily_sessions table):**

- `getOrCreateTodaySession(date)` → `{ id, session_date, total_duration, ... }` — upserts
- `getTodaySession(date)` → session with `activities[]` or null
- `getSessionByDate(date)` → session with `activities[]` or null
- `getRecentSessions(limit)` → sessions with `activities[]` (excludes today)
- `getStudyDaysInMonth(year, month)` → `string[]` (YYYY-MM-DD) — queries `daily_sessions`
- `getStreakCount()` → `Promise<number>` — consecutive study days ending today (or yesterday if today unstudied)

**Activities (session_activities table):**

- `addSessionActivity({ session_id, material_id, duration_minutes, units_studied })` → activity ID
- `updateSessionTotalDuration(sessionId)` → void — recalculates from activities sum
- `getSessionActivities(sessionId)` → `Activity[]`
- `deleteSessionActivity(activityId)` → void (also updates session total)
- `getRecentlyStudiedMaterials(limit)` → recent unique materials from activities

**Languages:**

- `getFeaturedLanguages()` → featured languages
- `getAllNonFeaturedLanguages()` → all other languages alphabetically
- `getLanguageByCode(code)` → language object
- `searchLanguages(query)` → matching languages

**Settings:**

- `getUserSettings()` → settings object (includes `proficiency_level`)
- `updateUserSettings(settings)` → void
- `getUserLevel()` → CEFR level string or null
- `updateUserLevel(level)` → void
- `getOnboardingCompleted()` → `Promise<boolean>` — reads `onboarding_completed` from `user_settings`; returns `false` on error (safe default shows onboarding)
- `setOnboardingCompleted()` → `Promise<void>` — sets `onboarding_completed = 1`

**User Languages:**

- `getUserLanguages()` → `UserLanguage[]` — `{ language_code, name, flag, greeting, is_active }`
- `removeUserLanguage(code)` → void — DELETE from `user_languages` only; materials/sessions preserved

**Reports:**

- `getReportData(startDate, endDate, languageCode = null)` → `ReportData` — accepts optional language filter. All sub-queries (totals, byType, mostStudied, unitsByType) filter by `language_code` when provided. Uses `AND (m.language_code = ? OR m.language_code IS NULL)` to include legacy materials with NULL language_code. Totals query uses LEFT JOINs to preserve days with no activities in `daysStudied` count.

**Categories:**

- `getSubcategoriesByCategory(categoryCode)` → subcategory objects
- `getAllActiveCategories()` → category objects
- `getCategoryByCode(code)` → category object

---

## Multi-Language Architecture

### `user_languages` table

Stores which languages a user is learning. Each row: `language_code` (FK → `languages`), `is_active` (1 = currently active language shown on dashboard), `added_at`.

- A user always has at least one language. The active language cannot be removed.
- `removeUserLanguage(code)` only removes from `user_languages` — materials and sessions with that `language_code` are preserved.
- To switch active language: update `is_active` flag (future feature).

### `materials.language_code` column

Each material is tagged with the language it belongs to. Materials added before this column existed may have `language_code = NULL` — treat these as belonging to all languages (always include them in any language-filtered query).

### Language filter pattern in queries

```js
const langFilter = languageCode
  ? "AND (m.language_code = ? OR m.language_code IS NULL)"
  : "";
const params = languageCode ? [...baseParams, languageCode] : baseParams;
```

Use LEFT JOINs (not INNER) when adding materials to aggregate queries — INNER JOIN drops sessions that have no matching activities, distorting `daysStudied`.

### Reports language filter

`getReportData(startDate, endDate, languageCode = null)` — third param is optional. When null, returns data for all languages. When set, filters all sub-queries. The streak counter (`getStreakCount`) is always global — it counts any study day regardless of language.

### Language filter UI (reports.tsx)

Language chips row is only rendered when `userLanguages.length > 1`. Default is "All" (null). When a specific language is active, the streak label shows `"DAY STREAK 🌍"` to indicate the streak is global, not per-language.

---

## Theme Usage

Always use theme constants. Never hardcode values in component styles.

```ts
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography } from "@theme/typography";
import { globalStyles } from "@theme/styles";
```

Common colors:

- `colors.primaryAccent` — main CTA color (coral/orange)
- `colors.primaryAccentLight` — light variant for calendar study days
- `colors.grayDarkest` / `grayDark` / `grayMedium` / `grayLight` / `grayLightest`
- `colors.gray50` / `gray200` / `gray300` — backgrounds / borders
- `colors.white`
- `colors.categoryBook/Audio/Video/Class/App` — bg colors for card covers
- `colors.categoryBookIcon/AudioIcon/...` — icon colors for card covers

Common spacing: `spacing.xs` (4) · `sm` (8) · `md` (12) · `lg` (16) · `xl` (24) · `xxl` (32)

---

## Navigation

Expo Router file-based routing.

```ts
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "expo-router";

// Navigate
router.push("/add-material");
router.push(`/add-material/${category.code}`);
router.push({ pathname: "/log-session/select-material", params: { date: selectedDate } });
router.replace("/(tabs)");
router.back();
```

Pass params via `params` object or URL string. Read with `useLocalSearchParams()`.

---

## Haptics

Use haptics on every user action:

```ts
import * as Haptics from "expo-haptics";

Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // navigation, minor
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // primary actions (save, add)
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // after async success
```

---

## Data Refresh Pattern

Use `useFocusEffect` (not `useEffect`) to reload data when a tab/screen comes back into focus:

```ts
useFocusEffect(
	useCallback(() => {
		loadData();
	}, [dependency]),
);
```

---

## Known Issues / Tech Debt

> Fix these before building heavily on top of them.

1. **Dead form components** — `AudioFormFields.tsx`, `VideoFormFields.tsx`, `ClassFormFields.tsx`, `AppFormFields.tsx` exist but are not used. The form screens inline their own fields. Either delete these or migrate to using them.

2. **`ItemMetadata` prop drift** — `LibraryItem.tsx` passes `subtype` to `ItemMetadata` but `ItemMetadataProps` doesn't declare it. TypeScript will complain if strict mode is tightened.

3. **`totalChapters` not saved** — `app/add-material/book.tsx` tracks `totalChapters` in state but only `totalPages` is saved to `total_units`. Chapters are silently dropped.

4. **`RecentMaterials` icon logic** — For `type === "class"` with `subtype === "textbook"`, it renders `VideoIcon`. This is almost certainly wrong.

5. **`error.message` without type** — Several catch blocks use `error.message` without typing the catch param. Add `: unknown` and cast or use a helper.

6. **`updateMaterialProgress` called with 2 args** — function signature requires 3: `(materialId, unitsToAdd, progressPercentage)`. Third arg is always `undefined` currently, so `progress_percentage` column never updates. Fix: fetch material first, calculate percentage, pass it. (`session-summary.tsx` already does this correctly.)

7. **`user_languages.is_active` semantics unclear** — `is_active` on `user_languages` tracks the "primary" language shown on the dashboard, but there's no enforcement that exactly one row has `is_active = 1`. If the active language is removed (currently blocked in UI) or if seeding sets multiple active flags, the dashboard greeting may show wrong data. Add a constraint or enforce in queries.

8. **`getStreakCount()` is always global** — streak counts any study day regardless of language filter. This is intentional for now (streak shown in Reports always uses 🌍 indicator when language filter is active), but if per-language streaks are ever wanted, a separate query will be needed.

---

## What's Built vs. What's Needed

### Built ✅

- Onboarding (language selection, level selection)
- Material library (add, edit, delete, filter, browse)
- Study tab (calendar week, session display, date selection, recent sessions)
- Log session flow (`select-material` → `active-session` timer → `session-summary` → saves)
- Study tab dashboard (redesigned — greeting header, calendar strip, BEGIN button, recent sessions)
- Onboarding skip — returning users go straight to `/(tabs)` on launch
- Design token system — `borderRadius.button` (16) + `buttonBase` applied to all buttons across all screens; `borderRadius.input` (10) + `globalStyles.inputLabel/input/inputFocused/inputContainer` applied to all form fields across all screens
- BookForm redesign — hero icon section, uppercase label tokens, Author + Total Pages in side-by-side row
- ActionButtons redesign — height 56, coral drop shadow on save button, consistent font weight
- TypeSelectorModal label updated to match global input label token
- All add-material form screens (book, audio, video, class, app) now use global input tokens — no local label/input/inputFocused styles
- session-summary.tsx redesigned — circular × discard button, global input tokens, Duration + unit fields in side-by-side row
- **Reports tab** — fully built: period filter (week/month/all), language filter chips, donut chart by type, hero time card, stats row (sessions/days/streak), most studied card, units breakdown card
- **Multi-language support** — `user_languages` table, `materials.language_code`, language filter in `getReportData`, language chip filter in Reports, manage-languages screen in Settings
- **Settings tab** — built: Manage languages row, Level modal (two-step: reason + level picker), toast, notifications toggle (UI only), export/restore/about stubs, clear data stub
- **Manage Languages screen** (`app/settings/manage-languages.tsx`) — list of user languages, active badge, remove button (inactive non-sole languages only), add language CTA
- **Dev seed scenarios** — three `__DEV__` seed buttons in EmptyState: Basic library, Two languages (ES+JA), Full state (two languages + 5 sessions across 7 days)

### Needs Building 🔨

- **Settings/Profile tab** — notifications (expo-notifications), export data, restore from backup, clear all data (all stubbed)
- **Paywall / upgrade screen** — triggered when free user hits material limit or taps locked analytics

### Next Up 🎯

- Notifications (expo-notifications) — requires physical iOS device to test
- Export data flow

---

## ✅ Confirmed Files (verified from source)

All theme files are `.js`, not `.ts`.

| File                                  | Status | Notes                                                                                                                                                                                                                                                        |
| ------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/database/database.js`            | ✅     | Sync SQLite. Tables: `languages`, `categories`, `subcategories`, `materials`, `study_sessions`, `user_settings`, `daily_sessions`, `session_activities`                                                                                                      |
| `src/database/queries.js`             | ✅     | See "Key query functions" section                                                                                                                                                                                                                            |
| `src/database/migrations.js`          | ✅     | Only `migrateLanguages()` — no versioned migration system                                                                                                                                                                                                    |
| `src/database/languageData.js`        | ✅     | `COMPREHENSIVE_LANGUAGES[]` — `{ code, name, flag, greeting, is_featured, display_order }`                                                                                                                                                                   |
| `src/theme/colors.js`                 | ✅     | Keys: `primaryAccent`, `primaryAccentLight`, `white`, `gray50`, `grayLightest`, `grayLight`, `gray200`, `gray300`, `grayLightMedium`, `grayMedium`, `grayDark`, `grayDarkest`, `categoryBook/Audio/Video/Class/App`, `categoryBookIcon/…` — **no `gray100`** |
| `src/theme/spacing.js`                | ✅     | `xs:8`, `sm:12`, `md:16`, `lg:24`, `xl:32`, `xxl:40`. `borderRadius`: `sm:8`, `md:12`, `lg:16`, `pill:20`                                                                                                                                                    |
| `src/theme/typography.js`             | ✅     | `headingLarge/Medium/Small` (Domine), `bodyLarge/Medium/Small`, `button`, `label` (system font)                                                                                                                                                              |
| `src/theme/styles.js`                 | ✅     | `globalStyles.container`, `card`, `buttonPrimary/Secondary…`, `input`, `inputFocused`, `pill`, heading/body shortcuts, `emptyState…`                                                                                                                         |
| `src/utils/activityLogValidation.ts`  | ✅     | `validateActivityForm()` returns `boolean` (not an object). Alert shown internally                                                                                                                                                                           |
| `src/utils/dateHelper.ts`             | ✅     | `formatDateToYYYYMMDD`, `getCurrentWeekDates`, `isToday`, `getRelativeTime`, `getDayLetter`                                                                                                                                                                  |
| `src/utils/materialUtils.ts`          | ✅     | `getUnitLabel(type, count)`, `getProgressText(type, current, total)`, `getActivityText(type, units)`                                                                                                                                                         |
| `src/utils/seedLibraryData.js`        | ✅     | `seedLibraryData()` → `{ success, added, failed, total }`. Also exports `seedTwoLanguages()` (ES+JA materials, sets `user_languages`) and `seedFullState()` (two languages + 5 sessions over 7 days, 3-day streak).                                           |
| `app/log-session/select-material.tsx` | ✅     | Built, working. Recently Studied section for 5+ materials                                                                                                                                                                                                    |
| `app/log-session/active-session.tsx`  | ✅     | Count-up timer. Ref-based state (avoids stale closures). AppState backgrounding. Pause/resume. Navigates to `session-summary` on End via `router.replace`.                                                                                                   |
| `app/log-session/session-summary.tsx` | ✅     | Post-session logging form. Receives `elapsedSeconds`, pre-fills duration. Type-aware unit field label. Notes field. Full save logic (getOrCreateTodaySession → addSessionActivity → updateSessionTotalDuration → updateMaterialProgress).                    |
| `app/(tabs)/index.tsx`                | ✅     | Redesigned study tab — greeting header, weekly calendar strip (Sun–Sat), 144px coral BEGIN button with glow, recent sessions card                                                                                                                            |
| `app/(tabs)/library.tsx`              | ✅     | Filter bar, list, edit, delete                                                                                                                                                                                                                               |
| `app/(tabs)/reports.tsx`              | ✅     | Fully built. Period filter (week/month/all time), language filter chips (hidden when single language), donut chart, hero time card, stats row, most studied card, units breakdown. `getReportData(startDate, endDate, languageCode)` — language param optional. |
| `app/(tabs)/settings.tsx`             | ✅     | Fully built. "Manage languages" row → `/settings/manage-languages`. Level row → two-step Modal. Joined date read-only. Notifications toggle (UI only). Export/restore/about stubs. Clear all data stub (destructive zone).                                    |
| `app/settings/manage-languages.tsx`   | ✅     | Lists user languages. Active language shows coral badge, cannot be removed. Inactive language (when >1 exist) shows Remove button → Alert → `removeUserLanguage()`. "＋ Add a language" → `/language-selection?mode=add`. Auto-discovers via Expo Router.     |
| `app/onboarding/level-selection.tsx`  | ✅     | CEFR picker, saves via `updateUserLevel`                                                                                                                                                                                                                     |
| `app/add-material/*.tsx`              | ✅     | book, audio, video, class, app — all support add + edit mode via `params.id`                                                                                                                                                                                 |

| `app/language-selection.tsx`          | ✅     | Language picker for onboarding and adding new languages. Accepts `mode` param: `"onboarding"` (default) or `"add"`. In `"add"` mode: inserts into `user_languages` and calls `router.back()` instead of navigating to level selection.                        |

### Still unconfirmed:

| File           | What to check                                                                                |
| -------------- | -------------------------------------------------------------------------------------------- |
| `src/types/`   | What type definitions exist — avoid duplicating `Material`, `Activity`, `Session` interfaces |

---

## Fonts

Custom font: **Domine** (Regular, Medium, SemiBold, Bold).
Loaded in `_layout.tsx` via `expo-font`.

```ts
fontFamily: "Domine-Bold"; // for headings
fontFamily: "Domine-Medium"; // for subheadings
// Most body text uses system font weight instead of Domine
```

---

## Product & Monetization

### Model

Freemium with a **one-time paid unlock** (no subscription). Free tier is genuinely useful, not crippled. Paid unlock is for power users who want deeper insight into their long-term data.

### Free vs. Paid Split

| Feature         | Free                              | Paid (one-time unlock)                                  |
| --------------- | --------------------------------- | ------------------------------------------------------- |
| Core logging    | Unlimited                         | Unlimited                                               |
| Materials       | Up to 5                           | Unlimited                                               |
| Session history | Last 7–14 days                    | Full history                                            |
| Analytics       | Basic (e.g. total time this week) | Full (time by type, progress charts, streaks over time) |

### Rules when implementing limits

- **Never delete or hide data** — if a free user has logged 30 sessions, store all 30. Only limit what's _displayed_
- **Grandfather existing users** — if a limit is introduced in an update, users who already exceed it keep what they have. Only enforce on new additions going forward
- **Free tier should feel useful**, not punishing — the upgrade is for engaged users who want more, not a wall that blocks basic use

### Planned screens that touch monetization

- **Reports tab** — build with free/paid split in mind from day one. Basic stats visible free, full analytics behind unlock
- **History screen** ("See all" from dashboard) — show last 7–14 days free, full history paid
- **Paywall/upgrade screen** — needs to be designed, triggered when user hits a limit or taps a locked feature

### Dashboard redesign (built ✅)

- Language greeting top left (from `getLanguageByCode`, Domine-Bold 32px)
- Status pill top right — flag emoji + `🔥 N DAYS` streak count (coral background, white text)
- Weekly calendar strip (Sun–Sat, display-only) — studied days outlined in coral, today filled dark, future/plain muted
- "READY TO CONTINUE?" label + last studied material name in italic Domine (from `getRecentlyStudiedMaterials(1)`)
- 144×144 circular coral BEGIN button with soft glow (210×210, opacity 0.15)
- "Previous sessions" white card (rounded top) — activity rows: category color tile + material name + relative date + duration

### BEGIN button flow (built ✅)

BEGIN always navigates directly to `select-material` — no confirmation step:

```
BEGIN → select-material → active-session (timer) → session-summary → Study tab
```

- Material name shown above BEGIN is informational only (last studied, via `getRecentlyStudiedMaterials(1)`)
- No intermediate confirmation screen was built

---

## Screen Flows

### Manage Languages (`app/settings/manage-languages.tsx`)

Accessed from Settings → "Manage languages".

- Lists all languages in `user_languages`
- Active language: coral pill badge ("Active"), no remove action
- Inactive language (when user has >1 total): red "Remove" text → Alert confirmation → `removeUserLanguage(code)` → refresh
- Sole remaining language: no remove option on any row (prevents empty state)
- "＋ Add a language" row at bottom → `router.push({ pathname: '/language-selection', params: { mode: 'add' } })`
- `useFocusEffect` refreshes list when returning from language-selection
- No _layout.tsx registration needed — Expo Router auto-discovers `app/settings/` routes

---

### Main Dashboard (`app/(tabs)/index.tsx`)

Visual layout (mockup approved, fonts/sizes not final):

- "Study" heading top left, streak badge top right (🔥 12 DAYS)
- Weekly calendar strip — coral outlined circles for days studied, solid black for today, no circle for future days
- "READY TO CONTINUE?" small caps label + last studied material name in serif italic (only shown when session history exists)
- Large circular coral BEGIN button with play icon
- Soft coral glow/shadow under button
- "Previous sessions" section below — material name (bold), relative date + time (muted), duration (italic right-aligned)
- "See all" link top right of section header

BEGIN button behavior:

- Taps → navigates to `material-selector` screen (always)
- No inline confirmation on dashboard — material name above button is informational only

---

### Material Selector (`app/material-selector.tsx`)

Purpose: choose what to study right now. Not a management screen — no edit/delete actions.

**State 1 — No materials in library**

- Show empty state message + CTA button to go add materials to Library
- Do not show list at all

**State 2 — Has materials, no session history yet**

- No pinned item at top
- Show up to 5 materials, ordered by **oldest added first** (first added = likely their primary goal)
- Each item has a "Start" button
- "See full library" at bottom if they have more than 5 materials

**State 3 — Has materials + session history**

- Last studied material pinned at top with **"Continue"** button
- Below: up to 4 other materials ordered by recency of use, each with a "Start" button
- "See full library" at bottom if they have more than 5 materials

**"See full library" behavior**

- Navigates to Library tab
- Future: this may be where free/paid limit surfaces (free users see only recent 5, full library requires unlock)

All states → selecting any item → navigates to `app/log-session/active-session.tsx`

---

### Reports Tab (`app/(tabs)/reports.tsx`)

- **Period filter**: Week / Month / All Time (pill tabs). Changes `startDate`/`endDate` passed to `getReportData`.
- **Language filter chips**: Only rendered when user has >1 language. "🌍 All" (null) + one chip per language. Changes `activeLanguage` state.
- **Hero card**: TOTAL TIME — always shows filtered total. Label is always "TOTAL TIME".
- **Donut chart**: `DonutChart` receives `byType` data and `chartTotal` (sum of `byType`, not raw total). This ensures the ring is always complete even when the language filter causes fewer segments than the global total.
- **Stats row**: Sessions · Days Studied · DAY STREAK (streak is always global; shows "DAY STREAK 🌍" when language filter active)
- **Most studied**: top material by time in the period/language
- **Units breakdown**: total units (pages/episodes/etc) per type

Data load: `Promise.all([getReportData(start, end, activeLanguage), getStreakCount(), getUserLanguages()])` inside `useFocusEffect`.

---

## Session Flow (Active Timer → Summary → Save)

### Overview

```
BEGIN (dashboard) → material-selector → active-session (timer) → session-summary → Study tab
```

The summary screen appears after the user taps "Stop" on the active timer. It is where all logging happens — nothing is captured during the session itself.

---

### Active Session Screen (`app/log-session/active-session.tsx`)

Full-screen timer. Minimal UI — the goal is to stay out of the way.

- Count-up timer using `Date.now()` start reference (survives backgrounding)
- Shows material name + type at top
- Two actions:
  - **Pause** → timer pauses, button changes to Resume / End
  - **End** → navigates to session-summary, passing `{ materialId, date, elapsedSeconds }`
- No logging happens here

---

### Session Summary Screen (`app/log-session/session-summary.tsx`)

Appears after tapping End. User fills in what they did, then saves.

**Receives params:** `materialId`, `date`, `elapsedSeconds`

**On mount:**

- Load material from DB (`getMaterialById`)
- Pre-fill duration field from `elapsedSeconds` (converted to minutes, rounded)

**Fields — all optional except duration:**

#### Duration (all types)

- Pre-filled from timer elapsed time
- Editable — user may have paused, gotten distracted, etc.
- Displayed as minutes (e.g. "32 min")

#### Book (`type === "book"`)

| Field         | DB column                          | Notes                             |
| ------------- | ---------------------------------- | --------------------------------- |
| Pages read    | `session_activities.pages_read`    | How many pages this session       |
| Chapters read | `session_activities.units_studied` | Advances `materials.current_unit` |

#### Audio (`type === "audio"`)

| Field                       | DB column                             | Notes                             |
| --------------------------- | ------------------------------------- | --------------------------------- |
| Duration                    | `session_activities.duration_minutes` | Pre-filled, editable              |
| Episodes/chapters completed | `session_activities.units_studied`    | Advances `materials.current_unit` |

Subtype hint: if `subtype === "podcast"` label as "Episodes", if `subtype === "audiobook"` label as "Chapters", otherwise "Units".

#### Video (`type === "video"`)

| Field                   | DB column                             | Notes                             |
| ----------------------- | ------------------------------------- | --------------------------------- |
| Duration                | `session_activities.duration_minutes` | Pre-filled, editable              |
| Episodes/videos watched | `session_activities.units_studied`    | Advances `materials.current_unit` |

Subtype hint: if `subtype === "course"` label as "Lessons", otherwise "Episodes".

#### Class (`type === "class"`)

| Field                      | DB column                             | Notes                             |
| -------------------------- | ------------------------------------- | --------------------------------- |
| Duration                   | `session_activities.duration_minutes` | Pre-filled, editable              |
| Lessons/sessions completed | `session_activities.units_studied`    | Advances `materials.current_unit` |

#### App (`type === "app"`)

| Field                      | DB column                             | Notes                             |
| -------------------------- | ------------------------------------- | --------------------------------- |
| Duration                   | `session_activities.duration_minutes` | Pre-filled, editable              |
| Sessions/lessons completed | `session_activities.units_studied`    | Advances `materials.current_unit` |

#### Notes (all types)

- Free text field, at the bottom
- `session_activities.notes`
- Placeholder: "Any thoughts on this session?"

---

### Position auto-advance logic

When `units_studied > 0`, update `materials.current_unit`:

```ts
const newUnit = (material.current_unit || 0) + units_studied;
const capped = material.total_units > 0 ? Math.min(newUnit, material.total_units) : newUnit;
const progressPct = material.total_units > 0 ? (capped / material.total_units) * 100 : 0;
await updateMaterialProgress(materialId, units_studied, progressPct);
```

Pages read does NOT affect `current_unit` — it is session-level data only, used for reporting.

---

### Schema (applied)

All via PRAGMA-check migrations in `database.js`:

```sql
-- session_activities
ALTER TABLE session_activities ADD COLUMN pages_read INTEGER;
ALTER TABLE session_activities ADD COLUMN notes TEXT;
-- user_settings
ALTER TABLE user_settings ADD COLUMN onboarding_completed INTEGER DEFAULT 0;
```

---

## Settings tab (app/(tabs)/settings.tsx)

### Structure

- SafeAreaView edges={['top', 'left', 'right']}
- ScrollView keyboardShouldPersistTaps="handled"
- Section headers use globalStyles.inputLabel (no new style)
- Rows: StyleSheet.hairlineWidth separators, minHeight: 52, last row in section has no border

### My Language section

- "Manage languages" row: tappable, ChevronRight, navigates to `/settings/manage-languages`
- Level row: opens Modal (see below) — NOT a BottomSheet (gesture conflicts)
- Joined row: read-only, shows profile.created_at as "MMM YYYY", no chevron

### App section

- Notifications: toggle OFF by default, UI only
  TODO: implement with expo-notifications — install package, request permissions on
  toggle-on, show time picker, schedule repeating daily local notification.
  Requires physical device to test on iOS.
- Export data / Restore from backup: coming soon Alerts
- About: hardcoded "1.0.0", no chevron

### Destructive zone (no section header)

- "Clear all data": colors.error text, confirmation Alert (functionality coming — stub only)

### Level Modal

- Plain react-native Modal, animationType="slide", transparent backdrop
- Step 1: reason — "🎉 I leveled up!" or "✏️ I picked the wrong level"
- Step 2: level picker, filtered dynamically by sort_order
  - "leveled up": only levels with sort_order > current
  - "correction": all 6 levels
  - C2 + "leveled up": graceful empty state
- On confirm: addLevelChange(code, reason). On "leveled up": toast "🎉 [Label] unlocked!"
- Do NOT use @gorhom/bottom-sheet here — gesture system conflicts with tab screen rows

### Levels reference table

- `levels` table: code (PK), label, sort_order — source of truth for CEFR data
- getLevels() in queries.js returns all rows ORDER BY sort_order ASC
- Hardcoded in onboarding still — TODO: update to read from DB
- level_history seeds with 'beginner' on old installs — invalid code, may need migration

### Toast pattern

- Pure Animated.Value: 300ms in → 2s hold → 300ms out
- pointerEvents="none", bottom: 90
- Reuse for all future toasts — no library needed

### Colors

- colors.error: '#DC2626' — use for all destructive actions

## @gorhom/bottom-sheet — Portal usage rule

- No Portal when BottomSheet is direct child of tab screen SafeAreaView
- Portal only when sheet needs to escape clipping from ScrollView or nested component
- If tab screen row taps stop working near a BottomSheet → switch to plain Modal

---

### Unit label helper

Use `getUnitLabel(type, subtype)` from `src/utils/materialUtils.ts` where possible. If it doesn't cover subtype-aware labels, add overrides inline for now:

```ts
const getSessionUnitLabel = (type: string, subtype?: string): string => {
	if (type === "audio") {
		if (subtype === "podcast") return "Episodes";
		if (subtype === "audiobook") return "Chapters";
		return "Units";
	}
	if (type === "video") return subtype === "course" ? "Lessons" : "Episodes";
	if (type === "class") return "Lessons";
	if (type === "app") return "Sessions";
	if (type === "book") return "Chapters";
	return "Units";
};
```

---

### Save logic

```
1. getOrCreateSessionForDate(date) → sessionId
2. addSessionActivity({ session_id, material_id, duration_minutes, units_studied, pages_read, notes })
3. updateSessionTotalDuration(sessionId)
4. if units_studied > 0 → updateMaterialProgress(materialId, units_studied, progressPct)
5. Haptics success → router.replace("/(tabs)")
```

---

## User Profile & Level History (added [date])

### Schema

- `user_profile` — single row (id = 1). Fields: language_code, learning_since, created_at.
- `level_history` — append-only log. Fields: level ('beginner'|'intermediate'|'advanced'), reason ('leveled_up'|'correction'), changed_at. NEVER update rows.
- Current level = latest row by changed_at DESC, id DESC. Always derived, never stored as a single value.

### Hook

- `useUserProfile` from `@hooks/useUserProfile`
- Exposes: profile, currentLevel, updateLearningSince(date), addLevelChange(level, reason)
- Optimistic local state — no re-fetch needed after writes

### Reports use

- "Learning since" date → time-based streaks and duration copy
- level_history log → progression timeline ("reached Intermediate on X date")
- Never delete level_history rows — they are the historical record

### UI notes

- Duration field should be prominent — it's the one thing that's always filled
- Unit fields should feel lightweight and optional — no asterisks, soft placeholder text
- Notes at the bottom, multiline, not required
- Save button: "Save Session" (full width, primaryAccent)
- Discard: text link at bottom "Discard session"
- Discard should show confirmation Alert before navigating away

---

## Audit Log (Feb 2026)

Codebase audit completed before building session summary screen. Changes made:

**Bugs fixed:**

- `colors.gray100` → `colors.grayLight` in `details.tsx`
- `router.push("/(tabs)")` → `router.replace("/(tabs)")` in `details.tsx`
- `RecentMaterials.tsx` — wrong icons for class/video types, hardcoded category color, duplicated `getRelativeTime` (now imported from `@utils/dateHelper`)
- `LibraryItem.tsx` — removed unused `subtype` prop passed to `ItemMetadata`
- Dead form components deleted: `AudioFormFields`, `VideoFormFields`, `ClassFormFields`, `AppFormFields`
- `totalChapters` field removed from `BookForm` — data was collected but never stored
- Hardcoded hex values replaced with theme constants across `LibraryItem`, `ItemMetadata`, `BookForm`, all `add-material/*.tsx`

**Schema additions (all applied):**

- `session_activities.pages_read INTEGER` — PRAGMA-check migration in `database.js`
- `session_activities.notes TEXT` — same
- `user_settings.onboarding_completed INTEGER DEFAULT 0` — PRAGMA-check migration in `database.js`
- `addSessionActivity` in `queries.js` now accepts and inserts both `pages_read` and `notes`

**Decisions:**

- `total_units` for books = total pages. Chapters tracked as `units_studied` per session only.
- 349 pre-existing TypeScript errors from JS theme files — not fixed here. Future task: convert `src/theme/*.js` → `.ts`
- `validateActivityForm` and `updateMaterialProgress` bugs were already fixed before this audit

**Timer pattern (active-session.tsx):**

> ⚠️ **Background timer:** Do NOT use `AppState` to subtract background time from elapsed. That pattern freezes the timer while the app is backgrounded. The correct approach:
>
> - Store `startTimeRef = Date.now()` (adjusted on resume so the delta always equals total elapsed)
> - Each tick: `elapsed = Date.now() - startTimeRef` — wall-clock delta, naturally includes background time
> - **Pause:** snapshot `elapsedAtPauseRef = elapsed`, call `clearInterval`
> - **Resume:** `startTimeRef = Date.now() - elapsedAtPauseRef * 1000`, call `setInterval` again
> - No AppState listener needed — interval stops firing while backgrounded, and the next tick after foreground correctly shows the real elapsed time

**Skills to create (before building new material types or flows):**

1. `add-material-type` — touches 6+ files: `database.js`, `add-material/index.tsx`, new form screen, `CardCover`, `ItemMetadata`, `RecentMaterials`, `FilterBar`
2. `add-db-column` — PRAGMA-check pattern in `database.js` + update query function + update TS interfaces
3. `add-log-session-screen` — registering screen, wiring params chain (`materialId`, `materialName`, `materialType`, `materialSubtype`, `date`), ensuring `router.replace("/(tabs)")` at end
