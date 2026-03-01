# SKILL: Add a Column to an Existing DB Table

Use this skill whenever adding a new column to an existing SQLite table in Laara.
Read this fully before writing any code.

---

## When to use this skill

- Adding a new field to `materials`, `session_activities`, `daily_sessions`, or `user_settings`
- Storing new data that doesn't fit existing columns

Do NOT use this skill for creating a brand new table — that's a different pattern.

---

## The pattern: PRAGMA-check in `database.js`

Laara does not use versioned migrations. Schema changes use a PRAGMA-check pattern that runs on every app init and is idempotent (safe to run multiple times).

**File:** `src/database/database.js`

Find the section where existing PRAGMA-check migrations live (search for `PRAGMA table_info`). Add your column there:

```js
// Add column to session_activities if it doesn't exist
const sessionActivitiesInfo = db.getAllSync("PRAGMA table_info(session_activities)");
const hasYourColumn = sessionActivitiesInfo.some(col => col.name === "your_column");
if (!hasYourColumn) {
  db.runSync("ALTER TABLE session_activities ADD COLUMN your_column TEXT");
  console.log("Migration: added your_column to session_activities");
}
```

**Rules:**
- Always use `.some(col => col.name === "your_column")` to check existence
- Always log what you did for debugging
- Column type: `TEXT`, `INTEGER`, or `REAL` — no other SQLite types needed
- Default values: SQLite fills new rows with `NULL` by default — this is fine for optional fields
- Never use `NOT NULL` without a `DEFAULT` — it will break existing rows

---

## Step 2 — Update the query function (`src/database/queries.js`)

Find the relevant INSERT or UPDATE function and add your new column.

**For INSERT (adding to what gets saved):**
```js
export const addSessionActivity = (data) => {
  const {
    session_id,
    material_id,
    duration_minutes,
    units_studied = null,
    pages_read = null,      // existing optional
    notes = null,           // existing optional
    your_column = null,     // ADD THIS
  } = data;

  db.runSync(
    `INSERT INTO session_activities 
     (session_id, material_id, duration_minutes, units_studied, pages_read, notes, your_column)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [session_id, material_id, duration_minutes, units_studied, pages_read, notes, your_column]
  );
};
```

**For SELECT (adding to what gets read):**
If you need the new column in query results, find the relevant SELECT and either add it explicitly or confirm `SELECT *` already covers it (it will once the column exists).

---

## Step 3 — Update TypeScript interfaces (if any)

Search for TypeScript interfaces that model this table:

```bash
grep -rn "session_id\|material_id\|duration_minutes" src --include="*.ts" --include="*.tsx"
```

Add your new field to any matching interface:

```ts
interface Activity {
  // existing fields...
  your_column?: string | null;  // optional, nullable to match DB
}
```

---

## Step 4 — Update call sites

Search for everywhere the query function is called and pass the new field if needed:

```bash
grep -rn "addSessionActivity\|updateMaterial" app src --include="*.tsx" --include="*.ts"
```

If the new column is optional and defaults to `null`, existing call sites don't need updating — they'll just pass `null` implicitly.

---

## Checklist

- [ ] PRAGMA-check added to `database.js` (idempotent, logged)
- [ ] Query function updated to accept + insert/update the new column
- [ ] TypeScript interface updated (if one exists for this table)
- [ ] Call sites updated (if the field is required)
- [ ] App launches without crash
- [ ] New column verified: `SELECT * FROM your_table LIMIT 1` returns the column
- [ ] Data saves and reads correctly end-to-end
