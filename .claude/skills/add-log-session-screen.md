# SKILL: Add a Screen to the Log-Session Flow

Use this skill when adding a new step to the log-session flow in Laara.
Read this fully before writing any code.

---

## When to use this skill

- Adding a new step between existing screens (e.g. a session summary screen)
- Replacing an existing step with a new screen
- Adding an optional branch in the flow

---

## The current flow

```
app/(tabs)/index.tsx
  → app/log-session/select-material.tsx   (params: date)
    → app/log-session/details.tsx          (params: materialId, materialName, materialType, materialSubtype, currentProgress, totalProgress, date)
      → router.replace("/(tabs)")
```

**The params chain is the most fragile part.** Every screen must receive all params it needs from the screen before it, and pass forward anything the next screen needs. Missing a param causes a silent `undefined` bug, not a crash.

---

## Step 1 — Map the params chain before writing any code

Write out explicitly what each screen in the new flow needs:

```
select-material  →  [your new screen]  →  details  →  Study tab
receives: date       receives: ?           receives: ?
passes:   all        passes:   all         passes:   nothing
```

Decide this first. Every param must be explicitly passed at every `router.push` call.

---

## Step 2 — Create the screen file

Location: `app/log-session/your-screen-name.tsx`

Use the standard screen shell from `new-screen.md`. Key requirements specific to the log-session flow:

```tsx
export default function YourScreen() {
  // Always destructure ALL params explicitly with types
  const {
    materialId,
    materialName,
    materialType,
    materialSubtype,
    currentProgress,
    totalProgress,
    date,
    // any new params you're adding
  } = useLocalSearchParams<{
    materialId: string;
    materialName: string;
    materialType: string;
    materialSubtype: string;
    currentProgress: string;
    totalProgress: string;
    date: string;
  }>();

  // ALWAYS cast numeric params — Expo Router passes everything as strings
  const materialIdNum = parseInt(materialId, 10);
  const currentProgressNum = parseInt(currentProgress, 10);
  const totalProgressNum = parseInt(totalProgress, 10);
}
```

---

## Step 3 — Wire the navigation

**Incoming navigation** (from the screen before yours):

Find the `router.push` in the previous screen and add your screen to the path:

```ts
// Before: previous screen navigated to details directly
router.push({
  pathname: "/log-session/details",
  params: { materialId, materialName, ... }
});

// After: previous screen navigates to your new screen first
router.push({
  pathname: "/log-session/your-screen-name",
  params: { materialId, materialName, ... }  // pass everything through
});
```

**Outgoing navigation** (from your screen to the next):

```ts
const handleContinue = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  router.push({
    pathname: "/log-session/details",  // or wherever comes next
    params: {
      materialId,
      materialName,
      materialType,
      materialSubtype,
      currentProgress,
      totalProgress,
      date,
      // any new data your screen collected
    },
  });
};
```

**Exit navigation** (abandon the session):

Every log-session screen must have a way to exit cleanly. Use `router.replace` not `router.back`:

```ts
const handleDiscard = () => {
  Alert.alert(
    "Discard session?",
    "Your progress will be lost.",
    [
      { text: "Keep going", style: "cancel" },
      {
        text: "Discard",
        style: "destructive",
        onPress: () => router.replace("/(tabs)"),  // replace, not back
      },
    ]
  );
};
```

> ⚠️ Always use `router.replace("/(tabs)")` to exit the flow, never `router.back()`. This prevents the user from navigating back into a completed or abandoned session.

---

## Step 4 — Register in `_layout.tsx` if needed

Expo Router picks up files automatically, but if the Stack navigator in `app/_layout.tsx` has explicit screen registration, add your screen there:

```tsx
<Stack.Screen
  name="log-session/your-screen-name"
  options={{ headerShown: false }}
/>
```

Check whether other log-session screens are registered explicitly or rely on auto-discovery — match the existing pattern.

---

## Step 5 — Update `select-material.tsx` if the entry point changes

If your new screen is inserted between `select-material` and `details`, update the `router.push` in `select-material.tsx`:

```ts
// Find this in select-material.tsx:
router.push({
  pathname: "/log-session/details",
  params: { ... }
});

// Change to:
router.push({
  pathname: "/log-session/your-screen-name",
  params: { ... }
});
```

---

## Checklist

- [ ] Params chain mapped on paper before writing code
- [ ] Screen file created at `app/log-session/your-screen-name.tsx`
- [ ] All params destructured with explicit TypeScript types
- [ ] Numeric params cast with `parseInt`
- [ ] Incoming navigation updated in the previous screen
- [ ] Outgoing navigation passes ALL params to the next screen
- [ ] Discard uses `router.replace("/(tabs)")` not `router.back()`
- [ ] Back/cancel button present and working
- [ ] Haptics on all user actions
- [ ] Screen registered in `_layout.tsx` if needed
- [ ] Full flow tested end-to-end: Study tab → select material → [your screen] → details → save → Study tab
- [ ] Discard tested: exits cleanly, no way to navigate back into the flow
