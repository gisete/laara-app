# SKILL: Add a New Material Type

Use this skill whenever adding a new material type to Laara.
This touches 7+ files in a specific order — missing any one will cause bugs or crashes.
Read this fully before writing any code.

---

## When to use this skill

- Adding a new top-level type (e.g. "podcast" as its own type, not a subtype of audio)
- Adding a new subtype to an existing type

This skill covers **new top-level types**. For subtypes only, jump to Step 2 (database) and Step 6 (form fields) only.

---

## The 7 files you must touch (in order)

1. `src/database/database.js` — seed subcategories
2. `app/add-material/index.tsx` — category picker card
3. `app/add-material/[newtype].tsx` — new form screen
4. `src/components/ui/CardCover.tsx` — icon + background color
5. `src/components/tabs/library/ItemMetadata.tsx` — type label
6. `src/components/tabs/study/RecentMaterials.tsx` — icon in recent sessions
7. `src/components/tabs/library/FilterBar.tsx` (or wherever the filter chips are defined)

---

## Step 1 — Decide the type string

Pick a short lowercase string. This becomes the value stored in `materials.type`:

```ts
type MaterialType = "book" | "audio" | "video" | "class" | "app" | "your-new-type"
```

---

## Step 2 — Add to database (`src/database/database.js`)

Find where categories and subcategories are seeded. Add:

```js
// In the categories insert block:
{ code: "your-new-type", name: "Display Name", icon: "icon-name" }

// In the subcategories insert block:
{ category_code: "your-new-type", name: "Subtype 1", code: "subtype-1" },
{ category_code: "your-new-type", name: "Subtype 2", code: "subtype-2" },
```

Follow the exact INSERT pattern used by existing categories. Use `INSERT OR IGNORE` to be idempotent.

---

## Step 3 — Add to category picker (`app/add-material/index.tsx`)

Find the array of category cards. Add a new entry:

```ts
{
  code: "your-new-type",
  label: "Display Name",
  description: "One line description",
  icon: <YourIcon />,  // import from src/components/icons/
  color: colors.categoryYourType,  // add color first — see Step 4
}
```

The tap handler already uses `category.code` to navigate to `/add-material/${category.code}` — no changes needed there.

---

## Step 4 — Add icon and color to theme

**`src/theme/colors.js`** — add two entries:
```js
categoryYourType: "#HEX",      // background color for card/cover
categoryYourTypeIcon: "#HEX",  // icon color
```

Pick colors that are visually distinct from existing types:
- Book: warm tan
- Audio: soft purple  
- Video: soft red/pink
- Class: soft blue
- App: soft green

**`src/components/ui/CardCover.tsx`** — add to the type→color and type→icon maps:
```ts
const backgroundColors = {
  // existing...
  "your-new-type": colors.categoryYourType,
};

const iconColors = {
  // existing...
  "your-new-type": colors.categoryYourTypeIcon,
};

// Add the icon render case:
case "your-new-type":
  return <YourIcon color={iconColor} />;
```

---

## Step 5 — Create the form screen (`app/add-material/your-new-type.tsx`)

Copy the closest existing form screen (e.g. `app/add-material/audio.tsx`) as a starting point.

The form screen must:
- Read `params.id` to support edit mode (`isEditMode = !!params.id`)
- Load existing material on mount if in edit mode
- Save via `addMaterial(data)` or `updateMaterial(id, data)`
- Use `FormHeader`, `KeyboardAvoidingView`, `ScrollView`, `ActionButtons` pattern
- Follow the screen structure from `new-screen.md` skill

Required fields for all types:
- Name (required)
- Author/creator (optional label varies by type)
- Subtype picker via `TypeSelectorModal`
- Total units (optional — pages for books, episodes for audio/video, lessons for class/app)

---

## Step 6 — Add label to `ItemMetadata`

**File:** `src/components/tabs/library/ItemMetadata.tsx`

Find where the type label is rendered. Add your new type:

```ts
const typeLabel = {
  book: "Book",
  audio: "Audio",
  video: "Video",
  class: "Class",
  app: "App",
  "your-new-type": "Your Label",
}[material.type] ?? "Unknown";
```

---

## Step 7 — Add icon to `RecentMaterials`

**File:** `src/components/tabs/study/RecentMaterials.tsx`

Find the icon switch/map for material types. Add:

```ts
case "your-new-type":
  return <YourIcon color={colors.categoryYourTypeIcon} />;
```

Also ensure the background color map includes your new type:
```ts
const iconBg = {
  // existing...
  "your-new-type": colors.categoryYourType,
}[material.type] ?? colors.categoryBook;
```

---

## Step 8 — Add to filter bar

Find where filter chips are defined (likely in `app/(tabs)/library.tsx` or a `FilterBar` component).

Add:
```ts
{ label: "Your Label", value: "your-new-type" }
```

---

## Checklist

- [ ] Type string decided and consistent everywhere
- [ ] DB seed data added (category + subcategories)
- [ ] Category picker card added
- [ ] Colors added to `colors.js`
- [ ] `CardCover` updated (background, icon color, icon render)
- [ ] Form screen created with add + edit mode
- [ ] `ItemMetadata` type label added
- [ ] `RecentMaterials` icon added
- [ ] Filter chip added
- [ ] App runs without crash on Library tab
- [ ] New type appears in category picker
- [ ] Can add a material of the new type
- [ ] Material appears in library with correct icon and color
- [ ] Material appears in recently studied with correct icon
