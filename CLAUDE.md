# CLAUDE.md — Laara Project Reference

> Read this before writing any code. Update it when conventions change.

---

## Project Overview

**Laara** is a React Native / Expo app for serious language learners — a study logger and material library, not a teaching app.

Target user: AJATT/immersion learners, polyglots, r/languagelearning power users.
Pricing: $4.99 one-time purchase. No subscription.

**Stack:** React Native 0.81 · Expo SDK 54 · TypeScript · Expo Router · SQLite (expo-sqlite)

---

## Folder Structure

```
laara-app/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root: GestureHandlerRootView + PortalProvider + Stack
│   ├── index.tsx                 # Welcome/intro screen
│   ├── language-selection.tsx    # Onboarding step 1 (also used for adding languages, mode=add)
│   ├── history.tsx               # Full session history screen
│   ├── (tabs)/
│   │   ├── index.tsx             # Study/Dashboard tab
│   │   ├── library.tsx           # Library tab
│   │   ├── reports.tsx           # Reports tab
│   │   └── settings.tsx          # Settings tab
│   ├── add-material/             # book.tsx, audio.tsx, video.tsx, class.tsx, app.tsx, index.tsx
│   ├── log-session/              # select-material.tsx, active-session.tsx, session-summary.tsx
│   ├── settings/                 # manage-languages.tsx
│   └── onboarding/               # level-selection.tsx
├── src/
│   ├── components/
│   │   ├── EmptyState.tsx
│   │   ├── addMaterial/          # CategoryCard.tsx
│   │   ├── forms/                # ActionButtons, BookForm, FormHeader, SearchBar, SearchEmptyState, TypeSelectorModal
│   │   ├── icons/                # SVG icons (small/, Nav*.tsx, material type icons)
│   │   ├── logSession/           # ActivityDetailsForm.tsx
│   │   ├── navigation/           # TabIcon.tsx
│   │   ├── svgGraphics/          # Illustration SVGs
│   │   ├── tabs/
│   │   │   ├── library/          # CardCover, FilterBar, FilterChip, ItemMetadata, LibraryItem, LibraryItemActions, ProgressBar
│   │   │   └── study/            # CalendarStrip, CalendarWeek, DashboardHeader, PreviousSessionsCard, RecentMaterials
│   │   └── ui/                   # LanguageSwitcher, ScreenHeader, TopBar
│   ├── database/
│   │   ├── database.js           # initDatabase() — PRAGMA-check migrations on startup
│   │   ├── queries.js            # ALL SQL queries live here
│   │   ├── migrations.js         # migrateLanguages, migrateAllSubcategories
│   │   └── languageData.js       # COMPREHENSIVE_LANGUAGES seed data
│   ├── hooks/                    # useUserProfile.ts
│   ├── theme/                    # colors.js, spacing.js, typography.js, styles.js (all .js not .ts)
│   ├── types/
│   └── utils/                    # activityLogValidation.ts, dateHelper.ts, materialUtils.ts, seedLibraryData.js
```

---

## Naming Conventions

| Thing           | Convention      | Example                              |
| --------------- | --------------- | ------------------------------------ |
| Component files | PascalCase      | `LibraryItem.tsx`                    |
| Route files     | kebab-case      | `add-material/book.tsx`              |
| Query functions | camelCase verbs | `getMaterialById`, `addMaterial`     |
| Theme constants | camelCase       | `colors.primaryAccent`, `spacing.lg` |
| Interfaces      | PascalCase      | `interface Material {}`              |

---

## Screen Structure Pattern

Every screen follows this exact order — do not deviate:

```tsx
export default function SomeScreen() {
	// 1. Params / route
	// 2. State declarations
	// 3. Effects (useEffect, useFocusEffect)
	// 4. Handler functions (handle*)
	// 5. Loading guard (return early)
	// 6. JSX return
}
```

**SafeAreaView rule:** Always pass `edges={['top', 'left', 'right']}` on tab screens — the tab navigator handles bottom safe area.

**Form screen layout:**

```
SafeAreaView
  View (content, flex:1, backgroundColor: colors.gray50)
    FormHeader
    KeyboardAvoidingView (flex:1)
      ScrollView (keyboardShouldPersistTaps="handled")
        [form fields]
    View (buttonContainer — OUTSIDE KeyboardAvoidingView)
      ActionButtons
```

---

## Theme Usage

Always use theme constants. Never hardcode hex values.

```ts
import { colors } from "@theme/colors";
import { spacing, borderRadius } from "@theme/spacing";
import { typography, fonts } from "@theme/typography";
import { globalStyles } from "@theme/styles";
```

**Key colors:** `colors.primaryAccent` (coral) · `colors.gray50` (background) · `colors.grayDarkest/Dark/Medium/Light` · `colors.white` · `colors.categoryBook/Audio/Video/Class/App` + `…Icon` variants · `colors.error` (#DC2626)

**Spacing:** `xs:8` · `sm:12` · `md:16` · `lg:24` · `xl:32` · `xxl:40`

**Border radius:** `sm:6` · `md:10` · `lg:14` · `pill:18` · `button:10` · `input:8`

---

## Design Decisions

**No shadows on cards or buttons.** Use borders instead:

```ts
borderWidth: 1,
borderColor: colors.gray200,
```

Shadows only on modals/bottom sheets.

**SVG checkmarks only.** Never use `✓` unicode — it ignores color styling in React Native.

**Fonts:** Headings use Lora (`fonts.heading.medium`). Body uses system font. All heading weights use `fonts.heading.medium` — not bold. Button text uses `fontWeight: '500'` only.

**Color tokens:** Use semantic tokens (`colors.accentPrimary`, `colors.textPrimary`) in new code. Legacy aliases (`colors.grayDarkest` etc.) exist for backwards compatibility.

---

## Data Layer

**All SQL lives in `src/database/queries.js`.** Never write SQL in components.

**Schema changes** use PRAGMA-check pattern in `database.js` (idempotent, runs on every init):

```js
const cols = db.getAllSync("PRAGMA table_info(your_table)");
const hasCol = cols.some((col) => col.name === "your_column");
if (!hasCol) {
	db.execSync("ALTER TABLE your_table ADD COLUMN your_column TEXT");
}
```

**Date range queries:** Always use `<=` not `<` for today's date. Use `BETWEEN start AND end` (inclusive).

### Key Tables

- `materials` — id, name, type, subtype, author, total_units, current_unit, progress_percentage, language_code
- `daily_sessions` — id, session_date (YYYY-MM-DD, UNIQUE), total_duration
- `session_activities` — id, session_id, material_id, duration_minutes, units_studied, pages_read, notes
- `user_settings` — id=1, primary_language, proficiency_level, onboarding_completed
- `user_languages` — language_code, is_active, added_at
- `languages` — code, name, flag, greeting, is_featured, display_order
- `categories` / `subcategories` — material type taxonomy
- `user_profile` — id=1, language_code, learning_since, created_at
- `level_history` — append-only log: level, reason, changed_at
- `levels` — code (A1–C2), label, sort_order

### Key Query Functions

**Materials:** `getAllMaterials()` · `getMaterialById(id)` · `addMaterial(data)` · `updateMaterial(id, data)` · `updateMaterialProgress(materialId, unitsToAdd, progressPercentage)` — 3 args · `deleteMaterial(id)`

**Sessions:** `getOrCreateTodaySession(date)` · `getTodaySession(date)` · `getSessionByDate(date)` · `getRecentSessions(limit)` · `getAllSessions()` · `getStudyDaysInRange(start, end)` · `getStreakCount()`

**Activities:** `addSessionActivity({session_id, material_id, duration_minutes, units_studied, pages_read, notes})` · `updateSessionTotalDuration(sessionId)` · `getSessionActivities(sessionId)` · `deleteSessionActivity(activityId)` · `getRecentlyStudiedMaterials(limit)`

**Languages:** `getFeaturedLanguages()` · `getAllNonFeaturedLanguages()` · `getLanguageByCode(code)` · `getUserLanguages()` · `addUserLanguage(code)` · `setActiveLanguage(code)` · `removeUserLanguage(code)`

**Settings:** `getUserSettings()` · `updateUserSettings(settings)` · `getOnboardingCompleted()` · `setOnboardingCompleted()` · `getUserLevel()` · `updateUserLevel(level)`

**Profile/Levels:** `getUserProfile()` · `updateLearningSince(date)` · `getCurrentLevel()` · `addLevelChange(level, reason)` · `getLevels()`

**Reports:** `getReportData(startDate, endDate, languageCode?)` — language param optional

**Data management:** `clearLanguageData(languageCode)` · `nukeAllData()` (DEV only)

### Multi-Language Pattern in Queries

```js
const langFilter = languageCode ? "AND (m.language_code = ? OR m.language_code IS NULL)" : "";
const params = languageCode ? [...baseParams, languageCode] : baseParams;
```

Always include `OR language_code IS NULL` to catch legacy materials. Use LEFT JOINs (not INNER) when aggregating sessions.

### Save Session Flow

```
1. getOrCreateTodaySession(date) → sessionId
2. addSessionActivity({ session_id, material_id, duration_minutes, units_studied, pages_read, notes })
3. updateSessionTotalDuration(sessionId)
4. if units_studied > 0 → updateMaterialProgress(materialId, units_studied, progressPct)
5. Haptics success → router.replace("/(tabs)")
```

---

## Navigation

```ts
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";

router.push("/add-material");
router.push({ pathname: "/log-session/select-material", params: { date } });
router.replace("/(tabs)"); // always use replace when exiting a flow
router.back();
```

**Log-session flow exit:** Always use `router.replace("/(tabs)")`, never `router.back()`.

---

## Component Patterns

**TypeSelectorModal** — bottom sheet picker. Requires `<PortalProvider>` in `_layout.tsx` (already present).

**CardCover** — colored tile with category icon. `<CardCover type={material.type} size={44} />`

**useFocusEffect** — use instead of `useEffect` when data should refresh on screen re-focus:

```ts
useFocusEffect(
	useCallback(() => {
		loadData();
	}, [dependency]),
);
```

**Haptics** — on every user action:

```ts
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // navigation, minor
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // primary actions
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // async success
```

**Animated Modal (slide up/down)** — see `LanguageSwitcher.tsx` as reference. Use `modalMounted` state + `Animated.Value(300)` translateY pattern. Never use `animationType="slide"` on Modal itself — it slides the backdrop too.

**@gorhom/bottom-sheet Portal rule** — no Portal when BottomSheet is direct child of tab screen SafeAreaView. Use Portal only when escaping ScrollView/nested clipping. If tab row taps stop working near a BottomSheet → switch to plain Modal.

---

## Timer Pattern (active-session.tsx)

Use `Date.now()` start reference, not interval counter — survives backgrounding:

```ts
// Pause: snapshot elapsed, stop interval
elapsedAtPauseRef.current = Math.floor((Date.now() - startTimeRef.current) / 1000);
// Resume: shift startTime so delta stays correct
startTimeRef.current = Date.now() - elapsedAtPauseRef.current * 1000;
```

---

## Settings Tab Patterns

- Level modal: plain `Modal` (not BottomSheet) — gesture conflicts with tab rows
- Toast pattern: pure `Animated.Value` — 300ms in → 2s hold → 300ms out, `pointerEvents="none"`
- `colors.error`: `#DC2626` for all destructive actions

---

## Product & Monetization

### Freemium Model

| Feature         | Free         | Paid (one-time unlock) |
| --------------- | ------------ | ---------------------- |
| Core logging    | Unlimited    | Unlimited              |
| Materials       | Up to 5      | Unlimited              |
| Session history | Last 30 days | Full history           |
| Analytics       | Basic        | Full                   |

**Rules:**

- Never delete or hide data — only limit what's displayed
- Grandfather existing users — enforce limits only on new additions
- Free tier should feel useful, not punishing

### Paywall (not yet implemented)

- Triggered when free user hits material limit or taps a locked analytics feature
- History screen: show entries for last 30 days free, paywall card inline after that boundary

---

## What's Built ✅

- Onboarding (language selection, level selection, skip)
- Material library (add, edit, delete, filter by type, language filter)
- Log session flow: select-material → active-session (timer, pause/resume) → session-summary → save
- Study tab: greeting, calendar strip, BEGIN button, previous sessions card
- Reports tab: period filter, language filter, donut chart, stats, most studied, units breakdown
- Settings tab: manage languages, level modal (two-step), toast, notifications toggle (UI only)
- Manage languages screen
- History screen (`app/history.tsx`)
- Multi-language support: `user_languages` table, `language_code` on materials, language filter in reports
- Design tokens: `borderRadius.button`, `borderRadius.input`, `globalStyles.input/inputFocused/inputLabel/inputContainer`
- Language switcher (animated slide-up modal from dashboard flag)

## Needs Building 🔨

- Paywall / upgrade screen (implement last, across all limit points)
- Notifications (expo-notifications) — requires physical iOS device
- Export / restore data
- Clear all data (currently language-scoped only)

---

## Open Tech Debt

1. `updateMaterialProgress` called with 2 args in some places — needs 3: `(materialId, unitsToAdd, progressPercentage)`. Fix: fetch material first, calculate percentage.
2. `user_languages.is_active` — no DB constraint enforcing exactly one active row.
3. `getStreakCount()` is always global — no per-language streak yet.
4. Theme files are `.js` not `.ts` — ~349 pre-existing TS errors from this, not worth fixing now.
5. `RecentMaterials.tsx` — `type === "class"` with `subtype === "textbook"` renders wrong icon.

---

## Unit Label Helper

```ts
// src/utils/materialUtils.ts
getUnitLabel(type, count); // "page"/"pages", "episode"/"episodes", etc.
getProgressText(type, current, total); // "Page 45/200"
getActivityText(type, units); // "5 pages"

// Subtype-aware labels for session summary:
const getSessionUnitLabel = (type: string, subtype?: string): string => {
	if (type === "audio") return subtype === "podcast" ? "Episodes" : subtype === "audiobook" ? "Chapters" : "Units";
	if (type === "video") return subtype === "course" ? "Lessons" : "Episodes";
	if (type === "class") return "Lessons";
	if (type === "app") return "Sessions";
	if (type === "book") return "Chapters";
	return "Units";
};
```

---

## Dev Commands

```bash
# Always use --go flag. Without it Expo looks for a dev build which is not
# installed. npx expo start (without --go) will throw a CommandError.
npx expo start --go --clear
```
